import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { generateTokenPair } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validação
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email e senha são obrigatórios' 
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email inválido' 
        },
        { status: 400 }
      );
    }

    // Autenticar no Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Gerar tokens JWT
    const tokens = generateTokenPair({
      userId: user.uid,
      email: user.email!,
      role: 'user',
    });

    // Retornar resposta
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        emailVerified: user.emailVerified,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

  } catch (error: any) {
    console.error('❌ Erro no login:', error);

    // Mensagens de erro amigáveis
    let errorMessage = 'Erro ao fazer login';
    let statusCode = 500;

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Usuário não encontrado';
        statusCode = 404;
        break;
      case 'auth/wrong-password':
        errorMessage = 'Senha incorreta';
        statusCode = 401;
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        statusCode = 400;
        break;
      case 'auth/user-disabled':
        errorMessage = 'Usuário desabilitado';
        statusCode = 403;
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
        statusCode = 429;
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Erro de conexão. Verifique sua internet';
        statusCode = 503;
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Credenciais inválidas';
        statusCode = 401;
        break;
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: error.code 
      },
      { status: statusCode }
    );
  }
}