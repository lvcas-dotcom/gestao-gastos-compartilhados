import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    // Validar dados de entrada
    const validationResult = loginSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validationResult.error.errors
      })
    }

    const { email, password } = validationResult.data

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name
    })

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
