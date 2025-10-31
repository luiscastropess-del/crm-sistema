import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, blacklistToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Extrair token
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      // Adicionar à blacklist
      blacklistToken(token);
    }

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });

  } catch (error) {
    console.error('❌ Erro no logout:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao fazer logout' 
      },
      { status: 500 }
    );
  }
}