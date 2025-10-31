import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { gerarToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { erro: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário por email
    const snapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json(
        { erro: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const userDoc = snapshot.docs[0]
    const userData = userDoc.data()

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, userData.senha)
    
    if (!senhaValida) {
      return NextResponse.json(
        { erro: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = gerarToken({
      uid: userDoc.id,
      email: userData.email,
      nome: userData.nome
    })

    // Atualizar último login
    await db.collection('users').doc(userDoc.id).update({
      ultimoLogin: new Date()
    })

    // Registrar atividade
    await db.collection('atividades').add({
      userId: userDoc.id,
      tipo: 'login',
      descricao: 'Login realizado com sucesso',
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      token,
      usuario: {
        uid: userDoc.id,
        nome: userData.nome,
        email: userData.email,
        avatar: userData.avatar || '👤'
      }
    })

  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { erro: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}