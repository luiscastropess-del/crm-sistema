import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// GET /api/tarefas/[id]
export async function GET(request, { params }) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const doc = await db.collection('tarefas').doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { erro: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }

    const tarefa = doc.data()

    if (tarefa.userId !== usuario.uid) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      sucesso: true,
      tarefa: {
        id: doc.id,
        ...tarefa,
        criadoEm: tarefa.criadoEm?.toDate().toISOString(),
        dataVencimento: tarefa.dataVencimento?.toDate().toISOString(),
        concluidoEm: tarefa.concluidoEm?.toDate().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro ao buscar tarefa:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar tarefa' },
      { status: 500 }
    )
  }
}

// PUT /api/tarefas/[id]
export async function PUT(request, { params }) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    const doc = await db.collection('tarefas').doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { erro: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }

    if (doc.data().userId !== usuario.uid) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 403 }
      )
    }

    const dadosAtualizacao = {
      ...body,
      atualizadoEm: new Date()
    }

    // Se marcar como concluída, adicionar data de conclusão
    if (body.status === 'concluida' && !doc.data().concluidoEm) {
      dadosAtualizacao.concluidoEm = new Date()
    }

    // Se desmarcar como concluída, remover data de conclusão
    if (body.status !== 'concluida' && doc.data().concluidoEm) {
      dadosAtualizacao.concluidoEm = null
    }

    await db.collection('tarefas').doc(id).update(dadosAtualizacao)

    // Registrar atividade
    await db.collection('atividades').add({
      userId: usuario.uid,
      tipo: 'tarefa_atualizada',
      descricao: `Tarefa atualizada: ${body.titulo || doc.data().titulo}`,
      entidadeId: id,
      entidadeTipo: 'tarefa',
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Tarefa atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return NextResponse.json(
      { erro: 'Erro ao atualizar tarefa' },
      { status: 500 }
    )
  }
}

// DELETE /api/tarefas/[id]
export async function DELETE(request, { params }) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const doc = await db.collection('tarefas').doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { erro: 'Tarefa não encontrada' },
        { status: 404 }
      )
    }

    if (doc.data().userId !== usuario.uid) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 403 }
      )
    }

    await db.collection('tarefas').doc(id).delete()

    // Registrar atividade
    await db.collection('atividades').add({
      userId: usuario.uid,
      tipo: 'tarefa_excluida',
      descricao: `Tarefa excluída: ${doc.data().titulo}`,
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Tarefa excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir tarefa:', error)
    return NextResponse.json(
      { erro: 'Erro ao excluir tarefa' },
      { status: 500 }
    )
  }
}