// lib/utils/response.ts
import { NextResponse } from 'next/server';

export function sucesso(dados: any, mensagem = 'Sucesso', status = 200) {
  return NextResponse.json(
    {
      sucesso: true,
      mensagem,
      dados,
    },
    { status }
  );
}

export function erro(mensagem: string, status = 400) {
  return NextResponse.json(
    {
      sucesso: false,
      erro: mensagem,
    },
    { status }
  );
}

export function erroValidacao(erros: any[]) {
  return NextResponse.json(
    {
      sucesso: false,
      erro: 'Erro de validação',
      erros,
    },
    { status: 400 }
  );
}
