// Sistema mock para desenvolvimento local - armazenamento global
declare global {
  var mockUsers: Array<{
    id: string
    name: string
    email: string
    password: string
    createdAt: string
  }> | undefined
}

// Usar variável global para persistir dados entre hot reloads
if (!global.mockUsers) {
  global.mockUsers = []
  console.log('Mock DB initialized')
} else {
  console.log('Mock DB reused with', global.mockUsers.length, 'users')
}

export const mockDb = {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      console.log('Mock findUnique called with:', where)
      console.log('Current mock users:', global.mockUsers?.length || 0)
      
      if (!global.mockUsers) return null
      
      if (where.email) {
        const user = global.mockUsers.find(user => user.email === where.email)
        console.log('Found user by email:', !!user)
        return user || null
      }
      if (where.id) {
        const user = global.mockUsers.find(user => user.id === where.id)
        console.log('Found user by id:', !!user)
        return user || null
      }
      return null
    },
    
    create: async ({ data }: { data: any }) => {
      console.log('Mock create called with:', data)
      
      if (!global.mockUsers) global.mockUsers = []
      
      const user = {
        id: Math.random().toString(36).substring(2, 15),
        name: data.name,
        email: data.email,
        password: data.password, // Já vem hasheado das APIs
        createdAt: new Date().toISOString()
      }
      
      global.mockUsers.push(user)
      console.log('User created. Total users:', global.mockUsers.length)
      return user
    }
  }
}
