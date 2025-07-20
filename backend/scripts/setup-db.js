const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...')
  
  try {
    // Remover tabelas existentes se necessário para recriar com estrutura correta
    await pool.query('DROP TABLE IF EXISTS debts CASCADE')
    console.log('🗑️ Tabela debts removida (se existia)')
    
    await pool.query('DROP TABLE IF EXISTS users CASCADE')
    console.log('🗑️ Tabela users removida (se existia)')

    await pool.query('DROP TYPE IF EXISTS debt_status CASCADE')
    console.log('🗑️ Tipo debt_status removido (se existia)')

    // Criar tabela de usuários
    await pool.query(`
      CREATE TABLE users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✅ Tabela users criada')

    // Criar enum para status das dívidas
    await pool.query(`
      CREATE TYPE debt_status AS ENUM ('PENDING', 'PAID', 'CANCELLED')
    `)
    console.log('✅ Enum debt_status criado')

    // Criar tabela de dívidas
    await pool.query(`
      CREATE TABLE debts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        debtor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        due_date TIMESTAMP WITH TIME ZONE,
        status debt_status DEFAULT 'PENDING',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✅ Tabela debts criada')

    // Criar tabela de grupos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✅ Tabela groups criada')

    // Criar tabela de membros dos grupos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(group_id, user_id)
      )
    `)
    console.log('✅ Tabela group_members criada')

    // Criar tabela de convites
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✅ Tabela invites criada')

    // Criar índices para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_debts_creator_id ON debts(creator_id);
      CREATE INDEX IF NOT EXISTS idx_debts_debtor_id ON debts(debtor_id);
      CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
      CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
      CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_invites_group_id ON invites(group_id);
      CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
    `)
    console.log('✅ Índices criados')

    // Criar função para atualizar updated_at automaticamente
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)
    console.log('✅ Função update_updated_at_column criada')

    // Criar triggers para atualização automática do updated_at
    await pool.query(`
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)

    await pool.query(`
      CREATE TRIGGER update_debts_updated_at
        BEFORE UPDATE ON debts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)

    await pool.query(`
      CREATE TRIGGER update_groups_updated_at
        BEFORE UPDATE ON groups
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)

    await pool.query(`
      CREATE TRIGGER update_invites_updated_at
        BEFORE UPDATE ON invites
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `)
    console.log('✅ Triggers criados')

    console.log('🎉 Banco de dados configurado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao configurar o banco de dados:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
