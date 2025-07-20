import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      })
    }

    // Verificar token JWT
    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }

    // Buscar usuário no banco
    const user = await db.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Token válido',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Erro na verificação do token:', error)
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    })
  }
}
