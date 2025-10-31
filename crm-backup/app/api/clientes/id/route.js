// app/api/clientes/[id]/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'
import { validateData, clienteSchema } from '@/lib/utils/validation'

// GET - Buscar cliente por ID
export async function GET(request, { params }) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = params
    const clienteDoc = await collections.clientes().doc(id).get()

    if (!clienteDoc.exists) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    const cliente = formatDoc(clienteDoc)

    // Verificar se o cliente pertence ao usuário
    if (cliente.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      cliente
    })

  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cliente
export async function PUT(request, { params }) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = params
    const body = await request.json()

    // Verificar se cliente existe
    const clienteDoc = await collections.clientes().doc(id).get()
    if (!clienteDoc.exists) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    const clienteData = clienteDoc.data()
    if (clienteData.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Validar dados
    const validation = await validateData(clienteSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    // Atualizar cliente
    await collections.clientes().doc(id).update({
      ...validation.data,
      atualizadoEm: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar cliente
export async function DELETE(request, { params }) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = params

    // Verificar se cliente existe
    const clienteDoc = await collections.clientes().doc(id).get()
    if (!clienteDoc.exists) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    const clienteData = clienteDoc.data()
    if (clienteData.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Deletar cliente
    await collections.clientes().doc(id).delete()

    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    )
  }
}