'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TarefasPage() {
  const router = useRouter()
  const [tarefas, setTarefas] = useState([])
  const [filtroStatus, setFiltroStatus] = useState('todas')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [novaTarefa, setNovaTarefa] = useState({
    titulo: '',
    descricao: '',
    dataVencimento: '',
    prioridade: 'media',
    tipo: 'geral'
  })

  useEffect(() => {
    carregarTarefas()
  }, [filtroStatus])

  const carregarTarefas = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const url = filtroStatus === 'todas' 
        ? '/api/tarefas'
        : `/api/tarefas?status=${filtroStatus}`

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.sucesso) {
        setTarefas(data.tarefas)
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setCarregando(false)
    }
  }

  const criarTarefa = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      const res = await fetch('/api/tarefas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaTarefa)
      })

      const data = await res.json()
      if (data.sucesso) {
        setMostrarModal(false)
        setNovaTarefa({
          titulo: '',
          descricao: '',
          dataVencimento: '',
          prioridade: 'media',
          tipo: 'geral'
        })
        carregarTarefas()
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
    }
  }

  const concluirTarefa = async (id) => {
    try {
      const token = localStorage.getItem('token')

      await fetch(`/api/tarefas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'concluida' })
      })

      carregarTarefas()
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error)
    }
  }

  const excluirTarefa = async (id) => {
    if (!confirm('Deseja realmente excluir esta tarefa?')) return

    try {
      const token = localStorage.getItem('token')

      await fetch(`/api/tarefas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      carregarTarefas()
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Voltar
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">✅ Tarefas</h1>
            </div>
            <button
              onClick={() => setMostrarModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + Nova Tarefa
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroStatus('todas')}
              className={`px-4 py-2 rounded-lg ${
                filtroStatus === 'todas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroStatus('pendente')}
              className={`px-4 py-2 rounded-lg ${
                filtroStatus === 'pendente'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFiltroStatus('concluida')}
              className={`px-4 py-2 rounded-lg ${
                filtroStatus === 'concluida'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Concluídas
            </button>
          </div>
        </div>

        {/* Lista de Tarefas */}
        {carregando ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando tarefas...</p>
          </div>
        ) : tarefas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tarefas.map(tarefa => (
              <div
                key={tarefa.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tarefa.titulo}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tarefa.prioridade === 'alta' ? 'bg-red-100 text-red-700' :
                        tarefa.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {tarefa.prioridade}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tarefa.status === 'concluida' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {tarefa.status}
                      </span>
                    </div>
                    {tarefa.descricao && (
                      <p className="text-gray-600 mb-2">{tarefa.descricao}</p>
                    )}
                    {tarefa.dataVencimento && (
                      <p className="text-sm text-gray-500">
                        Vence em: {new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {tarefa.status !== 'concluida' && (
                      <button
                        onClick={() => concluirTarefa(tarefa.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        ✓ Concluir
                      </button>
                    )}
                    <button
                      onClick={() => excluirTarefa(tarefa.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Nova Tarefa */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nova Tarefa</h2>
            <form onSubmit={criarTarefa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={novaTarefa.titulo}
                  onChange={(e) => setNovaTarefa({...novaTarefa, titulo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={novaTarefa.descricao}
                  onChange={(e) => setNovaTarefa({...novaTarefa, descricao: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={novaTarefa.dataVencimento}
                  onChange={(e) => setNovaTarefa({...novaTarefa, dataVencimento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={novaTarefa.prioridade}
                  onChange={(e) => setNovaTarefa({...novaTarefa, prioridade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Criar Tarefa
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}