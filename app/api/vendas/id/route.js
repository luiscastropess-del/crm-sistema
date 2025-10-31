// app/api/vendas/[id]/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'
import { validateData, vendaSchema } from '@/lib/utils/validation'

// GET - Buscar venda por ID
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
    const vendaDoc = await collections.vendas().doc(id).get()

    if (!vendaDoc.exists) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    const venda = formatDoc(vendaDoc)

    // Verificar permissão
    if (venda.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar dados do cliente
    if (venda.clienteId) {
      const clienteDoc = await collections.clientes().doc(venda.clienteId).get()
      if (clienteDoc.exists) {
        venda.cliente = formatDoc(clienteDoc)
      }
    }

    return NextResponse.json({
      success: true,
      venda
    })

  } catch (error) {
    console.error('Erro ao buscar venda:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar venda' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar venda
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

    // Verificar se venda existe
    const vendaDoc = await collections.vendas().doc(id).get()
    if (!vendaDoc.exists) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    const vendaData = vendaDoc.data()
    if (vendaData.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Validar dados
    const validation = await validateData(vendaSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    // Atualizar venda
    await collections.vendas().doc(id).update({
      ...validation.data,
      atualizadoEm: new Date().toISOString()
    })

    // Registrar atividade se status mudou
    if (vendaData.status !== validation.data.status) {
      await collections.atividades().add({
        userId: authResult.user.id,
        tipo: 'venda',
        descricao: `Status da venda alterado para: ${validation.data.status}`,
        criadoEm: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Venda atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar venda:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar venda' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar venda
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

    // Verificar se venda existe
    const vendaDoc = await collections.vendas().doc(id).get()
    if (!vendaDoc.exists) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      )
    }

    const vendaData = vendaDoc.data()
    if (vendaData.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Deletar venda
    await collections.vendas().doc(id).delete()

    return NextResponse.json({
      success: true,
      message: 'Venda deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar venda:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar venda' },
      { status: 500 }
    )
  }
}