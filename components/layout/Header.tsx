'use client'

import { useState } from 'react'
import { Bell, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState([
    {
      id: 1,
      title: 'Novo cliente cadastrado',
      message: 'João Silva foi adicionado ao sistema',
      time: '5 min atrás',
      unread: true,
    },
    {
      id: 2,
      title: 'Venda fechada',
      message: 'Proposta aceita no valor de R$ 15.000',
      time: '1 hora atrás',
      unread: true,
    },
    {
      id: 3,
      title: 'Reunião agendada',
      message: 'Reunião com cliente às 14h',
      time: '2 horas atrás',
      unread: false,
    },
  ])

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes, vendas, atividades..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* Dropdown de notificações */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Marcar todas como lidas
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                          notification.unread && 'bg-blue-50'
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          {notification.unread && (
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 p-3 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <Button size="sm" className="hidden md:flex">
            + Nova Venda
          </Button>
        </div>
      </div>
    </header>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}