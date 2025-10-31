// lib/utils/validation.js
import { z } from 'zod'

// Schema de validação para Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

// Schema de validação para Registro
export const registroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  empresa: z.string().min(2, 'Nome da empresa deve ter no mínimo 2 caracteres'),
})

// Schema de validação para Cliente
export const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
})

// Schema de validação para Lead
export const leadSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  status: z.enum(['novo', 'contato', 'qualificado', 'perdido']).default('novo'),
  fonte: z.string().optional(),
  observacoes: z.string().optional(),
})

// Schema de validação para Venda
export const vendaSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  valor: z.number().positive('Valor deve ser positivo'),
  descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  status: z.enum(['pendente', 'pago', 'cancelado']).default('pendente'),
  dataVenda: z.string().optional(),
})

// Função helper para validar dados
export async function validateData(schema, data) {
  try {
    const validatedData = await schema.parseAsync(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    return {
      success: false,
      errors: [{ message: 'Erro na validação dos dados' }]
    }
  }
}