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
      <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
