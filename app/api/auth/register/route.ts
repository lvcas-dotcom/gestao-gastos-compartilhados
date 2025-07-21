import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateToken } from '@/lib/auth'
import { db, pool } from '@/lib/supabase'

// Auto-setup de tabelas se necessário
async function ensureTablesExist() {
  if (process.env.NODE_ENV === 'production' && pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `)
    } catch (error) {
      console.log('Auto-setup tables:', error)
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auto-setup em produção
    await ensureTablesExist()

    const body = await req.json()
    const { name, email, password } = body

    console.log('Registration attempt for:', email)

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      }, { status: 400 })
    }

    if (name.trim().length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Nome deve ter pelo menos 2 caracteres'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      }, { status: 400 })
    }

    const emailLower = email.toLowerCase()

    // Verificar se usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email: emailLower }
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Este email já está cadastrado'
      }, { status: 409 })
    }

    // Criar hash da senha
    const hashedPassword = await hashPassword(password)

    // Criar usuário
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        password: hashedPassword
      }
    })

    if (!user) {
      throw new Error('Falha ao criar usuário')
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
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
