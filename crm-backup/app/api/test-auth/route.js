import { NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

export async function GET(request) {
  try {
    // Testar autenticação
    const usuario = await verificarToken(request)
    
    if (!usuario) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Token inválido ou não fornecido'
      }, { status: 401 })
    }

    // Testar Firestore
    const testDoc = await db.collection('_test').doc('test').get()

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Autenticação e Firebase funcionando!',
      usuario: {
        uid: usuario.uid,
        email: usuario.email,
        nome: usuario.nome
      },
      firestore: testDoc.exists ? 'Conectado' : 'Conectado (documento não existe)'
    })

  } catch (error) {
    console.error('Erro no teste:', error)
    return NextResponse.json({
      sucesso: false,
      erro: error.message
    }, { status: 500 })
  }
}