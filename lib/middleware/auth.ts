// lib/middleware/auth.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { verificarAccessToken } from '@/lib/auth/jwt';

export async function verificarAutenticacao(request: NextRequest) {
  try {
    // Pegar token do header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Token não fornecido', status: 401 };
    }

    const token = authHeader.substring(7);

    // Verificar token
    let decoded;
    try {
      decoded = verificarAccessToken(token);
    } catch (error: any) {
      return { error: error.message, status: 401 };
    }

    // Conectar ao banco
    await connectDB();

    // Buscar usuário
    const usuario = await User.findById(decoded.userId).select(
      '-senha -refreshToken'
    );

    if (!usuario) {
      return { error: 'Usuário não encontrado', status: 404 };
    }

    if (!usuario.ativo) {
      return { error: 'Usuário inativo', status: 403 };
    }

    // Retornar usuário
    return {
      user: {
        id: usuario._id.toString(),
        nome: usuario.nome,
        email: usuario.email,
        avatar: usuario.avatar,
        empresa: usuario.empresa,
        cargo: usuario.cargo,
        telefone: usuario.telefone,
      },
    };
  } catch (error: any) {
    console.error('❌ Erro na autenticação:', error);
    return { error: 'Erro ao verificar autenticação', status: 500 };
  }
}
