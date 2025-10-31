import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Por favor, defina MONGODB_URI no .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
}

if (!global.mongoose) {
  global.mongoose = cached
}

/**
 * Conectar ao MongoDB com cache para evitar múltiplas conexões
 */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
    console.log('✅ MongoDB conectado com sucesso')
  } catch (e) {
    cached.promise = null
    console.error('❌ Erro ao conectar MongoDB:', e)
    throw e
  }

  return cached.conn
}

/**
 * Desconectar do MongoDB
 */
export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect()
    cached.conn = null
    cached.promise = null
    console.log('🔌 MongoDB desconectado')
  }
}

/**
 * Verificar status da conexão
 */
export function isConnected() {
  return mongoose.connection.readyState === 1
}