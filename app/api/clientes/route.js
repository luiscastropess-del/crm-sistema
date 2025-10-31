// app/api/clientes/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'
import { validateData, clienteSchema } from '@/lib/utils/validation'

// GET - Listar todos os clientes
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

    // Buscar clientes do usuário
    const clientesSnapshot = await collections.clientes()
      .where('userId', '==', user.id)
      .orderBy('criadoEm', 'desc')
      .get()

    const clientes = clientesSnapshot.docs.map(doc => formatDoc(doc))

    return NextResponse.json({
      success: true,
      clientes,
      total: clientes.length
    })

  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cliente
export async function POST(request) {
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
    const body = await request.json()

    // Validar dados
    const validation = await validateData(clienteSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    // Criar cliente
    const novoCliente = {
      ...validation.data,
      userId: user.id,
      status: 'ativo',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    const clienteRef = await collections.clientes().add(novoCliente)

    // Registrar atividade
    await collections.atividades().add({
      userId: user.id,
      tipo: 'cliente',
      descricao: `Novo cliente cadastrado: ${validation.data.nome}`,
      criadoEm: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente criado com sucesso',
      clienteId: clienteRef.id
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}