// components/dashboard/StatsCard.js
import { Users, Target, DollarSign, TrendingUp } from 'lucide-react'

export default function StatsCard({ title, value, icon, color, trend }) {
  const icons = {
    users: Users,
    target: Target,
    dollar: DollarSign,
    trending: TrendingUp
  }

  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  const Icon = icons[icon] || Users

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${
              trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend} vs mês anterior
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}