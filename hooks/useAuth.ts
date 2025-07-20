"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import UserManager, { User } from '@/lib/userManager'

interface AuthUser {
  id: string
  name: string
  email: string
  userGroup?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedAuth = localStorage.getItem('auth')
        const storedExpiration = localStorage.getItem('authExpiration')
        
        if (storedAuth && storedExpiration) {
          const expirationTime = parseInt(storedExpiration)
          if (Date.now() < expirationTime) {
            const authData = JSON.parse(storedAuth)
            // Verificar se o usuário ainda existe no sistema
            const existingUser = UserManager.findUserByEmail(authData.email)
            if (existingUser) {
              setUser({
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                userGroup: existingUser.userGroup
              })
            } else {
              // Usuário não existe mais, fazer logout
              logout()
            }
          } else {
            logout()
          }
        } else {
          // Não autenticado, redirecionar para login se não estiver em páginas públicas
          const publicPages = ["/login", "/cadastro", "/"]
          if (!publicPages.includes(pathname)) {
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        logout()
      }
      
      setIsLoading(false)
    }

    checkAuth()
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
    login,
    logout,
    updateUser
  }
}
