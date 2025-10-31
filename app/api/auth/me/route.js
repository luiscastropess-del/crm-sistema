// app/api/auth/me/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'

export async function GET(request) {
  try {
    // Verificar autenticação
    const authResult = await authenticate(request)
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    // Remover senha antes de retornar
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do usuário' },
      { status: 500 }
    )
  }
}