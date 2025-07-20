import { API_ENDPOINTS } from './api'

export interface Group {
  id: string
  name: string
  description?: string
  role: 'admin' | 'member'
  createdAt: string
  createdBy?: string
  createdByName?: string
  memberCount?: number
}

export interface CreateGroupData {
  name: string
  description?: string
}

class GroupService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async createGroup(data: CreateGroupData): Promise<{ success: boolean; message: string; group?: Group }> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.CREATE, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Erro ao criar grupo'
        }
      }

      return {
        success: true,
        message: result.message || 'Grupo criado com sucesso',
        group: result.data?.group
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
      return {
        success: false,
        message: 'Erro de conexão ao criar grupo'
      }
    }
  }

  async getUserGroups(): Promise<{ success: boolean; groups: Group[]; hasGroups: boolean }> {
    try {
      const response = await fetch(API_ENDPOINTS.USER.GROUPS, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          groups: [],
          hasGroups: false
        }
      }

      return {
        success: true,
        groups: result.data?.groups || [],
        hasGroups: result.data?.hasGroups || false
      }
    } catch (error) {
      console.error('Erro ao buscar grupos do usuário:', error)
      return {
        success: false,
        groups: [],
        hasGroups: false
      }
    }
  }

  async getAllUserGroups(): Promise<{ success: boolean; groups: Group[] }> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.LIST, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          groups: []
        }
      }

      return {
        success: true,
        groups: result.data?.groups || []
      }
    } catch (error) {
      console.error('Erro ao buscar todos os grupos:', error)
      return {
        success: false,
        groups: []
      }
    }
  }
}

export const groupService = new GroupService()
export default GroupService
