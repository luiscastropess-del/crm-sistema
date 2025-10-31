// scripts/test-firebase.js
require('dotenv').config({ path: '.env.local' })
const admin = require('firebase-admin')

console.log('🔥 Testando conexão com Firebase...\n')

// Verificar variáveis de ambiente
console.log('📋 Verificando variáveis de ambiente:')
console.log('✓ FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅' : '❌')
console.log('✓ FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅' : '❌')
console.log('✓ FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅' : '❌')
console.log('✓ JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌')
console.log('')

// Tentar inicializar Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })

  console.log('✅ Firebase Admin inicializado com sucesso!')
  
  // Testar conexão com Firestore
  const db = admin.firestore()
  
  db.collection('_test').doc('connection').set({
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    message: 'Teste de conexão bem-sucedido'
  }).then(() => {
    console.log('✅ Conexão com Firestore bem-sucedida!')
    console.log('✅ Documento de teste criado!')
    
    // Limpar documento de teste
    return db.collection('_test').doc('connection').delete()
  }).then(() => {
    console.log('✅ Documento de teste removido!')
    console.log('\n🎉 TUDO FUNCIONANDO PERFEITAMENTE!')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Erro ao testar Firestore:', error.message)
    process.exit(1)
  })

} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message)
  console.log('\n💡 Dicas:')
  console.log('1. Verifique se o arquivo .env.local existe')
  console.log('2. Verifique se as credenciais estão corretas')
  console.log('3. Verifique se FIREBASE_PRIVATE_KEY tem as quebras de linha (\\n)')
  process.exit(1)
}