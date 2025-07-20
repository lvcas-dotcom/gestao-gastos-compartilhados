"use client"

import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  
  // Páginas que não precisam de autenticação
  const publicPages = ["/login", "/cadastro", "/"]
  const isPublicPage = publicPages.includes(pathname)
  
  // Se estiver carregando, mostrar loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }
  
  // Se for página pública ou usuário autenticado, mostrar conteúdo
  if (isPublicPage || isAuthenticated) {
    return <>{children}</>
  }
  
  // Se não autenticado em página privada, o hook já faz o redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  )
}
