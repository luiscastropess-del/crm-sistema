import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutos
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 dias

// Validar se o secret existe
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

// Tipos
export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Gerar Access Token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role || 'user',
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'crm-sistema',
      audience: 'crm-users',
    }
  );
}

/**
 * Gerar Refresh Token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'crm-sistema',
      audience: 'crm-users',
    }
  );
}

/**
 * Gerar par de tokens (Access + Refresh)
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verificar Access Token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'crm-sistema',
      audience: 'crm-users',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Token inválido');
    }
    return null;
  }
}

/**
 * Verificar Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'crm-sistema',
      audience: 'crm-users',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extrair token do header Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Decodificar token sem verificar (útil para debug)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verificar se o token está próximo de expirar
 * Retorna true se faltar menos de 5 minutos
 */
export function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - now;
  
  return timeLeft < 300; // 5 minutos
}

/**
 * Blacklist de tokens (usar Redis em produção)
 */
const tokenBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

/**
 * Limpar tokens expirados da blacklist (executar periodicamente)
 */
export function cleanBlacklist(): void {
  tokenBlacklist.forEach((token) => {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        tokenBlacklist.delete(token);
      }
    }
  });
}