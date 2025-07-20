import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/supabase'
import { hashPassword, generateToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    // Validar dados de entrada
    const validationResult = registerSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validationResult.error.errors
      })
    }

    const { name, email, password } = validationResult.data

    // Verificar se o email já existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este email já está cadastrado'
      })
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password)

    // Criar usuário
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name
    })

    return res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: {
        user,
        token
      }
    })

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
