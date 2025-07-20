import { z } from 'zod'

// Validação de cadastro de usuário
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
})

// Validação de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

// Validação de criação de dívida
export const createDebtSchema = z.object({
  amount: z.number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor máximo excedido'),
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  debtorId: z.string()
    .min(1, 'ID do devedor é obrigatório'),
  dueDate: z.string().datetime().optional()
})

// Validação de atualização de dívida
export const updateDebtSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo').optional(),
  description: z.string().min(1).max(500).optional(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional()
})

// Tipos TypeScript derivados dos schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateDebtInput = z.infer<typeof createDebtSchema>
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>
