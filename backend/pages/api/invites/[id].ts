import { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'ID do convite é obrigatório'
    })
  }

  try {
    if (req.method === 'GET') {
      // Obter informações do convite (para exibir na tela de aceitar)
      const result = await pool.query(`
        SELECT 
          i.id, i.group_id as "groupId", i.expires_at as "expiresAt",
          i.max_uses as "maxUses", i.current_uses as "currentUses", i.status,
          g.name as "groupName", g.description as "groupDescription",
          u.name as "createdByName"
        FROM invites i
        INNER JOIN groups g ON i.group_id = g.id
        INNER JOIN users u ON i.created_by = u.id
        WHERE i.id = $1
      `, [id])

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Convite não encontrado'
        })
      }

      const invite = result.rows[0]

      // Verificar se o convite ainda é válido
      const now = new Date()
      const isExpired = new Date(invite.expiresAt) < now
      const isMaxUsesReached = invite.currentUses >= invite.maxUses
      const isActive = invite.status === 'active'

      const isValid = isActive && !isExpired && !isMaxUsesReached

      return res.status(200).json({
        success: true,
        data: {
          invite: {
            ...invite,
            isValid,
            isExpired,
            isMaxUsesReached
          }
        }
      })
    }

    if (req.method === 'POST') {
      // Aceitar convite
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

      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        // Verificar se o convite existe e é válido
        const inviteResult = await client.query(`
          SELECT i.*, g.name as "groupName"
          FROM invites i
          INNER JOIN groups g ON i.group_id = g.id
          WHERE i.id = $1 AND i.status = 'active'
        `, [id])

        if (inviteResult.rows.length === 0) {
          throw new Error('Convite não encontrado ou inativo')
        }

        const invite = inviteResult.rows[0]

        // Verificar se não expirou
        const now = new Date()
        if (new Date(invite.expires_at) < now) {
          throw new Error('Convite expirado')
        }

        // Verificar se não atingiu limite de usos
        if (invite.current_uses >= invite.max_uses) {
          throw new Error('Convite atingiu limite de usos')
        }

        // Verificar se o usuário já é membro do grupo
        const memberCheck = await client.query(`
          SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2
        `, [invite.group_id, decoded.userId])

        if (memberCheck.rows.length > 0) {
          throw new Error('Você já é membro deste grupo')
        }

        // Adicionar usuário ao grupo
        await client.query(`
          INSERT INTO group_members (group_id, user_id, role) 
          VALUES ($1, $2, 'member')
        `, [invite.group_id, decoded.userId])

        // Incrementar contador de usos do convite
        await client.query(`
          UPDATE invites SET current_uses = current_uses + 1 WHERE id = $1
        `, [id])

        await client.query('COMMIT')

        return res.status(200).json({
          success: true,
          message: `Você foi adicionado ao grupo "${invite.groupName}" com sucesso!`,
          data: {
            groupId: invite.group_id,
            groupName: invite.groupName
          }
        })

      } catch (error) {
        await client.query('ROLLBACK')
        
        if (error instanceof Error) {
          return res.status(400).json({
            success: false,
            message: error.message
          })
        }
        
        throw error
      } finally {
        client.release()
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    })

  } catch (error) {
    console.error('Erro na API de convite:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
