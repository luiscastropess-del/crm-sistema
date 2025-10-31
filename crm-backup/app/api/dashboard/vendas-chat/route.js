// app/api/dashboard/vendas-chart/route.js
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

    // Buscar todas as vendas pagas
    const vendasSnapshot = await collections.vendas()
      .where('userId', '==', user.id)
      .where('status', '==', 'pago')
      .get()

    // Agrupar vendas por mês (últimos 6 meses)
    const agora = new Date()
    const meses = []
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        ano: data.getFullYear(),
        mesNum: data.getMonth(),
        valor: 0
      })
    }

    // Somar valores por mês
    vendasSnapshot.docs.forEach(doc => {
      const venda = doc.data()
      const dataVenda = new Date(venda.dataVenda || venda.criadoEm)
      const mesVenda = dataVenda.getMonth()
      const anoVenda = dataVenda.getFullYear()

      const mesIndex = meses.findIndex(m => m.mesNum === mesVenda && m.ano === anoVenda)
      if (mesIndex !== -1) {
        meses[mesIndex].valor += venda.valor || 0
      }
    })

    // Formatar resposta
    const vendas = meses.map(m => ({
      mes: m.mes.charAt(0).toUpperCase() + m.mes.slice(1),
      valor: Math.round(m.valor)
    }))

    return NextResponse.json({
      success: true,
      vendas
    })

  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do gráfico' },
      { status: 500 }
    )
  }
}