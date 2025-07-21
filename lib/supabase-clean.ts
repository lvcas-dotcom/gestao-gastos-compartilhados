import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { mockDb } from './mockDb'

// Carregamento manual das variáveis de ambiente se necessário
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config()
  } catch (e) {
    // dotenv não instalado, usar process.env diretamente
  }
}

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''
const connectionString = process.env.DATABASE_URL || ''

console.log('Database URL configured:', !!connectionString)
console.log('Using mock database for development:', !connectionString)

// Se não há connection string, usar mock
const useMock = !connectionString

let pool: Pool | null = null

if (!useMock) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })
}

// Cliente Supabase (para funcionalidades futuras) - opcional
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Export pool para uso em teste
export { pool }

// Funções utilitárias para operações de banco de dados
export const db = useMock ? mockDb : {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      if (!pool) return null
      
      let query = 'SELECT id, name, email, password, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE '
      let params: string[] = []
      
      if (where.email) {
        query += 'email = $1'
        params = [where.email]
      } else if (where.id) {
        query += 'id = $1'
        params = [where.id]
      }
      
      const result = await pool.query(query, params)
      return result.rows[0] || null
    },
    
    create: async ({ data }: { data: any }) => {
      if (!pool) return null
      
      const { name, email, password } = data
      const query = `
        INSERT INTO users (name, email, password, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW()) 
        RETURNING id, name, email, created_at as "createdAt"
      `
      const result = await pool.query(query, [name, email, password])
      return result.rows[0]
    }
  }
}
