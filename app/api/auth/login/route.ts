import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateToken } from '@/lib/auth'
import { db } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    console.log('Login attempt for:', email)

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Buscar usuário
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Email ou senha incorretos'
      }, { status: 401 })
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Email ou senha incorretos'
      }, { status: 401 })
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name
    })

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
