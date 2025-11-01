import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// PATCH /api/notificacoes/[id] - Marcar como lida
export async function PATCH(request, { params }) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    const doc = await db.collection('notificacoes').doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { erro: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    if (doc.data().userId !== usuario.uid) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 403 }
      )
    }

    await db.collection('notificacoes').doc(id).update({
      lida: body.lida !== undefined ? body.lida : true,
      lidaEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Notificação atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    return NextResponse.json(
      { erro: 'Erro ao atualizar notificação' },
      { status: 500 }
    )
  }
}

// DELETE /api/notificacoes/[id]
export async function DELETE(request, { params }) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const doc = await db.collection('notificacoes').doc(id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { erro: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    if (doc.data().userId !== usuario.uid) {
      return NextResponse.json(
        { erro: 'Não autorizado' },
        { status: 403 }
      )
    }

    await db.collection('notificacoes').doc(id).delete()

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Notificação excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir notificação:', error)
    return NextResponse.json(
      { erro: 'Erro ao excluir notificação' },
      { status: 500 }
    )
  }
}