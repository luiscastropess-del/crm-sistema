import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { generateTokenPair } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, senha } = body

    // Validação
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Todos os campos são obrigatórios' 
        },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Senha deve ter no mínimo 6 caracteres' 
        },
        { status: 400 }
      )
    }

    // Conectar ao banco
    await connectDB()

    // Verificar se usuário já existe
    const usuarioExistente = await User.findOne({ email })
    if (usuarioExistente) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email já cadastrado' 
        },
        { status: 409 }
      )
    }

    // Criar usuário
    const novoUsuario = await User.create({
      nome,
      email,
      senha,
      role: 'user',
    })

    // Gerar tokens
    const tokens = generateTokenPair({
      userId: novoUsuario._id.toString(),
      email: novoUsuario.email,
      role: novoUsuario.role,
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Erro no registro:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao criar usuário',
        details: error.message 
      },
      { status: 500 }
    )
  }
}