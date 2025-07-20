"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se já está logado
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    
    if (isAuthenticated === "true") {
      // Se já está logado, verificar se tem grupo
      const hasGroup = localStorage.getItem("group")
      if (hasGroup) {
        router.push("/dashboard")
      } else {
        router.push("/configuracoes")
      }
    } else {
      // Se não está logado, ir para login
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
