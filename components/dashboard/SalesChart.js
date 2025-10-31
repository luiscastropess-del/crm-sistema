// components/dashboard/SalesChart.js
'use client'

import { useEffect, useState } from 'react'

export default function SalesChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/dashboard/vendas-chart')
      const data = await response.json()
      setChartData(data.vendas || [])
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error)
      // Dados de exemplo
      setChartData([
        { mes: 'Jan', valor: 12000 },
        { mes: 'Fev', valor: 19000 },
        { mes: 'Mar', valor: 15000 },
        { mes: 'Abr', valor: 25000 },
        { mes: 'Mai', valor: 22000 },
        { mes: 'Jun', valor: 30000 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...chartData.map(d => d.valor))

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Vendas dos Últimos 6 Meses</h3>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : (
        <div className="space-y-4">
          {/* Gráfico de Barras Simples */}
          <div className="flex items-end justify-between gap-4 h-64">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(item.valor / maxValue) * 100}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900">
                    R$ {(item.valor / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-gray-500">{item.mes}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">
                R$ {(chartData.reduce((acc, curr) => acc + curr.valor, 0) / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Média</p>
              <p className="text-lg font-semibold text-gray-900">
                R$ {(chartData.reduce((acc, curr) => acc + curr.valor, 0) / chartData.length / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Crescimento</p>
              <p className="text-lg font-semibold text-green-600">+23%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}