// app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { collections } from '@/lib/firebase/admin'
import { generateToken } from '@/lib/utils/jwt'
import { validateData, loginSchema } from '@/lib/utils/validation'

export async function POST(request) {
  try {
    const body = await request.json()

    // Validar dados
    const validation = await validateData(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Buscar usuário por email
    const usersSnapshot = await collections.users()
      .where('email', '==', email)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    const userDoc = usersSnapshot.docs[0]
    const userData = userDoc.data()

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, userData.password)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Gerar token JWT
    const token = generateToken({
      userId: userDoc.id,
      email: userData.email,
      nome: userData.nome
    })

    // Atualizar último login
    await collections.users().doc(userDoc.id).update({
      ultimoLogin: new Date().toISOString()
    })

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userDoc.id,
        nome: userData.nome,
        email: userData.email,
        empresa: userData.empresa
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}