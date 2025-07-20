import { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'seu-jwt-secret-super-secreto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const { email, password } = req.body

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      })
    }

    // Conectar ao banco
    const client = new Client({
      connectionString: 'postgresql://postgres:oskunks@db.oajsszzpeuhxbarwpbdn.supabase.co:5432/postgres'
    })
    
    await client.connect()

    try {
      // Buscar usuário por email
      const userResult = await client.query(
        'SELECT id, name, email, password_hash, user_group FROM users WHERE email = $1',
        [email]
      )

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        })
      }

      const user = userResult.rows[0]

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password_hash)
      
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        })
      }

      // Gerar JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      // Retornar dados do usuário (sem a senha)
      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            user_group: user.user_group
          }
        }
      })

    } finally {
      await client.end()
    }

  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
