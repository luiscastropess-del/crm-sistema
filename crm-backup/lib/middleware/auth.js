// lib/middleware/auth.js
import { NextResponse } from 'next/server'
import { verifyToken, extractToken } from '@/lib/utils/jwt'
import { collections } from '@/lib/firebase/admin'

// Middleware para verificar autenticação
export async function authenticate(request) {
  try {
    // Extrair token do header
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return {
        error: 'Token não fornecido',
        status: 401
      }
    }

    // Verificar token
    const decoded = verifyToken(token)
    if (!decoded) {
      return {
        error: 'Token inválido ou expirado',
        status: 401
      }
    }

    // Buscar usuário no banco
    const userDoc = await collections.users().doc(decoded.userId).get()
    
    if (!userDoc.exists) {
      return {
        error: 'Usuário não encontrado',
        status: 404
      }
    }

    // Retornar dados do usuário
    return {
      user: {
        id: userDoc.id,
        ...userDoc.data()
      }
    }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return {
      error: 'Erro ao verificar autenticação',
      status: 500
    }
  }
}

// Helper para criar resposta de erro
export function unauthorizedResponse(message = 'Não autorizado') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

// Helper para criar resposta de sucesso
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status })
}

// Helper para criar resposta de erro
export function errorResponse(message, status = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  )
}