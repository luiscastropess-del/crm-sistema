'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotificacoesPage() {
  const router = useRouter()
  const [notificacoes, setNotificacoes] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [carregando, setCarregando] = useState(true)
  const [totalNaoLidas, setTotalNaoLidas] = useState(0)

  useEffect(() => {
    carregarNotificacoes()
    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(carregarNotificacoes, 30000)
    return () => clearInterval(interval)
  }, [filtro])

  const carregarNotificacoes = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const url = filtro === 'todas'
        ? '/api/notificacoes'
        : `/api/notificacoes?lida=${filtro === 'lidas' ? 'true' : 'false'}`

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.sucesso) {
        setNotificacoes(data.notificacoes)
        setTotalNaoLidas(data.naoLidas)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setCarregando(false)
    }
  }

  const marcarComoLida = async (id) => {
    try {
      const token = localStorage.getItem('token')

      await fetch(`/api/notificacoes/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lida: true })
      })

      carregarNotificacoes()
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      const token = localStorage.getItem('token')

      const res = await fetch('/api/notificacoes', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.sucesso) {
        carregarNotificacoes()
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const excluirNotificacao = async (id) => {
    if (!confirm('Deseja realmente excluir esta notificação?')) return

    try {
      const token = localStorage.getItem('token')

      await fetch(`/api/notificacoes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      carregarNotificacoes()
    } catch (error) {
      console.error('Erro ao excluir notificação:', error)
    }
  }

  const getIconePorTipo = (tipo) => {
    const icones = {
      'info': 'ℹ️',
      'sucesso': '✅',
      'aviso': '⚠️',
      'erro': '❌',
      'tarefa': '📋',
      'venda': '💰',
      'cliente': '👤',
      'lead': '🎯',
      'lembrete': '⏰'
    }
    return icones[tipo] || '🔔'
  }

  const getCorPorTipo = (tipo) => {
    const cores = {
      'info': 'bg-blue-100 text-blue-700 border-blue-200',
      'sucesso': 'bg-green-100 text-green-700 border-green-200',
      'aviso': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'erro': 'bg-red-100 text-red-700 border-red-200',
      'tarefa': 'bg-purple-100 text-purple-700 border-purple-200',
      'venda': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'cliente': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'lead': 'bg-orange-100 text-orange-700 border-orange-200',
      'lembrete': 'bg-pink-100 text-pink-700 border-pink-200'
    }
    return cores[tipo] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const formatarDataHora = (dataISO) => {
    const data = new Date(dataISO)
    const agora = new Date()
    const diferencaMs = agora - data
    const diferencaMinutos = Math.floor(diferencaMs / 60000)
    const diferencaHoras = Math.floor(diferencaMinutos / 60)
    const diferencaDias = Math.floor(diferencaHoras / 24)

    if (diferencaMinutos < 1) {
      return 'Agora mesmo'
    } else if (diferencaMinutos < 60) {
      return `Há ${diferencaMinutos} min`
    } else if (diferencaHoras < 24) {
      return `Há ${diferencaHoras}h`
    } else if (diferencaDias < 7) {
      return `Há ${diferencaDias}d`
    } else {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      })
    }
  }

  const agruparPorData = (notificacoes) => {
    const grupos = {
      'Hoje': [],
      'Ontem': [],
      'Esta Semana': [],
      'Mais Antigas': []
    }

    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const semanaAtras = new Date(hoje)
    semanaAtras.setDate(semanaAtras.getDate() - 7)

    notificacoes.forEach(notif => {
      const data = new Date(notif.criadoEm)
      
      if (data.toDateString() === hoje.toDateString()) {
        grupos['Hoje'].push(notif)
      } else if (data.toDateString() === ontem.toDateString()) {
        grupos['Ontem'].push(notif)
      } else if (data >= semanaAtras) {
        grupos['Esta Semana'].push(notif)
      } else {
        grupos['Mais Antigas'].push(notif)
      }
    })

    // Remover grupos vazios
    Object.keys(grupos).forEach(key => {
      if (grupos[key].length === 0) {
        delete grupos[key]
      }
    })

    return grupos
  }

  const notificacoesAgrupadas = agruparPorData(notificacoes)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Voltar
              </Link>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">🔔 Notificações</h1>
                {totalNaoLidas > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {totalNaoLidas}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalNaoLidas > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ✓ Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === 'todas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({notificacoes.length})
            </button>
            <button
              onClick={() => setFiltro('nao-lidas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === 'nao-lidas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Não Lidas ({totalNaoLidas})
            </button>
            <button
              onClick={() => setFiltro('lidas')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filtro === 'lidas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lidas
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando notificações...</p>
            </div>
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-xl text-gray-500 mb-2">
              {filtro === 'nao-lidas' 
                ? 'Você está em dia!'
                : 'Nenhuma notificação encontrada'}
            </p>
            <p className="text-gray-400">
              {filtro === 'nao-lidas'
                ? 'Não há notificações não lidas no momento'
                : 'As notificações aparecerão aqui'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(notificacoesAgrupadas).map(([periodo, notifsDoPeriodo]) => (
              <div key={periodo}>
                {/* Cabeçalho do Período */}
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">{periodo}</h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500">
                    {notifsDoPeriodo.length} notificação{notifsDoPeriodo.length > 1 ? 'ões' : ''}
                  </span>
                </div>

                {/* Notificações do Período */}
                <div className="space-y-3">
                  {notifsDoPeriodo.map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`bg-white rounded-lg shadow hover:shadow-md transition-all ${
                        !notificacao.lida ? 'border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Ícone */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${getCorPorTipo(notificacao.tipo)}`}>
                            {getIconePorTipo(notificacao.tipo)}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-base font-semibold text-gray-900">
                                    {notificacao.titulo}
                                  </h3>
                                  {!notificacao.lida && (
                                    <span className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">
                                  {notificacao.mensagem}
                                </p>

                                {/* Link */}
                                {notificacao.link && (
                                  <Link
                                    href={notificacao.link}
                                    onClick={() => !notificacao.lida && marcarComoLida(notificacao.id)}
                                    className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                  >
                                    Ver detalhes →
                                  </Link>
                                )}

                                {/* Timestamp e Tipo */}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500">
                                    {formatarDataHora(notificacao.criadoEm)}
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-500 capitalize">
                                    {notificacao.tipo}
                                  </span>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex-shrink-0 flex items-center gap-2">
                                {!notificacao.lida && (
                                  <button
                                    onClick={() => marcarComoLida(notificacao.id)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    title="Marcar como lida"
                                  >
                                    ✓
                                  </button>
                                )}
                                <button
                                  onClick={() => excluirNotificacao(notificacao.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Excluir"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        {notificacoes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{notificacoes.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{totalNaoLidas}</p>
                <p className="text-sm text-gray-600 mt-1">Não Lidas</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {notificacoes.filter(n => n.lida).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Lidas</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {notificacoesAgrupadas['Hoje']?.length || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Hoje</p>
              </div>
            </div>
          </div>
        )}

        {/* Legenda de Tipos */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Tipos de Notificação</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { tipo: 'info', label: 'Informação' },
              { tipo: 'sucesso', label: 'Sucesso' },
              { tipo: 'aviso', label: 'Aviso' },
              { tipo: 'erro', label: 'Erro' },
              { tipo: 'tarefa', label: 'Tarefa' },
              { tipo: 'venda', label: 'Venda' },
              { tipo: 'cliente', label: 'Cliente' },
              { tipo: 'lead', label: 'Lead' },
              { tipo: 'lembrete', label: 'Lembrete' }
            ].map(({ tipo, label }) => (
              <div key={tipo} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 ${getCorPorTipo(tipo)}`}>
                  {getIconePorTipo(tipo)}
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}