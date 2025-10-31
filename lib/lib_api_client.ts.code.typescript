import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/useAuthStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Criar instância do axios
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Tentar renovar token
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data

        // Atualizar token no store
        useAuthStore.setState({ accessToken })

        // Retentar requisição original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Se falhar, fazer logout
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Funções helper
export const api = {
  // Auth
  auth: {
    login: (email: string, senha: string) =>
      apiClient.post('/auth/login', { email, senha }),
    register: (nome: string, email: string, senha: string) =>
      apiClient.post('/auth/register', { nome, email, senha }),
    logout: () => apiClient.post('/auth/logout'),
    refresh: (refreshToken: string) =>
      apiClient.post('/auth/refresh', { refreshToken }),
  },

  // Clientes
  clientes: {
    listar: (params?: any) => apiClient.get('/clientes', { params }),
    buscar: (id: string) => apiClient.get(`/clientes/${id}`),
    criar: (data: any) => apiClient.post('/clientes', data),
    atualizar: (id: string, data: any) => apiClient.put(`/clientes/${id}`, data),
    deletar: (id: string) => apiClient.delete(`/clientes/${id}`),
  },

  // Vendas
  vendas: {
    listar: (params?: any) => apiClient.get('/vendas', { params }),
    buscar: (id: string) => apiClient.get(`/vendas/${id}`),
    criar: (data: any) => apiClient.post('/vendas', data),
    atualizar: (id: string, data: any) => apiClient.put(`/vendas/${id}`, data),
    deletar: (id: string) => apiClient.delete(`/vendas/${id}`),
  },

  // Atividades
  atividades: {
    listar: (params?: any) => apiClient.get('/atividades', { params }),
    buscar: (id: string) => apiClient.get(`/atividades/${id}`),
    criar: (data: any) => apiClient.post('/atividades', data),
    atualizar: (id: string, data: any) => apiClient.put(`/atividades/${id}`, data),
    deletar: (id: string) => apiClient.delete(`/atividades/${id}`),
    recentes: () => apiClient.get('/atividades/recentes'),
  },
}