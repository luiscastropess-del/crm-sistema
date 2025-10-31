// app/(dashboard)/leads/page.js
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('todos')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = filterStatus === 'todos' 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus)

  const statusColors = {
    novo: 'bg-blue-100 text-blue-800',
    contato: 'bg-yellow-100 text-yellow-800',
    qualificado: 'bg-green-100 text-green-800',
    perdido: 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Gerencie seus leads e oportunidades</p>
        </div>
        <Link href="/leads/novo" className="btn-primary">
          + Novo Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-2">
          {['todos', 'novo', 'contato', 'qualificado', 'perdido'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nenhum lead encontrado</p>
          <Link href="/leads/novo" className="text-blue-600 hover:underline mt-2 inline-block">
            Criar primeiro lead
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">{lead.nome}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 {lead.email}</p>
                  {lead.telefone && <p>📱 {lead.telefone}</p>}
                  {lead.empresa && <p>🏢 {lead.empresa}</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Criado em {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}