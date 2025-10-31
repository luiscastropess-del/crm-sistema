import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// GET /api/atividades?limite=20&tipo=cliente_criado
export async function GET(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limite = parseInt(searchParams.get('limite') || '50')
    const tipo = searchParams.get('tipo')

    let query = db.collection('atividades')
      .where('userId', '==', usuario.uid)
      .orderBy('criadoEm', 'desc')
      .limit(limite)

    if (tipo) {
      query = query.where('tipo', '==', tipo)
    }

    const snapshot = await query.get()

    const atividades = []
    snapshot.forEach(doc => {
      atividades.push({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm?.toDate().toISOString()
      })
    })

    return NextResponse.json({
      sucesso: true,
      total: atividades.length,
      atividades
    })

  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar atividades' },
      { status: 500 }
    )
  }
}

// POST /api/atividades - Criar atividade
export async function POST(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tipo, descricao, entidadeId, entidadeTipo, metadados } = body

    if (!tipo || !descricao) {
      return NextResponse.json(
        { erro: 'Tipo e descrição são obrigatórios' },
        { status: 400 }
      )
    }

    const atividadeRef = await db.collection('atividades').add({
      userId: usuario.uid,
      tipo,
      descricao,
      entidadeId: entidadeId || null,
      entidadeTipo: entidadeTipo || null,
      metadados: metadados || {},
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      id: atividadeRef.id,
      mensagem: 'Atividade registrada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar atividade:', error)
    return NextResponse.json(
      { erro: 'Erro ao criar atividade' },
      { status: 500 }
    )
  }
}