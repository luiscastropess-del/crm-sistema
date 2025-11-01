// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { gerarTokens } from '@/lib/auth/jwt';
import { validar, loginSchema } from '@/lib/utils/validation';
import { sucesso, erro, erroValidacao } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    // Pegar dados do body
    const body = await request.json();

    // Validar dados
    const validacao = validar(loginSchema, body);
    if (!validacao.sucesso) {
      return erroValidacao(validacao.erros);
    }

    const { email, senha } = validacao.dados;

    // Conectar ao banco
    await connectDB();

    // Buscar usuário
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return erro('Email ou senha inválidos', 401);
    }

    // Verificar se está ativo
    if (!usuario.ativo) {
      return erro('Usuário inativo', 403);
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return erro('Email ou senha inválidos', 401);
    }

    // Gerar tokens
    const { accessToken, refreshToken } = gerarTokens(
      usuario._id.toString(),
      usuario.email
    );

    // Salvar refresh token e último acesso
    usuario.refreshToken = refreshToken;
    usuario.ultimoAcesso = new Date();
    await usuario.save();

    // Retornar resposta
    return sucesso({
      accessToken,
      refreshToken,
      usuario: {
        id: usuario._id.toString(),
        nome: usuario.nome,
        email: usuario.email,
        avatar: usuario.avatar,
        empresa: usuario.empresa,
        cargo: usuario.cargo,
        telefone: usuario.telefone,
      },
    }, 'Login realizado com sucesso');
  } catch (error: any) {
    console.error('❌ Erro ao fazer login:', error);
    return erro('Erro ao fazer login', 500);
  }
}
