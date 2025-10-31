import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// GET /api/tarefas?status=pendente
export async function GET(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const prioridade = searchParams.get('prioridade')

    let query = db.collection('tarefas')
      .where('userId', '==', usuario.uid)

    if (status) {
      query = query.where('status', '==', status)
    }

    if (prioridade) {
      query = query.where('prioridade', '==', prioridade)
    }

    const snapshot = await query.orderBy('dataVencimento', 'asc').get()

    const tarefas = []
    snapshot.forEach(doc => {
      tarefas.push({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm?.toDate().toISOString(),
        dataVencimento: doc.data().dataVencimento?.toDate().toISOString(),
        concluidoEm: doc.data().concluidoEm?.toDate().toISOString()
      })
    })

    return NextResponse.json({
      sucesso: true,
      total: tarefas.length,
      tarefas
    })

  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar tarefas' },
      { status: 500 }
    )
  }
}

// POST /api/tarefas - Criar tarefa
export async function POST(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      titulo, 
      descricao, 
      dataVencimento, 
      prioridade = 'media',
      tipo = 'geral',
      clienteId,
      leadId
    } = body

    if (!titulo) {
      return NextResponse.json(
        { erro: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    const tarefaRef = await db.collection('tarefas').add({
      userId: usuario.uid,
      titulo,
      descricao: descricao || '',
      dataVencimento: dataVencimento ? new Date(dataVencimento) : null,
      prioridade,
      tipo,
      status: 'pendente',
      clienteId: clienteId || null,
      leadId: leadId || null,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      concluidoEm: null
    })

    // Registrar atividade
    await db.collection('atividades').add({
      userId: usuario.uid,
      tipo: 'tarefa_criada',
      descricao: `Nova tarefa criada: ${titulo}`,
      entidadeId: tarefaRef.id,
      entidadeTipo: 'tarefa',
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      id: tarefaRef.id,
      mensagem: 'Tarefa criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { erro: 'Erro ao criar tarefa' },
      { status: 500 }
    )
  }
}