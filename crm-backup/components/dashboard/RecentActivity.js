// components/dashboard/RecentActivity.js
'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export default function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/atividades/recentes')
      const data = await response.json()
      setActivities(data.atividades || [])
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
      // Dados de exemplo para desenvolvimento
      setActivities([
        {
          id: 1,
          tipo: 'lead',
          descricao: 'Novo lead cadastrado: João Silva',
          tempo: '5 min atrás'
        },
        {
          id: 2,
          tipo: 'venda',
          descricao: 'Venda fechada: R$ 5.000',
          tempo: '1 hora atrás'
        },
        {
          id: 3,
          tipo: 'cliente',
          descricao: 'Cliente atualizado: Maria Santos',
          tempo: '2 horas atrás'
        },
        {
          id: 4,
          tipo: 'tarefa',
          descricao: 'Tarefa concluída: Follow-up cliente',
          tempo: '3 horas atrás'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (tipo) => {
    const icons = {
      lead: '🎯',
      venda: '💰',
      cliente: '👤',
      tarefa: '✅'
    }
    return icons[tipo] || '📌'
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma atividade recente
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
              <div className="text-2xl">{getActivityIcon(activity.tipo)}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.descricao}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{activity.tempo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}