// app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import { verificarAutenticacao } from '@/lib/middleware/auth';
import { sucesso, erro } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await verificarAutenticacao(request);
    if (auth.error) {
      return erro(auth.error, auth.status);
    }

    return sucesso(auth.user, 'Usuário obtido com sucesso');
  } catch (error: any) {
    console.error('❌ Erro ao obter usuário:', error);
    return erro('Erro ao obter usuário', 500);
  }
}
