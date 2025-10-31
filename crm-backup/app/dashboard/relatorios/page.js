'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RelatoriosPage() {
  const router = useRouter()
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas')
  const [periodo, setPeriodo] = useState('mes')
  const [relatorio, setRelatorio] = useState(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    gerarRelatorio()
  }, [tipoRelatorio, periodo])

  const gerarRelatorio = async () => {
    setCarregando(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch(
        `/api/relatorios?tipo=${tipoRelatorio}&periodo=${periodo}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      const data = await res.json()
      if (data.sucesso) {
        setRelatorio(data.dados)
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
    } finally {
      setCarregando(false)
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">📊 Relatórios</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={tipoRelatorio}
                onChange={(e) => setTipoRelatorio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="vendas">Vendas</option>
                <option value="clientes">Clientes</option>
                <option value="leads">Leads</option>
                <option value="completo">Relatório Completo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
                <option value="trimestre">Último Trimestre</option>
                <option value="ano">Último Ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Gerando relatório...</p>
            </div>
          </div>
        ) : relatorio ? (
          <div className="space-y-6">
            {/* Relatório de Vendas */}
            {tipoRelatorio === 'vendas' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total de Vendas</p>
                    <p className="text-3xl font-bold text-gray-900">{relatorio.totalVendas}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Receita Total</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatarMoeda(relatorio.totalReceita)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Ticket Médio</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatarMoeda(relatorio.ticketMedio)}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Vendas por Status</h3>
                  <div className="space-y-2">
                    {Object.entries(relatorio.vendasPorStatus).map(([status, quantidade]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{status}</span>
                        <span className="font-semibold">{quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Relatório de Clientes */}
            {tipoRelatorio === 'clientes' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total de Clientes</p>
                    <p className="text-3xl font-bold text-gray-900">{relatorio.totalClientes}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Clientes Ativos</p>
                    <p className="text-3xl font-bold text-green-600">
                      {relatorio.clientesPorStatus.ativo || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Taxa de Ativos</p>
                    <p className="text-3xl font-bold text-blue-600">{relatorio.taxaAtivos}%</p>
                  </div>
                </div>
              </>
            )}

            {/* Relatório de Leads */}
            {tipoRelatorio === 'leads' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total de Leads</p>
                    <p className="text-3xl font-bold text-gray-900">{relatorio.totalLeads}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Leads Convertidos</p>
                    <p className="text-3xl font-bold text-green-600">
                      {relatorio.leadsPorStatus.convertido || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Taxa de Conversão</p>
                    <p className="text-3xl font-bold text-blue-600">{relatorio.taxaConversao}%</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Leads por Origem</h3>
                  <div className="space-y-2">
                    {Object.entries(relatorio.leadsPorOrigem).map(([origem, quantidade]) => (
                      <div key={origem} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{origem}</span>
                        <span className="font-semibold">{quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Relatório Completo */}
            {tipoRelatorio === 'completo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarMoeda(relatorio.resumo.totalReceita)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {relatorio.resumo.totalClientes}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {relatorio.resumo.totalLeads}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total Vendas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {relatorio.resumo.totalVendas}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Selecione os filtros para gerar o relatório
          </div>
        )}
      </main>
    </div>
  )
}