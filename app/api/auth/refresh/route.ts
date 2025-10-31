import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Refresh token não fornecido' 
        },
        { status: 400 }
      );
    }

    // Verificar refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Refresh token inválido ou expirado' 
        },
        { status: 401 }
      );
    }

    // Gerar novo access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });

  } catch (error) {
    console.error('❌ Erro ao renovar token:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao renovar token' 
      },
      { status: 500 }
    );
  }
}