// app/api/auth/refresh/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { verificarRefreshToken, gerarTokens } from '@/lib/auth/jwt';
import { sucesso, erro } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    // Pegar refresh token do body
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return erro('Refresh token não fornecido', 400);
    }

    // Verificar refresh token
    let decoded;
    try {
      decoded = verificarRefreshToken(refreshToken);
    } catch (error: any) {
      return erro(error.message, 401);
    }

    // Conectar ao banco
    await connectDB();

    // Buscar usuário
    const usuario = await User.findById(decoded.userId);
    if (!usuario) {
      return erro('Usuário não encontrado', 404);
    }

    // Verificar se o refresh token é o mesmo salvo no banco
    if (usuario.refreshToken !== refreshToken) {
      return erro('Refresh token inválido', 401);
    }

    // Verificar se está ativo
    if (!usuario.ativo) {
      return erro('Usuário inativo', 403);
    }

    // Gerar novos tokens
    const tokens = gerarTokens(usuario._id.toString(), usuario.email);

    // Salvar novo refresh token
    usuario.refreshToken = tokens.refreshToken;
    await usuario.save();

    return sucesso(tokens, 'Tokens renovados com sucesso');
  } catch (error: any) {
    console.error('❌ Erro ao renovar tokens:', error);
    return erro('Erro ao renovar tokens', 500);
  }
}
