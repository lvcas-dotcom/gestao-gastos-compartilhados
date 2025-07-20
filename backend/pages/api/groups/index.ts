import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso é obrigatório'
      })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      })
    }

    if (req.method === 'POST') {
      // Criar novo grupo
      const { name, description } = req.body

      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Nome do grupo é obrigatório e deve ter pelo menos 2 caracteres'
        })
      }

      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        // Criar grupo
        const groupResult = await client.query(`
          INSERT INTO groups (name, description, created_by) 
          VALUES ($1, $2, $3) 
          RETURNING id, name, description, created_by as "createdBy", created_at as "createdAt"
        `, [name.trim(), description?.trim() || null, decoded.userId])

        const group = groupResult.rows[0]

        // Adicionar o criador como admin do grupo
        await client.query(`
          INSERT INTO group_members (group_id, user_id, role) 
          VALUES ($1, $2, 'admin')
        `, [group.id, decoded.userId])

        await client.query('COMMIT')

        return res.status(201).json({
          success: true,
          message: 'Grupo criado com sucesso',
          data: { group }
        })

      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }

    if (req.method === 'GET') {
      // Listar grupos do usuário
      const result = await pool.query(`
        SELECT 
          g.id, g.name, g.description, g.created_by as "createdBy", 
          g.created_at as "createdAt", g.updated_at as "updatedAt",
          gm.role,
          u.name as "createdByName",
          COUNT(gm2.id) as "memberCount"
        FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        INNER JOIN users u ON g.created_by = u.id
        LEFT JOIN group_members gm2 ON g.id = gm2.group_id
        WHERE gm.user_id = $1
        GROUP BY g.id, g.name, g.description, g.created_by, g.created_at, g.updated_at, gm.role, u.name
        ORDER BY g.created_at DESC
      `, [decoded.userId])

      return res.status(200).json({
        success: true,
        data: { groups: result.rows }
      })
    }

    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    })

  } catch (error) {
    console.error('Erro na API de grupos:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
