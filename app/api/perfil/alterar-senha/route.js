import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'
import bcrypt from 'bcryptjs'

// POST /api/perfil/alterar-senha
export async function POST(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { senhaAtual, novaSenha } = body

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { erro: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      )
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { erro: 'Nova senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const doc = await db.collection('users').doc(usuario.uid).get()
    
    if (!doc.exists) {
      return NextResponse.json(
        { erro: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = doc.data()

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, userData.senha)
    if (!senhaValida) {
      return NextResponse.json(
        { erro: 'Senha atual incorreta' },
        { status: 401 }
      )
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10)

    // Atualizar senha
    await db.collection('users').doc(usuario.uid).update({
      senha: novaSenhaHash,
      atualizadoEm: new Date()
    })

    // Registrar atividade
    await db.collection('atividades').add({
      userId: usuario.uid,
      tipo: 'senha_alterada',
      descricao: 'Senha alterada com sucesso',
      criadoEm: new Date()
    })

    // Criar notificação
    await db.collection('notificacoes').add({
      userId: usuario.uid,
      titulo: 'Senha alterada',
      mensagem: 'Sua senha foi alterada com sucesso',
      tipo: 'sucesso',
      lida: false,
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Senha alterada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json(
      { erro: 'Erro ao alterar senha' },
      { status: 500 }
    )
  }
}