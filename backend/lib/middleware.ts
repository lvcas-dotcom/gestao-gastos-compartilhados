import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, extractTokenFromHeader, JWTPayload } from './auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user: JWTPayload
}

type AuthenticatedHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void

export const withAuth = (handler: AuthenticatedHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extrair token do header Authorization
      const token = extractTokenFromHeader(req.headers.authorization)
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token de acesso não encontrado' 
        })
      }

      // Verificar token
      const payload = verifyToken(token)
      
      if (!payload) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token inválido ou expirado' 
        })
      }

      // Adicionar dados do usuário à request
      ;(req as AuthenticatedRequest).user = payload

      // Continuar para o handler
      return handler(req as AuthenticatedRequest, res)
    } catch (error) {
      console.error('Erro na autenticação:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      })
    }
  }
}
