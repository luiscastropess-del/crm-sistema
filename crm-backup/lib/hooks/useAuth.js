// lib/hooks/useAuth.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setLoading(false)
      setAuthenticated(false)
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        setAuthenticated(false)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        setAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setAuthenticated(false)
    router.push('/login')
  }

  return {
    user,
    loading,
    authenticated,
    login,
    logout,
    checkAuth
  }
}