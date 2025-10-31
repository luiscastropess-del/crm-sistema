// lib/firebase/admin.js
import admin from 'firebase-admin'

// Inicializar Firebase Admin apenas uma vez
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
    console.log('✅ Firebase Admin inicializado')
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error)
  }
}

// Exportar instâncias
export const db = admin.firestore()
export const auth = admin.auth()
export const storage = admin.storage()

// Helper functions para Firestore
export const collections = {
  users: () => db.collection('users'),
  clientes: () => db.collection('clientes'),
  leads: () => db.collection('leads'),
  vendas: () => db.collection('vendas'),
  atividades: () => db.collection('atividades'),
}

// Função para converter Timestamp do Firestore
export const convertTimestamp = (timestamp) => {
  if (!timestamp) return null
  return timestamp.toDate ? timestamp.toDate().toISOString() : timestamp
}

// Função para formatar documento do Firestore
export const formatDoc = (doc) => {
  if (!doc.exists) return null
  const data = doc.data()
  return {
    id: doc.id,
    ...data,
    criadoEm: convertTimestamp(data.criadoEm),
    atualizadoEm: convertTimestamp(data.atualizadoEm),
  }
}

export default admin