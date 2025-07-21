import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/supabase'

export async function GET() {
  try {
    if (!pool) {
      return NextResponse.json({
        success: true,
        message: 'Usando banco mock para desenvolvimento',
        mode: 'mock'
      })
    }

    // Testar conexão com o banco
    const result = await pool.query('SELECT NOW() as current_time')
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com banco funcionando',
      currentTime: result.rows[0].current_time,
      mode: 'database'
    })
  } catch (error) {
    console.error('Erro na conexão:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro na conexão com o banco',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
