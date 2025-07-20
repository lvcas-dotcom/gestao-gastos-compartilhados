"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Shield, LogOut, Trash2, Save } from "lucide-react"

export default function ConfiguracoesPage() {
  const [userData, setUserData] = useState({
    name: "João Silva",
    email: "joao@email.com",
    notifications: true,
    darkMode: false,
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    // Aqui você salvaria as configurações
    alert("Configurações salvas com sucesso!")
  }

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      // Aqui você excluiria a conta
      alert("Conta excluída com sucesso!")
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 5000)
    }
  }

  const handleLeaveGroup = () => {
    if (confirm("Tem certeza que deseja sair do grupo? Esta ação não pode ser desfeita.")) {
      // Aqui você removeria o usuário do grupo
      alert("Você saiu do grupo com sucesso!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Configurações</h1>
          <p className="text-green-600">Gerencie suas preferências e dados pessoais</p>
        </div>

        {/* Informações Pessoais */}
        <Card className="border-green-200 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700 font-medium">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-700 font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-700 font-medium">
                Nova Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Deixe em branco para manter a atual"
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Preferências */}
        <Card className="border-emerald-200 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Settings className="h-5 w-5" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-emerald-700 font-medium flex items-center gap-2">
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
                <Label className="text-emerald-700 font-medium">Modo Escuro</Label>
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
        <Card className="border-blue-200 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Shield className="h-5 w-5" />
              Gerenciar Grupo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Grupo Atual</h4>
              <p className="text-sm text-blue-700">
                Você está compartilhando gastos com <strong>Maria Santos</strong>
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleLeaveGroup}
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Grupo
            </Button>
          </CardContent>
        </Card>

        {/* Zona de Perigo */}
        <Card className="border-red-200 shadow-lg">
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
