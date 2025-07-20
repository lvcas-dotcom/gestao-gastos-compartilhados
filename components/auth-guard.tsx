"use client"

import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  
  // Páginas que não precisam de autenticação
  const publicPages = ["/login", "/cadastro", "/"]
  const isPublicPage = publicPages.includes(pathname)
  
  // Derivar isAuthenticated do user
  const isAuthenticated = !!user
  
  // Se estiver carregando, mostrar loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  // Se for página pública ou usuário autenticado, mostrar conteúdo
  if (isPublicPage || isAuthenticated) {
    return <>{children}</>
  }
  
  // Se não autenticado em página privada, o hook já fez o redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
