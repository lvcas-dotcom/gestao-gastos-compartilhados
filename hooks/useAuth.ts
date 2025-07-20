"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  email: string
  isLoggedIn: boolean
  loginTime: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem("isAuthenticated")
        const userData = localStorage.getItem("user")

        if (isAuthenticated === "true" && userData) {
          const parsedUser = JSON.parse(userData)
          
          // Verificar se o login não expirou (24 horas)
          const loginTime = new Date(parsedUser.loginTime)
          const now = new Date()
          const diffHours = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

          if (diffHours < 24) {
            setUser(parsedUser)
          } else {
            // Login expirado
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Lista de usuários válidos (simulação)
      const validUsers = [
        { email: "admin@teste.com", password: "123456" },
        { email: "usuario@teste.com", password: "123456" },
        { email: "lucas@teste.com", password: "123456" },
      ]

      // Verificar se o usuário existe
      const user = validUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (!user || user.password !== password) {
        return false
      }

      // Login bem-sucedido - salvar na sessão
      const userData = { 
        email: user.email, 
        isLoggedIn: true, 
        loginTime: new Date().toISOString() 
      }
      
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("isAuthenticated", "true")
      
      setUser(userData)

      // Verificar se usuário já tem grupo
      const hasGroup = localStorage.getItem("group")
      
      if (hasGroup) {
        // Se já tem grupo, vai para dashboard
        router.push("/dashboard")
      } else {
        // Se não tem grupo, vai para configurações
        router.push("/configuracoes")
      }

      return true
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  const isAuthenticated = !!user

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  }
}
