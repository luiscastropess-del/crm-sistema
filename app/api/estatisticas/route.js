import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// GET /api/estatisticas
export async function GET(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    // Buscar todas as coleções em paralelo
    const [clientesSnap, leadsSnap, vendasSnap, tarefasSnap] = await Promise.all([
      db.collection('clientes').where('userId', '==', usuario.uid).get(),
      db.collection('leads').where('userId', '==', usuario.uid).get(),
      db.collection('vendas').where('userId', '==', usuario.uid).get(),
      db.collection('tarefas').where('userId', '==', usuario.uid).get()
    ])

    // Estatísticas de Clientes
    let clientesAtivos = 0
    let clientesInativos = 0
    clientesSnap.forEach(doc => {
      const cliente = doc.data()
      if (cliente.status === 'ativo') clientesAtivos++
      else clientesInativos++
    })

    // Estatísticas de Leads
    let leadsPorStatus = {}
    let leadsPorOrigem = {}
    leadsSnap.forEach(doc => {
      const lead = doc.data()
      leadsPorStatus[lead.status] = (leadsPorStatus[lead.status] || 0) + 1
      leadsPorOrigem[lead.origem] = (leadsPorOrigem[lead.origem] || 0) + 1
    })

    // Estatísticas de Vendas
    let receitaTotal = 0
    let receitaMes = 0
    let vendasPorStatus = {}
    let vendasPorMes = {}
    
    const mesAtual = new Date().getMonth()
    const anoAtual = new Date().getFullYear()

    vendasSnap.forEach(doc => {
      const venda = doc.data()
      
      if (venda.status === 'concluida') {
        receitaTotal += venda.valor || 0
        
        const dataVenda = venda.criadoEm?.toDate()
        if (dataVenda && 
            dataVenda.getMonth() === mesAtual && 
            dataVenda.getFullYear() === anoAtual) {
          receitaMes += venda.valor || 0
        }
      }

      vendasPorStatus[venda.status] = (vendasPorStatus[venda.status] || 0) + 1

      // Agrupar vendas por mês
      const mes = venda.criadoEm?.toDate().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      if (mes) {
        vendasPorMes[mes] = (vendasPorMes[mes] || 0) + (venda.valor || 0)
      }
    })

    // Estatísticas de Tarefas
    let tarefasPendentes = 0
    let tarefasConcluidas = 0
    let tarefasAtrasadas = 0
    const hoje = new Date()

    tarefasSnap.forEach(doc => {
      const tarefa = doc.data()
      
      if (tarefa.status === 'concluida') {
        tarefasConcluidas++
      } else {
        tarefasPendentes++
        
        const dataVencimento = tarefa.dataVencimento?.toDate()
        if (dataVencimento && dataVencimento < hoje) {
          tarefasAtrasadas++
        }
      }
    })

    // Calcular taxas
    const taxaConversaoLeads = leadsSnap.size > 0 
      ? ((leadsPorStatus.convertido || 0) / leadsSnap.size * 100).toFixed(2)
      : 0

    const taxaClientesAtivos = clientesSnap.size > 0
      ? (clientesAtivos / clientesSnap.size * 100).toFixed(2)
      : 0

    const ticketMedio = vendasSnap.size > 0
      ? (receitaTotal / vendasSnap.size).toFixed(2)
      : 0

    return NextResponse.json({
      sucesso: true,
      estatisticas: {
        clientes: {
          total: clientesSnap.size,
          ativos: clientesAtivos,
          inativos: clientesInativos,
          taxaAtivos: taxaClientesAtivos
        },
        leads: {
          total: leadsSnap.size,
          porStatus: leadsPorStatus,
          porOrigem: leadsPorOrigem,
          taxaConversao: taxaConversaoLeads
        },
        vendas: {
          total: vendasSnap.size,
          receitaTotal,
          receitaMes,
          ticketMedio,
          porStatus: vendasPorStatus,
          porMes: vendasPorMes
        },
        tarefas: {
          total: tarefasSnap.size,
          pendentes: tarefasPendentes,
          concluidas: tarefasConcluidas,
          atrasadas: tarefasAtrasadas
        }
      }
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}