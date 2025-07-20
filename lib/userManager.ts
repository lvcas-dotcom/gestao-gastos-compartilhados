interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
  userGroup?: string
}

interface Group {
  id: string
  name: string
  members: string[]
  createdAt: string
  createdBy: string
}

class UserManager {
  private static USERS_KEY = 'gestao_usuarios'
  private static GROUPS_KEY = 'gestao_grupos'

  static getUsers(): User[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.USERS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  static findUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find(user => user.email === email) || null
  }

  static validateCredentials(email: string, password: string): User | null {
    const user = this.findUserByEmail(email)
    if (user && user.password === password) {
      return user
    }
    return null
  }

  static registerUser(name: string, email: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers()
    
    // Verificar se email já existe
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return { success: false, message: 'Este e-mail já está cadastrado.' }
    }

    // Criar novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    this.saveUsers(users)

    return { success: true, message: 'Usuário registrado com sucesso!', user: newUser }
  }

  static updateUser(userId: string, updates: Partial<User>): { success: boolean; message: string; user?: User } {
    const users = this.getUsers()
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      return { success: false, message: 'Usuário não encontrado.' }
    }

    // Se está atualizando email, verificar se não existe outro usuário com o mesmo email
    if (updates.email && updates.email !== users[userIndex].email) {
      const existingUser = users.find(user => user.email === updates.email && user.id !== userId)
      if (existingUser) {
        return { success: false, message: 'Este e-mail já está sendo usado por outro usuário.' }
      }
    }

    users[userIndex] = { ...users[userIndex], ...updates }
    this.saveUsers(users)

    return { success: true, message: 'Usuário atualizado com sucesso!', user: users[userIndex] }
  }

  static deleteUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers()
    const filteredUsers = users.filter(user => user.id !== userId)
    
    if (filteredUsers.length === users.length) {
      return { success: false, message: 'Usuário não encontrado.' }
    }

    this.saveUsers(filteredUsers)
    return { success: true, message: 'Usuário excluído com sucesso!' }
  }

  // Métodos para grupos (implementação básica)
  static getGroups(): Group[] {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(this.GROUPS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveGroups(groups: Group[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups))
  }

  static createGroup(name: string, createdBy: string): { success: boolean; message: string; group?: Group } {
    const groups = this.getGroups()
    
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      members: [createdBy],
      createdAt: new Date().toISOString(),
      createdBy
    }

    groups.push(newGroup)
    this.saveGroups(groups)

    // Atualizar o usuário com o grupo
    const users = this.getUsers()
    const userIndex = users.findIndex(user => user.id === createdBy)
    if (userIndex !== -1) {
      users[userIndex].userGroup = newGroup.id
      this.saveUsers(users)
    }

    return { success: true, message: 'Grupo criado com sucesso!', group: newGroup }
  }

  static getUserGroup(userId: string): Group | null {
    const user = this.getUsers().find(u => u.id === userId)
    if (!user || !user.userGroup) return null
    
    const groups = this.getGroups()
    return groups.find(group => group.id === user.userGroup) || null
  }

  static updateUserGroup(userId: string, groupId: string): { success: boolean; message: string } {
    const result = this.updateUser(userId, { userGroup: groupId })
    return result
  }
}

export default UserManager
export type { User, Group }
