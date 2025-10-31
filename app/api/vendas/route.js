// app/api/vendas/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'
import { validateData, vendaSchema } from '@/lib/utils/validation'

// GET - Listar todas as vendas
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
    const clienteId = searchParams.get('clienteId')

    // Query base
    let query = collections.vendas().where('userId', '==', user.id)

    // Filtros opcionais
    if (status && status !== 'todos') {
      query = query.where('status', '==', status)
    }
    if (clienteId) {
      query = query.where('clienteId', '==', clienteId)
    }

    const vendasSnapshot = await query.orderBy('criadoEm', 'desc').get()
    
    // Buscar dados dos clientes
    const vendas = await Promise.all(
      vendasSnapshot.docs.map(async (doc) => {
        const venda = formatDoc(doc)
        
        // Buscar dados do cliente
        if (venda.clienteId) {
          const clienteDoc = await collections.clientes().doc(venda.clienteId).get()
          if (clienteDoc.exists) {
            venda.cliente = {
              id: clienteDoc.id,
              nome: clienteDoc.data().nome,
              email: clienteDoc.data().email
            }
          }
        }
        
        return venda
      })
    )

    // Calcular totais
    const totais = {
      total: vendas.reduce((acc, v) => acc + (v.valor || 0), 0),
      pendente: vendas.filter(v => v.status === 'pendente').reduce((acc, v) => acc + v.valor, 0),
      pago: vendas.filter(v => v.status === 'pago').reduce((acc, v) => acc + v.valor, 0),
      cancelado: vendas.filter(v => v.status === 'cancelado').reduce((acc, v) => acc + v.valor, 0)
    }

    return NextResponse.json({
      success: true,
      vendas,
      total: vendas.length,
      totais
    })

  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vendas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova venda
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
    const validation = await validateData(vendaSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      )
    }

    // Verificar se cliente existe
    const clienteDoc = await collections.clientes().doc(validation.data.clienteId).get()
    if (!clienteDoc.exists) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Criar venda
    const novaVenda = {
      ...validation.data,
      userId: user.id,
      dataVenda: validation.data.dataVenda || new Date().toISOString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    const vendaRef = await collections.vendas().add(novaVenda)

    // Registrar atividade
    await collections.atividades().add({
      userId: user.id,
      tipo: 'venda',
      descricao: `Nova venda registrada: R$ ${validation.data.valor.toLocaleString('pt-BR')}`,
      criadoEm: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Venda criada com sucesso',
      vendaId: vendaRef.id
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json(
      { error: 'Erro ao criar venda' },
      { status: 500 }
    )
  }
}