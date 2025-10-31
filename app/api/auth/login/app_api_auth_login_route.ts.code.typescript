import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { generateTokenPair } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, senha } = body

    // Validação
    if (!email || !senha) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email e senha são obrigatórios' 
        },
        { status: 400 }
      )
    }

    // Conectar ao banco
    await connectDB()

    // Buscar usuário (incluindo senha)
    const usuario = await User.findOne({ email }).select('+senha')

    if (!usuario) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Credenciais inválidas' 
        },
        { status: 401 }
      )
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Usuário inativo' 
        },
        { status: 403 }
      )
    }

    // Comparar senha
    const senhaCorreta = await usuario.compararSenha(senha)

    if (!senhaCorreta) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Credenciais inválidas' 
        },
        { status: 401 }
      )
    }

    // Atualizar último acesso
    usuario.ultimoAcesso = new Date()
    await usuario.save()

    // Gerar tokens
    const tokens = generateTokenPair({
      userId: usuario._id.toString(),
      email: usuario.email,
      role: usuario.role,
    })

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        avatar: usuario.avatar,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })

  } catch (error: any) {
    console.error('❌ Erro no login:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao fazer login',
        details: error.message 
      },
      { status: 500 }
    )
  }
}