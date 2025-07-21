import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token não fornecido'
      }, { status: 401 })
    }

    // Verificar token JWT
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido'
      }, { status: 401 })
    }

    // Buscar usuário no banco
    const user = await db.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Token válido',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
