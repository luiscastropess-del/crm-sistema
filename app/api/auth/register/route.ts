// app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb'; // ✅ Named import
import User from '@/lib/db/models/User';
import { gerarTokens } from '@/lib/auth/jwt';
import { validar, registroSchema } from '@/lib/utils/validation';
import { sucesso, erro, erroValidacao } from '@/lib/utils/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validacao = validar(registroSchema, body);
    if (!validacao.sucesso) {
      return erroValidacao(validacao.erros);
    }

    const { nome, email, senha, empresa, cargo, telefone } = validacao.dados;

    await connectDB(); // ✅ Usar sem default

    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return erro('Email já está em uso', 400);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await User.create({
      nome,
      email,
      senha: senhaHash,
      empresa: empresa || null,
      cargo: cargo || null,
      telefone: telefone || null,
      ativo: true,
    });

    const { accessToken, refreshToken } = gerarTokens(
      novoUsuario._id.toString(),
      novoUsuario.email
    );

    novoUsuario.refreshToken = refreshToken;
    await novoUsuario.save();

    return sucesso(
      {
        accessToken,
        refreshToken,
        usuario: {
          id: novoUsuario._id.toString(),
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          avatar: novoUsuario.avatar,
          empresa: novoUsuario.empresa,
          cargo: novoUsuario.cargo,
          telefone: novoUsuario.telefone,
        },
      },
      'Usuário criado com sucesso',
      201
    );
  } catch (error: any) {
    console.error('❌ Erro ao registrar usuário:', error);
    return erro('Erro ao criar usuário', 500);
  }
}
