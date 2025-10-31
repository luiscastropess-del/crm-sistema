import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { gerarToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { nome, email, senha } = body

    // Validações
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { erro: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase()

    // Verificar se email já existe
    const snapshot = await db.collection('users')
      .where('email', '==', emailLower)
      .limit(1)
      .get()

    if (!snapshot.empty) {
      return NextResponse.json(
        { erro: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10)

    // Criar usuário
    const userRef = await db.collection('users').add({
      nome,
      email: emailLower,
      senha: senhaHash,
      avatar: '👤',
      telefone: '',
      empresa: '',
      cargo: '',
      configuracoes: {
        notificacoesEmail: true,
        notificacoesPush: true,
        notificacoesLeads: true,
        notificacoesVendas: true,
        notificacoesTarefas: true,
        tema: 'claro',
        idioma: 'pt-BR',
        fusoHorario: 'America/Sao_Paulo'
      },
      criadoEm: new Date(),
      atualizadoEm: new Date(),
      ultimoLogin: new Date()
    })

    // Gerar token JWT
    const token = gerarToken({
      uid: userRef.id,
      email: emailLower,
      nome
    })

    // Registrar atividade
    await db.collection('atividades').add({
      userId: userRef.id,
      tipo: 'registro',
      descricao: 'Conta criada com sucesso',
      criadoEm: new Date()
    })

    // Criar notificação de boas-vindas
    await db.collection('notificacoes').add({
      userId: userRef.id,
      titulo: 'Bem-vindo ao CRM! 🎉',
      mensagem: 'Sua conta foi criada com sucesso. Comece explorando o sistema!',
      tipo: 'sucesso',
      lida: false,
      criadoEm: new Date()
    })

    return NextResponse.json({
      sucesso: true,
      token,
      usuario: {
        uid: userRef.id,
        nome,
        email: emailLower,
        avatar: '👤'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar conta:', error)
    return NextResponse.json(
      { erro: 'Erro ao processar registro' },
      { status: 500 }
    )
  }
}