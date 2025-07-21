'use client'

import { useEffect } from 'react'

export function AppInitializer() {
  useEffect(() => {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window !== 'undefined') {
      // Verificar se é um novo usuário (sem token de autenticação)
      const authToken = localStorage.getItem('auth')
      
      if (!authToken) {
        // Se não há token, limpar todo o localStorage para garantir um início limpo
        clearAppStorage()
      }
    }
  }, [])

  const clearAppStorage = () => {
    // Verificar se estamos no browser antes de acessar localStorage
    if (typeof window === 'undefined') return
    
    // Lista de chaves conhecidas para remover
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
      'userData'
    ]
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
      }
    })
    
    // Limpar chaves com prefixos conhecidos
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('grupo_') || 
          key.startsWith('gasto_') || 
          key.startsWith('user_') ||
          key.startsWith('member_') ||
          key.startsWith('invite_')) {
        localStorage.removeItem(key)
      }
    })
  }

  return null // Este componente não renderiza nada
}
