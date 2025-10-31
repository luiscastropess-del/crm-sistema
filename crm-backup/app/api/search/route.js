// app/api/search/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'

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
    const query = searchParams.get('q')?.toLowerCase()

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query deve ter no mínimo 2 caracteres' },
        { status: 400 }
      )
    }

    // Buscar em paralelo em todas as coleções
    const [clientesSnapshot, leadsSnapshot, vendasSnapshot] = await Promise.all([
      collections.clientes().where('userId', '==', user.id).get(),
      collections.leads().where('userId', '==', user.id).get(),
      collections.vendas().where('userId', '==', user.id).get()
    ])

    // Filtrar clientes
    const clientes = clientesSnapshot.docs
      .map(doc => formatDoc(doc))
      .filter(cliente => 
        cliente.nome?.toLowerCase().includes(query) ||
        cliente.email?.toLowerCase().includes(query) ||
        cliente.empresa?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(c => ({ ...c, tipo: 'cliente' }))

    // Filtrar leads
    const leads = leadsSnapshot.docs
      .map(doc => formatDoc(doc))
      .filter(lead => 
        lead.nome?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.empresa?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(l => ({ ...l, tipo: 'lead' }))

    // Filtrar vendas
    const vendas = vendasSnapshot.docs
      .map(doc => formatDoc(doc))
      .filter(venda => 
        venda.descricao?.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(v => ({ ...v, tipo: 'venda' }))

    // Combinar resultados
    const resultados = [...clientes, ...leads, ...vendas]

    return NextResponse.json({
      success: true,
      resultados,
      total: resultados.length
    })

  } catch (error) {
    console.error('Erro na busca:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar busca' },
      { status: 500 }
    )
  }
}