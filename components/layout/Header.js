// components/layout/Header.js
'use client'

import { useState, useEffect } from 'react'
import { Menu, Bell, Search, User } from 'lucide-react'

export default function Header({ toggleSidebar }) {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState(3)

  useEffect(() => {
    // Buscar dados do usuário
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-96">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes, leads..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'usuario@email.com'}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}