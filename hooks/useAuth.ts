"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import UserManager, { User } from '@/lib/userManager'

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
  const [userGroups, setUserGroups] = useState<any[]>([])
  const router = useRouter()
  const pathname = usePathname()

  // Função para verificar grupos do usuário
  const checkUserGroups = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/user/groups', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserGroups(data.data.groups)
        return data.data.hasGroups
      }
    } catch (error) {
      console.log('Erro ao verificar grupos:', error)
    }
    return false
  }

  useEffect(() => {
    useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = localStorage.getItem('auth')
        const storedExpiration = localStorage.getItem('authExpiration')
        const token = localStorage.getItem('token')
        
        if (storedAuth && storedExpiration && token) {
          const expirationTime = parseInt(storedExpiration)
          if (Date.now() < expirationTime) {
            const authData = JSON.parse(storedAuth)
            
            // Verificar grupos do usuário via API
            const hasGroups = await checkUserGroups(token)
            
            setUser({
              id: authData.id,
              name: authData.name,
              email: authData.email,
              userGroup: authData.userGroup,
              hasGroups: hasGroups
            })
          } else {
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
  }, [pathname, router])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const user = UserManager.validateCredentials(email, password)
      
      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          userGroup: user.userGroup
        }
        
        setUser(authUser)
        
        // Salvar no localStorage com expiração de 24 horas
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000)
        localStorage.setItem('auth', JSON.stringify(authUser))
        localStorage.setItem('authExpiration', expirationTime.toString())
        localStorage.setItem('userGroup', user.userGroup || '')
        
        // Navegar baseado no status do usuário
        if (user.userGroup) {
          router.push('/dashboard')
        } else {
          router.push('/criar-grupo')
        }
        
        return { success: true, message: 'Login realizado com sucesso!' }
      }
      
      return { success: false, message: 'E-mail ou senha incorretos.' }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Erro interno. Tente novamente.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth')
    localStorage.removeItem('authExpiration')
    localStorage.removeItem('userGroup')
    router.push('/login')
  }

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      
      // Atualizar no localStorage
      localStorage.setItem('auth', JSON.stringify(updatedUser))
      
      // Atualizar no UserManager
      UserManager.updateUser(user.id, updates)
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
    updateUser
  }
}
