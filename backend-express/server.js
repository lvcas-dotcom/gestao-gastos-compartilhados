const express = require('express')
const cors = require('cors')
const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'seu-jwt-secret-super-secreto'

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Configuração do banco
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:oskunks@db.oajsszzpeuhxbarwpbdn.supabase.co:5432/postgres'
}

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      })
    }

    const client = new Client(dbConfig)
    await client.connect()

    try {
      // Buscar usuário
      const userResult = await client.query(
        'SELECT id, name, email, password FROM users WHERE email = $1',
        [email]
      )

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        })
      }

      const user = userResult.rows[0]

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password)
      
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        })
      }

      // Gerar token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            user_group: null
          }
        }
      })

    } finally {
      await client.end()
    }

  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      })
    }

    const client = new Client(dbConfig)
    await client.connect()

    try {
      // Verificar se email já existe
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado'
        })
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10)

      // Inserir usuário
      const userResult = await client.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, passwordHash]
      )

      const newUser = userResult.rows[0]

      // Gerar token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: {
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            user_group: null
          }
        }
      })

    } finally {
      await client.end()
    }

  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Rota de verificação de token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      const client = new Client(dbConfig)
      await client.connect()

      try {
        const userResult = await client.query(
          'SELECT id, name, email FROM users WHERE id = $1',
          [decoded.userId]
        )

        if (userResult.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Usuário não encontrado'
          })
        }

        res.json({
          success: true,
          user: userResult.rows[0]
        })

      } finally {
        await client.end()
      }

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }

  } catch (error) {
    console.error('Erro na verificação:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Rota para criar grupo
app.post('/api/groups/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      })
    }

    const token = authHeader.substring(7)
    const { groupName, numberOfPeople } = req.body

    if (!groupName || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        message: 'Nome do grupo e número de pessoas são obrigatórios'
      })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      const client = new Client(dbConfig)
      await client.connect()

      try {
        // Verificar se usuário existe
        const userResult = await client.query(
          'SELECT id FROM users WHERE id = $1',
          [decoded.userId]
        )

        if (userResult.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Usuário não encontrado'
          })
        }

        // Por agora, vamos simular a criação do grupo
        // Em uma implementação real, você criaria a tabela de grupos
        const mockGroupId = 'group_' + Date.now()

        res.json({
          success: true,
          message: 'Grupo criado com sucesso',
          data: {
            group: {
              id: mockGroupId,
              name: groupName,
              numberOfPeople: parseInt(numberOfPeople),
              ownerId: decoded.userId
            }
          }
        })

      } finally {
        await client.end()
      }

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }

  } catch (error) {
    console.error('Erro ao criar grupo:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Rota para atualizar usuário
app.put('/api/user/update', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      })
    }

    const token = authHeader.substring(7)
    const { name, email } = req.body

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      const client = new Client(dbConfig)
      await client.connect()

      try {
        // Atualizar usuário
        const userResult = await client.query(
          'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email',
          [name, email, decoded.userId]
        )

        if (userResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuário não encontrado'
          })
        }

        res.json({
          success: true,
          message: 'Usuário atualizado com sucesso',
          data: {
            user: userResult.rows[0]
          }
        })

      } finally {
        await client.end()
      }

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Rota para deletar usuário
app.delete('/api/user/delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      
      const client = new Client(dbConfig)
      await client.connect()

      try {
        // Deletar usuário
        const deleteResult = await client.query(
          'DELETE FROM users WHERE id = $1 RETURNING id',
          [decoded.userId]
        )

        if (deleteResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuário não encontrado'
          })
        }

        res.json({
          success: true,
          message: 'Conta deletada com sucesso'
        })

      } finally {
        await client.end()
      }

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// ======= ENDPOINTS DE CONVITES =======

// Criar convite
app.post('/api/invites', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorização obrigatório'
      })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      const { groupId, maxUses = 5, expiresIn = 7 } = req.body

      // Calcular data de expiração
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresIn)

      // Gerar ID do convite
      const inviteId = 'invite_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

      // Por enquanto, simular salvamento (em produção seria no banco)
      const mockInvite = {
        id: inviteId,
        groupId: groupId || 'group_default',
        createdBy: decoded.userId,
        expiresAt: expiresAt.toISOString(),
        maxUses: parseInt(maxUses),
        currentUses: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      }

      res.json({
        success: true,
        message: 'Convite criado com sucesso',
        data: { invite: mockInvite }
      })

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }

  } catch (error) {
    console.error('Erro ao criar convite:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Validar convite
app.get('/api/invites/validate/:inviteId', async (req, res) => {
  try {
    const { inviteId } = req.params

    // Por enquanto, simular validação (em produção seria consulta no banco)
    // Retornar convite válido para teste
    const mockInvite = {
      id: inviteId,
      groupId: 'group_default',
      createdBy: 'user_1',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      maxUses: 5,
      currentUses: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    const mockGroup = {
      id: 'group_default',
      name: 'Grupo Exemplo',
      photo: null,
      numberOfPeople: 5
    }

    res.json({
      success: true,
      data: { 
        invite: mockInvite,
        group: mockGroup
      }
    })

  } catch (error) {
    console.error('Erro ao validar convite:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Aceitar convite
app.post('/api/invites/accept/:inviteId', async (req, res) => {
  try {
    const { inviteId } = req.params
    const { name, email } = req.body

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      })
    }

    const client = new Client(dbConfig)
    await client.connect()

    try {
      // Verificar se o email já existe
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Este email já está sendo usado'
        })
      }

      // Gerar hash da senha padrão ou permitir usuário definir
      const defaultPassword = Math.random().toString(36).slice(-8) // Senha aleatória
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)

      // Criar novo usuário
      const userResult = await client.query(
        'INSERT INTO users (name, email, password, joined_via_invite) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [name, email, hashedPassword, inviteId]
      )

      const newUser = userResult.rows[0]

      // Simular incrementar uso do convite (em produção seria atualização no banco)
      
      res.json({
        success: true,
        message: 'Usuário adicionado ao grupo com sucesso!',
        data: { 
          user: newUser,
          tempPassword: defaultPassword, // Em produção, enviaria por email
          inviteId: inviteId
        }
      })

    } finally {
      await client.end()
    }

  } catch (error) {
    console.error('Erro ao aceitar convite:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

app.listen(port, () => {
  console.log(`🚀 Servidor backend rodando na porta ${port}`)
  console.log(`📡 Acesse: http://localhost:${port}`)
})
