import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui-2024'

/**
 * Gerar token JWT
 */
export function gerarToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token válido por 7 dias
  })
}

/**
 * Verificar token JWT
 */
export function verificarTokenJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Extrair token do header Authorization
 */
export function extrairToken(request) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader) {
    return null
  }

  // Formato: "Bearer TOKEN"
  const parts = authHeader.split(' ')
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Verificar token da requisição e retornar usuário
 */
export async function verificarToken(request) {
  try {
    const token = extrairToken(request)
    
    if (!token) {
      return null
    }

    const decoded = verificarTokenJWT(token)
    
    if (!decoded) {
      return null
    }

    return {
      uid: decoded.uid,
      email: decoded.email,
      nome: decoded.nome
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return null
  }
}

/**
 * Middleware de autenticação
 */
export async function requireAuth(request) {
  const usuario = await verificarToken(request)
  
  if (!usuario) {
    throw new Error('Não autorizado')
  }

  return usuario
}