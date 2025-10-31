import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '@/lib/auth/jwt'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export interface AuthRequest extends NextRequest {
  user?: JWTPayload & {
    _id: string
  }
}

/**
 * Middleware para proteger rotas de API
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: AuthRequest, user: any) => Promise<NextResponse>
) {
  try {
    // Extrair token
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token não fornecido' 
        },
        { status: 401 }
      )
    }

    // Verificar token
    const payload = verifyAccessToken(token)

    if (!payload) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token inválido ou expirado' 
        },
        { status: 401 }
      )
    }

    // Conectar ao banco e buscar usuário
    await connectDB()
    const user = await User.findById(payload.userId).select('-senha')

    if (!user || !user.ativo) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Usuário não encontrado ou inativo' 
        },
        { status: 401 }
      )
    }

    // Adicionar usuário ao request
    const authRequest = request as AuthRequest
    authRequest.user = {
      ...payload,
      _id: user._id.toString(),
    }

    // Executar handler
    return await handler(authRequest, user)

  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro na autenticação' 
      },
      { status: 500 }
    )
  }
}

/**
 * Verificar role do usuário
 */
export function requireRole(allowedRoles: string[]) {
  return async (
    request: NextRequest,
    handler: (request: AuthRequest, user: any) => Promise<NextResponse>
  ) => {
    return withAuth(request, async (req, user) => {
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Permissão negada' 
          },
          { status: 403 }
        )
      }
      return handler(req, user)
    })
  }
}