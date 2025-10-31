// app/api/leads/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'
import { validateData, leadSchema } from '@/lib/utils/validation'

// GET - Listar todos os leads
export async function GET(request) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Query base
    let query = collections.leads().where('userId', '==', user.id)

    // Filtrar por status se fornecido
    if (status && status !== 'todos') {
      query = query.where('status', '==', status)
    }

    const leadsSnapshot = await query.orderBy('criadoEm', 'desc').get()
    const leads = leadsSnapshot.docs.map(doc => formatDoc(doc))

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length
    })

  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar leads' },
      { status: 500 }
    )
  }
}

// POST - Criar novo lead
export async function POST(request) {
  try {
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
    const validation = await validateData(leadSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    // Criar lead
    const novoLead = {
      ...validation.data,
      userId: user.id,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    const leadRef = await collections.leads().add(novoLead)

    // Registrar atividade
    await collections.atividades().add({
      userId: user.id,
      tipo: 'lead',
      descricao: `Novo lead cadastrado: ${validation.data.nome}`,
      criadoEm: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Lead criado com sucesso',
      leadId: leadRef.id
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao criar lead' },
      { status: 500 }
    )
  }
}