import { NextRequest } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, isTokenBlacklisted } from './jwt';

/**
 * Extrair usuário do request
 */
export function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) return null;

  // Verificar blacklist
  if (isTokenBlacklisted(token)) return null;

  // Verificar e retornar payload
  return verifyAccessToken(token);
}

/**
 * Verificar se usuário está autenticado
 */
export function isAuthenticated(request: NextRequest): boolean {
  return getUserFromRequest(request) !== null;
}

/**
 * Verificar role do usuário
 */
export function hasRole(request: NextRequest, allowedRoles: string[]): boolean {
  const user = getUserFromRequest(request);
  if (!user) return false;
  
  return allowedRoles.includes(user.role || 'user');
}