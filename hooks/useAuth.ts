"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { API_ENDPOINTS } from '@/lib/api'
import { groupService, type Group } from '@/lib/groupService'

interface AuthUser {
  id: string
  name: string
  email: string
  userGroup?: string
  hasGroups?: boolean
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userGroups, setUserGroups] = useState<Group[]>([])
  const router = useRouter()
  const pathname = usePathname()

  // Função para verificar grupos do usuário usando o service
  const checkUserGroups = async () => {
    try {
      const result = await groupService.getUserGroups()
      if (result.success) {
        setUserGroups(result.groups)
        return result.hasGroups
      }
    } catch (error) {
      console.log('Erro ao verificar grupos:', error)
    }
    return false
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (token) {
          // Verificar se o token é válido com a API
          const response = await fetch(API_ENDPOINTS.AUTH.VERIFY, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            
            // Verificar grupos do usuário via API
            const hasGroups = await checkUserGroups()
            
            setUser({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              userGroup: data.user.user_group,
              hasGroups: hasGroups
            })
          } else {
            // Token inválido
            logout()
          }
        } else {
          // Não autenticado, redirecionar para login se não estiver em páginas públicas
          const publicRoutes = ['/login', '/cadastro']
          if (!publicRoutes.includes(pathname)) {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.data && data.data.token) {
        // Salvar token primeiro
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        // Verificar grupos do usuário via API
        const hasGroups = await checkUserGroups()
        
        // Login bem-sucedido
        const authUser: AuthUser = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          userGroup: data.data.user.user_group,
          hasGroups: hasGroups
        }
        
        setUser(authUser)
        
        // Verificar se é o primeiro login do usuário
        const firstLoginKey = `first_login_${data.data.user.id}`
        const hasLoggedBefore = localStorage.getItem(firstLoginKey)
        
        // Navegar baseado no status do usuário
        if (hasGroups) {
          router.push('/dashboard')
        } else {
          // Verificar se é o primeiro login do usuário
          if (!hasLoggedBefore) {
            // Marcar como primeiro login e ir para dashboard (que vai mostrar o pop-up)
            localStorage.setItem(firstLoginKey, 'true')
            localStorage.setItem('show_first_group_modal', 'true')
          }
          
          // Sempre vai para dashboard agora
          router.push('/dashboard')
        }
        
        return { success: true, message: 'Login realizado com sucesso!' }
      }
      
      return { success: false, message: data.message || 'E-mail ou senha incorretos.' }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Erro interno. Tente novamente.' }
    }
  }

  const logout = () => {
    setUser(null)
    
    // Limpar todas as chaves do localStorage relacionadas ao app
    const keysToRemove = [
      'auth',
      'authExpiration', 
      'userGroup',
      'grupos',
      'gastos',
      'convites',
      'membros',
      'categorias',
      'currentUser',
      'userData',
      'token',
      'user'
    ]
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Limpar também qualquer chave que comece com prefixos conhecidos
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('grupo_') || 
          key.startsWith('gasto_') || 
          key.startsWith('user_') ||
          key.startsWith('member_') ||
          key.startsWith('invite_')) {
        localStorage.removeItem(key)
      }
    })
    
    router.push('/login')
  }

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      
      // Atualizar no localStorage
      localStorage.setItem('auth', JSON.stringify(updatedUser))
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const isAuthenticated = !!user

  return {
    user,
    isAuthenticated,
    isLoading,
    userGroups,
    login,
    logout,
    updateUser,
    checkUserGroups
  }
}
