"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, userGroups } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user) {
        // Verificar se tem grupos usando a nova propriedade
        if (user.hasGroups || userGroups.length > 0) {
          router.push("/dashboard")
        } else {
          router.push("/criar-grupo")
        }
      }
    }
  }, [isAuthenticated, isLoading, user, userGroups, router])

  // Página de loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 rounded-full animate-spin mx-auto mb-4">
          <div className="w-12 h-12 bg-white rounded-full m-2"></div>
        </div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent">
          Carregando...
        </h2>
        <p className="text-gray-600 mt-2">Aguarde um momento</p>
      </div>
    </div>
  )
}
