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
import UserManager from "@/lib/userManager"
import Link from "next/link"

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
      const result = UserManager.updateUser(user.id, {
        name: userData.name,
        email: userData.email,
      })

      if (result.success) {
        updateUser({ name: userData.name, email: userData.email })
        alert("Configurações salvas com sucesso!")
      } else {
        alert(result.message)
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
        const result = UserManager.deleteUser(user.id)
        if (result.success) {
          alert("Conta excluída com sucesso!")
          logout()
        } else {
          alert(result.message)
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
      // Atualizar o usuário removendo o grupo
      UserManager.updateUser(user.id, { userGroup: undefined })
      updateUser({ userGroup: undefined })
      localStorage.removeItem('userGroup')
      alert("Você saiu do grupo com sucesso!")
    }
  }

  if (!user) {
    return <div>Carregando...</div>
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
              onClick={handleSave} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white shadow-xl shadow-purple-500/30"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Salvando..." : "Salvar Alterações"}
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
