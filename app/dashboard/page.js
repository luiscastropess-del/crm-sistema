'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [estatisticas, setEstatisticas] = useState(null)
  const [tarefasPendentes, setTarefasPendentes] = useState([])
  const [atividadesRecentes, setAtividadesRecentes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Buscar estatísticas
      const statsRes = await fetch('/api/estatisticas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      if (statsData.sucesso) {
        setEstatisticas(statsData.estatisticas)
      }

      // Buscar tarefas pendentes
      const tarefasRes = await fetch('/api/tarefas?status=pendente', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const tarefasData = await tarefasRes.json()
      if (tarefasData.sucesso) {
        setTarefasPendentes(tarefasData.tarefas.slice(0, 5))
      }

      // Buscar atividades recentes
      const atividadesRes = await fetch('/api/atividades?limite=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const atividadesData = await atividadesRes.json()
      if (atividadesData.sucesso) {
        setAtividadesRecentes(atividadesData.atividades)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
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

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/notificacoes"
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                🔔
                {estatisticas?.notificacoes?.naoLidas > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {estatisticas.notificacoes.naoLidas}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard/perfil"
                className="text-gray-600 hover:text-gray-900"
              >
                👤 Perfil
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/login')
                }}
                className="text-red-600 hover:text-red-700"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Clientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estatisticas?.clientes?.total || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {estatisticas?.clientes?.taxaAtivos}% ativos
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          {/* Leads */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Leads</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estatisticas?.leads?.total || 0}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {estatisticas?.leads?.taxaConversao}% conversão
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          {/* Receita */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatarMoeda(estatisticas?.vendas?.receitaTotal || 0)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {formatarMoeda(estatisticas?.vendas?.receitaMes || 0)} este mês
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          {/* Tarefas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tarefas Pendentes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estatisticas?.tarefas?.pendentes || 0}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  {estatisticas?.tarefas?.atrasadas || 0} atrasadas
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Menu de Navegação */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard/clientes"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">👥</div>
            <p className="font-semibold text-gray-900">Clientes</p>
          </Link>

          <Link
            href="/dashboard/leads"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">🎯</div>
            <p className="font-semibold text-gray-900">Leads</p>
          </Link>

          <Link
            href="/dashboard/vendas"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">💰</div>
            <p className="font-semibold text-gray-900">Vendas</p>
          </Link>

          <Link
            href="/dashboard/tarefas"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold text-gray-900">Tarefas</p>
          </Link>

          <Link
            href="/dashboard/relatorios"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📊</div>
            <p className="font-semibold text-gray-900">Relatórios</p>
          </Link>

          <Link
            href="/dashboard/atividades"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📋</div>
            <p className="font-semibold text-gray-900">Atividades</p>
          </Link>

          <Link
            href="/dashboard/exportar"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📥</div>
            <p className="font-semibold text-gray-900">Exportar</p>
          </Link>

          <Link
            href="/dashboard/perfil"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">⚙️</div>
            <p className="font-semibold text-gray-900">Configurações</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tarefas Pendentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">✅ Tarefas Pendentes</h2>
              <Link
                href="/dashboard/tarefas"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Ver todas →
              </Link>
            </div>

            {tarefasPendentes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma tarefa pendente</p>
            ) : (
              <div className="space-y-3">
                {tarefasPendentes.map(tarefa => (
                  <div
                    key={tarefa.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{tarefa.titulo}</p>
                      {tarefa.dataVencimento && (
                        <p className="text-sm text-gray-600">
                          Vence em: {new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tarefa.prioridade === 'alta' ? 'bg-red-100 text-red-700' :
                      tarefa.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {tarefa.prioridade}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📋 Atividades Recentes</h2>
              <Link
                href="/dashboard/atividades"
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Ver todas →
              </Link>
            </div>

            {atividadesRecentes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
            ) : (
              <div className="space-y-3">
                {atividadesRecentes.map(atividade => (
                  <div
                    key={atividade.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">
                      {atividade.tipo === 'cliente_criado' && '👤'}
                      {atividade.tipo === 'lead_criado' && '🎯'}
                      {atividade.tipo === 'venda_criada' && '💰'}
                      {atividade.tipo === 'tarefa_criada' && '✅'}
                      {!['cliente_criado', 'lead_criado', 'venda_criada', 'tarefa_criada'].includes(atividade.tipo) && '📝'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{atividade.descricao}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(atividade.criadoEm).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}