import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// GET /api/notificacoes?lida=false
export async function GET(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lida = searchParams.get('lida')

    let query = db.collection('notificacoes')
      .where('userId', '==', usuario.uid)
      .orderBy('criadoEm', 'desc')
      .limit(50)

    if (lida !== null) {
      query = query.where('lida', '==', lida === 'true')
    }

    const snapshot = await query.get()

    const notificacoes = []
    snapshot.forEach(doc => {
      notificacoes.push({
        id: doc.id,
        ...doc.data(),
        criadoEm: doc.data().criadoEm?.toDate().toISOString()
      })
    })

    // Contar não lidas
    const naoLidasSnapshot = await db.collection('notificacoes')
      .where('userId', '==', usuario.uid)
      .where('lida', '==', false)
      .get()

    return NextResponse.json({
      sucesso: true,
      total: notificacoes.length,
      naoLidas: naoLidasSnapshot.size,
      notificacoes
    })

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar notificações' },
      { status: 500 }
    )
  }
}

// POST /api/notificacoes - Criar notificação
export async function POST(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { titulo, mensagem, tipo = 'info', link } = body

    if (!titulo || !mensagem) {
      return NextResponse.json(
        { erro: 'Título e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    const notificacaoRef = await db.collection('notificacoes').add({
      userId: usuario.uid,
      titulo,
      mensagem,
      tipo,
      link: link || null,
      lida: false,
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      id: notificacaoRef.id,
      mensagem: 'Notificação criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { erro: 'Erro ao criar notificação' },
      { status: 500 }
    )
  }
}

// PATCH /api/notificacoes - Marcar todas como lidas
export async function PATCH(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const snapshot = await db.collection('notificacoes')
      .where('userId', '==', usuario.uid)
      .where('lida', '==', false)
      .get()

    const batch = db.batch()
    snapshot.forEach(doc => {
      batch.update(doc.ref, { lida: true })
    })

    await batch.commit()

    return NextResponse.json({
      sucesso: true,
      mensagem: `${snapshot.size} notificações marcadas como lidas`
    })

  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    return NextResponse.json(
      { erro: 'Erro ao marcar notificações como lidas' },
      { status: 500 }
    )
  }
}