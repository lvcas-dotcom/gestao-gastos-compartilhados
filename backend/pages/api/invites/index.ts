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
      // Criar novo convite
      const { groupId, maxUses = 1, expiresInDays = 7 } = req.body

      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'ID do grupo é obrigatório'
        })
      }

      // Verificar se o usuário é membro do grupo
      const memberCheck = await pool.query(`
        SELECT gm.role, g.name as "groupName"
        FROM group_members gm
        INNER JOIN groups g ON gm.group_id = g.id
        WHERE gm.group_id = $1 AND gm.user_id = $2
      `, [groupId, decoded.userId])

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Você não é membro deste grupo'
        })
      }

      // Calcular data de expiração
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays))

      // Criar convite
      const result = await pool.query(`
        INSERT INTO invites (group_id, created_by, expires_at, max_uses, status) 
        VALUES ($1, $2, $3, $4, 'active') 
        RETURNING id, group_id as "groupId", created_by as "createdBy", 
                  expires_at as "expiresAt", max_uses as "maxUses", 
                  current_uses as "currentUses", status, created_at as "createdAt"
      `, [groupId, decoded.userId, expiresAt, parseInt(maxUses)])

      const invite = result.rows[0]
      const groupName = memberCheck.rows[0].groupName

      // Gerar link do convite
      const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/convite/${invite.id}`

      return res.status(201).json({
        success: true,
        message: 'Convite criado com sucesso',
        data: { 
          invite: {
            ...invite,
            groupName,
            inviteLink
          }
        }
      })
    }

    if (req.method === 'GET') {
      // Listar convites criados pelo usuário
      const { groupId } = req.query

      let query = `
        SELECT 
          i.id, i.group_id as "groupId", i.created_by as "createdBy",
          i.expires_at as "expiresAt", i.max_uses as "maxUses", 
          i.current_uses as "currentUses", i.status, i.created_at as "createdAt",
          g.name as "groupName",
          u.name as "createdByName"
        FROM invites i
        INNER JOIN groups g ON i.group_id = g.id
        INNER JOIN users u ON i.created_by = u.id
        WHERE i.created_by = $1
      `
      
      const params = [decoded.userId]
      
      if (groupId) {
        query += ' AND i.group_id = $2'
        params.push(groupId as string)
      }
      
      query += ' ORDER BY i.created_at DESC'

      const result = await pool.query(query, params)

      // Adicionar link do convite para cada resultado
      const invitesWithLinks = result.rows.map(invite => ({
        ...invite,
        inviteLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/convite/${invite.id}`
      }))

      return res.status(200).json({
        success: true,
        data: { invites: invitesWithLinks }
      })
    }

    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    })

  } catch (error) {
    console.error('Erro na API de convites:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
