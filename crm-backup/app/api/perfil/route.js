import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// GET /api/perfil
export async function GET(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const doc = await db.collection('users').doc(usuario.uid).get()

    if (!doc.exists) {
      return NextResponse.json(
        { erro: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = doc.data()
    
    // Remover senha do retorno
    delete userData.senha

    return NextResponse.json({
      sucesso: true,
      perfil: {
        ...userData,
        uid: usuario.uid
      }
    })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}

// PUT /api/perfil
export async function PUT(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Campos permitidos para atualização
    const camposPermitidos = {
      nome: body.nome,
      telefone: body.telefone,
      empresa: body.empresa,
      cargo: body.cargo,
      avatar: body.avatar,
      configuracoes: body.configuracoes
    }

    // Remover campos undefined
    Object.keys(camposPermitidos).forEach(key => {
      if (camposPermitidos[key] === undefined) {
        delete camposPermitidos[key]
      }
    })

    // Atualizar perfil
    await db.collection('users').doc(usuario.uid).update({
      ...camposPermitidos,
      atualizadoEm: new Date()
    })

    // Registrar atividade
    await db.collection('atividades').add({
      userId: usuario.uid,
      tipo: 'perfil_atualizado',
      descricao: 'Perfil atualizado com sucesso',
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Perfil atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { erro: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}