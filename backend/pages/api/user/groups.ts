import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware'
import { pool } from '../../../lib/supabase'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    })
  }

  try {
    const userId = req.user.userId

    // Verificar se o usuário é membro de algum grupo
    const query = `
      SELECT g.id, g.name, g.description, gm.role, g.created_at as "createdAt"
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
      ORDER BY g.created_at DESC
    `

    const result = await pool.query(query, [userId])

    return res.status(200).json({
      success: true,
      data: {
        groups: result.rows,
        hasGroups: result.rows.length > 0
      }
    })

  } catch (error) {
    console.error('Erro ao buscar grupos do usuário:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}

export default withAuth(handler)
