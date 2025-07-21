import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateToken } from '@/lib/auth'
import { db } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'E-mail já está em uso'
      }, { status: 409 })
    }

    // Criar hash da senha
    const hashedPassword = await hashPassword(password)

    // Criar usuário
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
