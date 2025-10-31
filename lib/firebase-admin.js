import admin from 'firebase-admin'

// Verificar se já foi inicializado
if (!admin.apps.length) {
  try {
    // Tentar inicializar com credenciais do ambiente
    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
      })
    } 
    // Fallback: usar variáveis individuais
    else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
      })
    }
    // Desenvolvimento: usar emulador ou credenciais padrão
    else {
      console.warn('⚠️ Firebase Admin: Usando modo de desenvolvimento')
      admin.initializeApp({
        projectId: 'demo-project'
      })
    }

    console.log('✅ Firebase Admin inicializado com sucesso')
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error)
  }
}

// Exportar instâncias
export const db = admin.firestore()
export const auth = admin.auth()
export const storage = admin.storage()

export default admin