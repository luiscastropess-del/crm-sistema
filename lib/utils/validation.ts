// lib/utils/validation.ts
import { z } from 'zod';

// Schema de Registro
export const registroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  telefone: z.string().optional(),
});

// Schema de Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

// Schema de Atualizar Perfil
export const atualizarPerfilSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  telefone: z.string().optional(),
  avatar: z.string().url('URL inválida').optional(),
});

// Função de validação genérica
export function validar<T>(schema: z.ZodSchema<T>, data: any) {
  try {
    const dados = schema.parse(data);
    return { sucesso: true, dados, erros: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const erros = error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensagem: err.message,
      }));
      return { sucesso: false, dados: null, erros };
    }
    return {
      sucesso: false,
      dados: null,
      erros: [{ campo: 'geral', mensagem: 'Erro de validação' }],
    };
  }
}
