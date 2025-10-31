// app/api/atividades/recentes/route.js
import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/auth'
import { collections, formatDoc } from '@/lib/firebase/admin'

export async function GET(request) {
  try {
    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    // Buscar últimas 10 atividades
    const atividadesSnapshot = await collections.atividades()
      .where('userId', '==', user.id)
      .orderBy('criadoEm', 'desc')
      .limit(10)
      .get()

    const atividades = atividadesSnapshot.docs.map(doc => {
      const atividade = formatDoc(doc)
      
      // Calcular tempo relativo
      const agora = new Date()
      const criado = new Date(atividade.criadoEm)
      const diffMs = agora - criado
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) {
        atividade.tempo = 'Agora'
      } else if (diffMins < 60) {
        atividade.tempo = `${diffMins} min atrás`
      } else if (diffHours < 24) {
        atividade.tempo = `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`
      } else {
        atividade.tempo = `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
      }

      return atividade
    })

    return NextResponse.json({
      success: true,
      atividades
    })

  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar atividades recentes' },
      { status: 500 }
    )
  }
}