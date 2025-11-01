// app/api/auth/logout/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { verificarAutenticacao } from '@/lib/middleware/auth';
import { sucesso, erro } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await verificarAutenticacao(request);
    if (auth.error) {
      return erro(auth.error, auth.status);
    }

    // Conectar ao banco
    await connectDB();

    // Remover refresh token do usuário
    await User.findByIdAndUpdate(auth.user.id, {
      refreshToken: null,
    });

    return sucesso(null, 'Logout realizado com sucesso');
  } catch (error: any) {
    console.error('❌ Erro ao fazer logout:', error);
    return erro('Erro ao fazer logout', 500);
  }
}
