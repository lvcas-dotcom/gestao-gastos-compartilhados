"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Shield, LogOut, Trash2, Save, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/api"

export default function ConfiguracoesPage() {
  const { user, updateUser, logout } = useAuth()
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    notifications: true,
    darkMode: false,
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || "",
        email: user.email || "",
        notifications: true,
        darkMode: false,
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Token de autenticação não encontrado')
        return
      }

      const response = await fetch(API_ENDPOINTS.USER.UPDATE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        updateUser({ name: userData.name, email: userData.email })
        alert("Configurações salvas com sucesso!")
      } else {
        alert(data.message || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar configurações. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    if (showDeleteConfirm) {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          alert('Token de autenticação não encontrado')
          return
        }

        const response = await fetch(API_ENDPOINTS.USER.DELETE, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          alert("Conta excluída com sucesso!")
          logout()
        } else {
          alert(data.message || 'Erro ao excluir conta')
        }
      } catch (error) {
        console.error("Erro ao excluir conta:", error)
        alert("Erro ao excluir conta. Tente novamente.")
      }
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 5000)
    }
  }

  const handleLeaveGroup = () => {
    if (!user) return

    if (confirm("Tem certeza que deseja sair do grupo? Esta ação não pode ser desfeita.")) {
      // Por enquanto, apenas simular a saída do grupo
      // Em uma implementação real, você faria uma chamada para a API
      updateUser({ userGroup: undefined })
      localStorage.removeItem('groupConfig')
      alert("Você saiu do grupo com sucesso!")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 xs:-top-40 -right-20 xs:-right-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-br from-purple-200/40 to-violet-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 xs:-bottom-40 -left-20 xs:-left-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-tr from-blue-200/40 to-indigo-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 text-center px-4">
          <Card className="border-0 shadow-xl xs:shadow-2xl shadow-purple-500/15 bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50 max-w-md mx-auto">
            <CardContent className="p-6 xs:p-8">
              <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 xs:mb-6 shadow-lg shadow-purple-500/30">
                <Settings className="h-8 w-8 xs:h-10 xs:w-10 text-white animate-spin" />
              </div>
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8 relative">
          {/* Botão de voltar */}
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-0 h-10 w-10 p-0 text-gray-600 hover:text-purple-600 hover:bg-purple-50/80 transition-all duration-200 rounded-full"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e dados pessoais</p>
        </div>

        {/* Informações Pessoais */}
        <Card className="border-purple-200 shadow-xl shadow-purple-500/10 mb-6 bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-purple-700 font-medium">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                className="border-purple-200 focus:border-purple-500 bg-white/70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-700 font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
                className="border-purple-200 focus:border-purple-500 bg-white/70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-700 font-medium">
                Nova Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Deixe em branco para manter a atual"
                className="border-purple-200 focus:border-purple-500 bg-white/70"
              />
            </div>

                        <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card className="border-purple-200 shadow-xl shadow-purple-500/10 mb-6 bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Settings className="h-5 w-5" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-purple-700 font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </Label>
                <p className="text-sm text-gray-600">Receber notificações sobre novos gastos e pagamentos</p>
              </div>
              <Switch
                checked={userData.notifications}
                onCheckedChange={(checked) => setUserData((prev) => ({ ...prev, notifications: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-purple-700 font-medium">Modo Escuro</Label>
                <p className="text-sm text-gray-600">Alternar entre tema claro e escuro</p>
              </div>
              <Switch
                checked={userData.darkMode}
                onCheckedChange={(checked) => setUserData((prev) => ({ ...prev, darkMode: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Grupo */}
        <Card className="border-purple-200 shadow-xl shadow-purple-500/10 mb-6 bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Shield className="h-5 w-5" />
              Gerenciar Grupo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">Grupo Atual</h4>
              <p className="text-sm text-purple-700">
                {user.userGroup ? (
                  <>Você está compartilhando gastos com outros membros</>
                ) : (
                  <>Você não está em nenhum grupo ainda</>
                )}
              </p>
            </div>

            {user.userGroup && (
              <Button
                variant="outline"
                onClick={handleLeaveGroup}
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 bg-transparent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair do Grupo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Zona de Perigo */}
        <Card className="border-purple-200 shadow-xl shadow-purple-500/10 bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Excluir Conta</h4>
              <p className="text-sm text-red-700 mb-3">
                Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
              </p>

              {showDeleteConfirm && (
                <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Clique novamente para confirmar a exclusão da conta
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className={`w-full ${showDeleteConfirm ? "bg-red-700 hover:bg-red-800" : ""}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {showDeleteConfirm ? "Confirmar Exclusão" : "Excluir Conta"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
