// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections } from '@/lib/firebase/admin'

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

    // Buscar dados em paralelo
    const [clientesSnapshot, leadsSnapshot, vendasSnapshot] = await Promise.all([
      collections.clientes().where('userId', '==', user.id).get(),
      collections.leads().where('userId', '==', user.id).get(),
      collections.vendas().where('userId', '==', user.id).get()
    ])

    // Contar totais
    const totalClientes = clientesSnapshot.size
    const totalLeads = leadsSnapshot.docs.filter(doc => 
      doc.data().status !== 'convertido' && doc.data().status !== 'perdido'
    ).length

    // Calcular vendas do mês atual
    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    
    const vendasMes = vendasSnapshot.docs
      .filter(doc => {
        const venda = doc.data()
        const dataVenda = new Date(venda.dataVenda || venda.criadoEm)
        return dataVenda >= inicioMes && venda.status === 'pago'
      })
      .reduce((total, doc) => total + (doc.data().valor || 0), 0)

    // Calcular taxa de conversão
    const leadsConvertidos = leadsSnapshot.docs.filter(doc => 
      doc.data().status === 'convertido'
    ).length
    const totalLeadsHistorico = leadsSnapshot.size
    const taxaConversao = totalLeadsHistorico > 0 
      ? Math.round((leadsConvertidos / totalLeadsHistorico) * 100) 
      : 0

    // Calcular crescimento (comparar com mês anterior)
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0)
    
    const vendasMesAnterior = vendasSnapshot.docs
      .filter(doc => {
        const venda = doc.data()
        const dataVenda = new Date(venda.dataVenda || venda.criadoEm)
        return dataVenda >= inicioMesAnterior && dataVenda <= fimMesAnterior && venda.status === 'pago'
      })
      .reduce((total, doc) => total + (doc.data().valor || 0), 0)

    const crescimentoVendas = vendasMesAnterior > 0
      ? Math.round(((vendasMes - vendasMesAnterior) / vendasMesAnterior) * 100)
      : 0

    return NextResponse.json({
      success: true,
      totalClientes,
      totalLeads,
      vendasMes,
      taxaConversao,
      crescimentoVendas,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}