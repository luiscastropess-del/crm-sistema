// scripts/init-firestore.js
// Script para criar índices e regras iniciais no Firestore

const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function initFirestore() {
  console.log('🔥 Inicializando Firestore...')

  try {
    // Criar coleções com documento inicial
    const collections = ['users', 'clientes', 'leads', 'vendas', 'atividades']

    for (const collectionName of collections) {
      const docRef = db.collection(collectionName).doc('_init')
      await docRef.set({
        _initialized: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })
      console.log(`✅ Coleção ${collectionName} criada`)
    }

    console.log('\n✅ Firestore inicializado com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Configure as regras de segurança no Firebase Console')
    console.log('2. Crie os índices compostos necessários')
    console.log('3. Execute npm run dev para iniciar o servidor')

  } catch (error) {
    console.error('❌ Erro ao inicializar Firestore:', error)
  } finally {
    process.exit()
  }
}

initFirestore()