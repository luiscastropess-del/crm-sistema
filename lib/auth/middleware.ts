import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, isTokenBlacklisted } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware para proteger rotas
 */
export async function authMiddleware(request: NextRequest) {
  try {
    // Extrair token
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    // Verificar se está na blacklist
    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar token
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Adicionar usuário ao request
    const response = NextResponse.next();
    response.headers.set('X-User-Id', payload.userId);
    response.headers.set('X-User-Email', payload.email);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro na autenticação' },
      { status: 500 }
    );
  }
}

/**
 * Verificar permissões de role
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const payload = verifyAccessToken(token);

    if (!payload || !allowedRoles.includes(payload.role || 'user')) {
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
}

/**
 * Helper para extrair usuário do request em API Routes
 */
export function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) return null;

  return verifyAccessToken(token);
}