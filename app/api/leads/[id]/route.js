// app/api/leads/[id]/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'
import { validateData, leadSchema } from '@/lib/utils/validation'

// GET - Buscar lead por ID
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
    const leadDoc = await collections.leads().doc(id).get()

    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    const lead = formatDoc(leadDoc)

    // Verificar se o lead pertence ao usuário
    if (lead.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      lead
    })

  } catch (error) {
    console.error('Erro ao buscar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lead' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar lead
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

    // Verificar se lead existe
    const leadDoc = await collections.leads().doc(id).get()
    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    const leadData = leadDoc.data()
    if (leadData.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Validar dados
    const validation = await validateData(leadSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    // Atualizar lead
    await collections.leads().doc(id).update({
      ...validation.data,
      atualizadoEm: new Date().toISOString()
    })

    // Registrar atividade se status mudou
    if (leadData.status !== validation.data.status) {
      await collections.atividades().add({
        userId: authResult.user.id,
        tipo: 'lead',
        descricao: `Status do lead ${validation.data.nome} alterado para: ${validation.data.status}`,
        criadoEm: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Lead atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar lead' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar lead
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

    // Verificar se lead existe
    const leadDoc = await collections.leads().doc(id).get()
    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    const leadData = leadDoc.data()
    if (leadData.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Deletar lead
    await collections.leads().doc(id).delete()

    return NextResponse.json({
      success: true,
      message: 'Lead deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar lead' },
      { status: 500 }
    )
  }
}

// PATCH - Converter lead em cliente
export async function PATCH(request, { params }) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { id } = params

    // Buscar lead
    const leadDoc = await collections.leads().doc(id).get()
    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    const leadData = leadDoc.data()
    if (leadData.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Criar cliente a partir do lead
    const novoCliente = {
      nome: leadData.nome,
      email: leadData.email,
      telefone: leadData.telefone || '',
      empresa: leadData.empresa || '',
      userId: authResult.user.id,
      status: 'ativo',
      origem: 'lead',
      leadId: id,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    const clienteRef = await collections.clientes().add(novoCliente)

    // Atualizar status do lead
    await collections.leads().doc(id).update({
      status: 'convertido',
      clienteId: clienteRef.id,
      atualizadoEm: new Date().toISOString()
    })

    // Registrar atividade
    await collections.atividades().add({
      userId: authResult.user.id,
      tipo: 'lead',
      descricao: `Lead ${leadData.nome} convertido em cliente`,
      criadoEm: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Lead convertido em cliente com sucesso',
      clienteId: clienteRef.id
    })

  } catch (error) {
    console.error('Erro ao converter lead:', error)
    return NextResponse.json(
      { error: 'Erro ao converter lead' },
      { status: 500 }
    )
  }
}