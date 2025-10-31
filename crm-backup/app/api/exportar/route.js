import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

// GET /api/exportar
export async function GET(request) {
  try {
    const usuario = await verificarToken(request)
    if (!usuario) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'clientes'
    const formato = searchParams.get('formato') || 'csv'
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const status = searchParams.get('status')

    let dados = []
    let nomeColecao = tipo

    // Ajustar nome da coleção
    if (tipo === 'relatorio-completo') {
      // Buscar todos os dados
      const [clientes, leads, vendas, tarefas] = await Promise.all([
        buscarDados('clientes', usuario.uid, dataInicio, dataFim, status),
        buscarDados('leads', usuario.uid, dataInicio, dataFim, status),
        buscarDados('vendas', usuario.uid, dataInicio, dataFim, status),
        buscarDados('tarefas', usuario.uid, dataInicio, dataFim, status)
      ])

      if (formato === 'json') {
        dados = { clientes, leads, vendas, tarefas }
      } else {
        // Para CSV/Excel, concatenar tudo
        dados = [
          ...clientes.map(c => ({ tipo: 'Cliente', ...c })),
          ...leads.map(l => ({ tipo: 'Lead', ...l })),
          ...vendas.map(v => ({ tipo: 'Venda', ...v })),
          ...tarefas.map(t => ({ tipo: 'Tarefa', ...t }))
        ]
      }
    } else {
      dados = await buscarDados(nomeColecao, usuario.uid, dataInicio, dataFim, status)
    }

    // Gerar arquivo no formato solicitado
    let conteudo, contentType, extensao

    if (formato === 'json') {
      conteudo = JSON.stringify(dados, null, 2)
      contentType = 'application/json'
      extensao = 'json'
    } else if (formato === 'csv') {
      conteudo = converterParaCSV(dados)
      contentType = 'text/csv'
      extensao = 'csv'
    } else if (formato === 'excel') {
      conteudo = converterParaCSV(dados) // Simplificado - usar biblioteca como xlsx para Excel real
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      extensao = 'xlsx'
    }

    // Registrar atividade
    await db.collection('atividades').add({
      userId: usuario.uid,
      tipo: 'exportacao',
      descricao: `Exportou ${tipo} em formato ${formato}`,
      metadados: { tipo, formato, quantidade: Array.isArray(dados) ? dados.length : 0 },
      criadoEm: new Date()
    })

    // Retornar arquivo
    return new NextResponse(conteudo, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${tipo}_${new Date().toISOString().split('T')[0]}.${extensao}"`
      }
    })

  } catch (error) {
    console.error('Erro ao exportar:', error)
    return NextResponse.json(
      { erro: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}

async function buscarDados(colecao, userId, dataInicio, dataFim, status) {
  let query = db.collection(colecao).where('userId', '==', userId)

  // Aplicar filtros
  if (dataInicio) {
    query = query.where('criadoEm', '>=', new Date(dataInicio))
  }
  if (dataFim) {
    const dataFimDate = new Date(dataFim)
    dataFimDate.setHours(23, 59, 59, 999)
    query = query.where('criadoEm', '<=', dataFimDate)
  }
  if (status && status !== 'todos') {
    query = query.where('status', '==', status)
  }

  const snapshot = await query.get()
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    criadoEm: doc.data().criadoEm?.toDate?.()?.toISOString() || doc.data().criadoEm,
    atualizadoEm: doc.data().atualizadoEm?.toDate?.()?.toISOString() || doc.data().atualizadoEm
  }))
}

function converterParaCSV(dados) {
  if (!dados || dados.length === 0) {
    return 'Nenhum dado encontrado'
  }

  // Obter todas as chaves únicas
  const chaves = [...new Set(dados.flatMap(obj => Object.keys(obj)))]

  // Criar cabeçalho
  const cabecalho = chaves.join(',')

  // Criar linhas
  const linhas = dados.map(obj => {
    return chaves.map(chave => {
      let valor = obj[chave]
      
      // Tratar valores especiais
      if (valor === null || valor === undefined) {
        return ''
      }
      if (typeof valor === 'object') {
        valor = JSON.stringify(valor)
      }
      
      // Escapar vírgulas e aspas
      valor = String(valor).replace(/"/g, '""')
      if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
        valor = `"${valor}"`
      }
      
      return valor
    }).join(',')
  })

  return [cabecalho, ...linhas].join('\n')
}