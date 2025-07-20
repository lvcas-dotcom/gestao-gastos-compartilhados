import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''
const connectionString = process.env.DATABASE_URL || ''

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false
})

// Cliente Supabase (para funcionalidades futuras) - opcional
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Wrapper para facilitar a migração do Prisma
export const db = {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
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
    
    create: async ({ data, select }: { data: any, select?: any }) => {
      const { name, email, password } = data
      const query = `
        INSERT INTO users (name, email, password, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW()) 
        RETURNING id, name, email, created_at as "createdAt"
      `
      const result = await pool.query(query, [name, email, password])
      return result.rows[0]
    }
  },
  
  debt: {
    findMany: async ({ where }: { where?: any } = {}) => {
      let query = `
        SELECT d.id, d.amount, d.description, d.created_at as "createdAt", 
               d.updated_at as "updatedAt", d.due_date as "dueDate", d.status,
               d.creator_id as "creatorId", d.debtor_id as "debtorId"
        FROM debts d
      `
      let params: string[] = []
      
      if (where) {
        const conditions = []
        if (where.creatorId) {
          conditions.push(`d.creator_id = $${conditions.length + 1}`)
          params.push(where.creatorId)
        }
        if (where.debtorId) {
          conditions.push(`d.debtor_id = $${conditions.length + 1}`)
          params.push(where.debtorId)
        }
        
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`
        }
      }
      
      query += ' ORDER BY d.created_at DESC'
      
      const result = await pool.query(query, params)
      return result.rows
    },
    
    create: async ({ data }: { data: any }) => {
      const { amount, description, creatorId, debtorId, dueDate, status = 'PENDING' } = data
      const query = `
        INSERT INTO debts (amount, description, creator_id, debtor_id, due_date, status, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
        RETURNING id, amount, description, creator_id as "creatorId", debtor_id as "debtorId", 
                  due_date as "dueDate", status, created_at as "createdAt", updated_at as "updatedAt"
      `
      const result = await pool.query(query, [amount, description, creatorId, debtorId, dueDate, status])
      return result.rows[0]
    },
    
    update: async ({ where, data }: { where: { id: string }, data: any }) => {
      const updateFields = Object.keys(data)
      const setClause = updateFields.map((key, index) => {
        // Converter camelCase para snake_case para os campos do banco
        const dbField = key === 'dueDate' ? 'due_date' : 
                       key === 'creatorId' ? 'creator_id' :
                       key === 'debtorId' ? 'debtor_id' : key
        return `${dbField} = $${index + 2}`
      }).join(', ')
      
      const values = [where.id, ...updateFields.map(key => data[key])]
      
      const query = `
        UPDATE debts 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id, amount, description, creator_id as "creatorId", debtor_id as "debtorId", 
                  due_date as "dueDate", status, created_at as "createdAt", updated_at as "updatedAt"
      `
      
      const result = await pool.query(query, values)
      return result.rows[0]
    },
    
    delete: async ({ where }: { where: { id: string } }) => {
      const query = 'DELETE FROM debts WHERE id = $1 RETURNING id'
      const result = await pool.query(query, [where.id])
      return result.rows[0]
    }
  }
}
