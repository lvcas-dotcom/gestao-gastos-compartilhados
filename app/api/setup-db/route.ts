import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/supabase'

const createTablesSQL = `
-- Criar tabelas se não existirem
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`

export async function POST() {
  try {
    if (!pool) {
      return NextResponse.json({
        success: false,
        message: 'Pool de conexão não disponível - usando modo mock'
      })
    }

    // Executar SQL para criar tabelas
    await pool.query(createTablesSQL)

    return NextResponse.json({
      success: true,
      message: 'Tabelas criadas/verificadas com sucesso'
    })
  } catch (error) {
    console.error('Erro no setup do banco:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao configurar banco de dados',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
