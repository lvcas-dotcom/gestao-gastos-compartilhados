"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, User, CheckCircle, Users, Sparkles, AlertCircle, Clock } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { API_ENDPOINTS } from "@/lib/api"

interface Invite {
  id: string
  groupId: string
  createdBy: string
  expiresAt: string
  maxUses: number
  currentUses: number
  status: "active" | "expired" | "disabled"
  createdAt: string
}

export default function AcceptInvitePage() {
  const router = useRouter()
  const params = useParams()
  const inviteId = params.id as string

  const [invite, setInvite] = useState<Invite | null>(null)
  const [group, setGroup] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    validateInvite()
  }, [inviteId])

  const validateInvite = async () => {
    setIsValidating(true)

    try {
      // Tentar validar convite via API primeiro
      const response = await fetch(`${API_ENDPOINTS.INVITES.VALIDATE}/${inviteId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInvite(data.data.invite)
          setGroup(data.data.group)
          setIsValidating(false)
          return
        }
      }

      // Fallback para localStorage (desenvolvimento)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Buscar convite nos dados salvos
      const savedInvites = localStorage.getItem("invites")
      const groupConfigData = localStorage.getItem("groupConfig")
      const groupData = localStorage.getItem("group")

      if (!savedInvites || (!groupConfigData && !groupData)) {
        setError("Convite não encontrado ou grupo não existe")
        setIsValidating(false)
        return
      }

      const invites: Invite[] = JSON.parse(savedInvites)
      const foundInvite = invites.find((inv) => inv.id === inviteId)

      if (!foundInvite) {
        setError("Convite não encontrado")
        setIsValidating(false)
        return
      }

      // Verificar se o convite ainda é válido
      const now = new Date()
      const expiresAt = new Date(foundInvite.expiresAt)

      if (expiresAt < now) {
        setError("Este convite expirou")
        setIsValidating(false)
        return
      }

      if (foundInvite.currentUses >= foundInvite.maxUses) {
        setError("Este convite já atingiu o limite máximo de usos")
        setIsValidating(false)
        return
      }

      if (foundInvite.status !== "active") {
        setError("Este convite não está mais ativo")
        setIsValidating(false)
        return
      }

      setInvite(foundInvite)
      
      // Priorizar groupConfig para ter a foto mais recente
      if (groupConfigData) {
        const groupConfig = JSON.parse(groupConfigData)
        const existingGroup = groupData ? JSON.parse(groupData) : {}
        setGroup({ ...existingGroup, ...groupConfig })
      } else if (groupData) {
        setGroup(JSON.parse(groupData))
      }
    } catch (err) {
      setError("Erro ao validar convite")
    } finally {
      setIsValidating(false)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !invite) {
      return
    }

    setIsLoading(true)

    try {
      // Tentar aceitar convite via API
      const response = await fetch(`${API_ENDPOINTS.INVITES.ACCEPT}/${inviteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: 'Este email já está sendo usado' })
        } else {
          setErrors({ general: data.message || 'Erro ao aceitar convite' })
        }
        return
      }

      // Sucesso - mostrar mensagem com senha temporária se fornecida
      if (data.data.tempPassword) {
        alert(`✅ Parabéns! Você entrou no grupo com sucesso!\n\n🔐 Sua senha temporária é: ${data.data.tempPassword}\n\nGuarde essa informação para fazer login!`)
      } else {
        alert("✅ Parabéns! Você entrou no grupo com sucesso!")
      }
      
      router.push("/login")

    } catch (error) {
      console.error('Erro na requisição:', error)
      
      // Fallback para sistema local
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Criar novo usuário
        const newUserId = `user_${Date.now()}`
        const newUserData = {
          id: newUserId,
          name: formData.name,
          email: formData.email,
          joinedViaInvite: invite.id,
          createdAt: new Date().toISOString(),
        }

        // Salvar novo usuário (em um app real, isso seria no backend)
        localStorage.setItem(`user_${newUserId}`, JSON.stringify(newUserData))

        // Atualizar o convite (incrementar uso)
        const savedInvites = localStorage.getItem("invites")
        if (savedInvites) {
          const invites: Invite[] = JSON.parse(savedInvites)
          const updatedInvites = invites.map((inv) =>
            inv.id === invite.id ? { ...inv, currentUses: inv.currentUses + 1 } : inv,
          )
          localStorage.setItem("invites", JSON.stringify(updatedInvites))
        }

        // Atualizar grupo para incluir novo membro
        if (group) {
          const updatedGroup = {
            ...group,
            users: [...(group.users || []), newUserId],
            updatedAt: new Date().toISOString(),
          }
          localStorage.setItem("group", JSON.stringify(updatedGroup))
        }

        alert("✅ Parabéns! Você entrou no grupo com sucesso!")
        router.push("/dashboard")
      } catch (fallbackError) {
        setErrors({ general: 'Erro de conexão. Tente novamente.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 flex items-center justify-center">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50 w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Validando convite...</h2>
            <p className="text-gray-600">Aguarde enquanto verificamos o convite</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl ring-1 ring-red-100/50 w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Convite Inválido</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-violet-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-violet-200/40 to-blue-300/40 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 px-4 py-8 max-w-md mx-auto">
        {/* Group Info */}
        <div className="mb-8">
          <Card className="border-0 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                {group?.photo ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex-shrink-0 ring-2 ring-white/30">
                    <Image
                      src={group.photo || "/placeholder.svg"}
                      alt="Foto do grupo"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
                    <Users className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{group?.name}</p>
                  <p className="text-purple-100 text-sm">Você foi convidado para participar</p>
                </div>
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-transform duration-300">
            <UserPlus className="h-12 w-12 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-3 w-3 text-yellow-800" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent mb-3">
            Aceitar Convite
          </h1>
          <p className="text-gray-600 text-base leading-relaxed px-4">
            Preencha seus dados para entrar no grupo e começar a controlar gastos compartilhados
          </p>
        </div>

        {/* Invite Info */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Convite válido até:</span>
              </div>
              <span className="text-sm text-purple-700">
                {invite && new Date(invite.expiresAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-2xl shadow-purple-500/15 bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-purple-600" />
              </div>
              Seus Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-gray-700 font-semibold text-base flex items-center">
                  <User className="h-4 w-4 mr-2 text-purple-600" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`h-12 border-2 rounded-xl text-base transition-all duration-300 ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 bg-red-50/50"
                      : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                  } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                  autoComplete="name"
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="text-red-500 text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-semibold text-base flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-purple-600" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-12 border-2 rounded-xl text-base transition-all duration-300 ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 bg-red-50/50"
                      : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                  } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                  autoComplete="email"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-red-500 text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Info */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 mb-1">Quase lá!</h4>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      Após aceitar o convite, você poderá ver e participar de todos os gastos compartilhados do grupo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Erro geral */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-left-2">
                  <p className="text-red-600 text-sm font-medium flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white font-semibold text-base shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-purple-500/40 group"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando no grupo...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" />
                    Aceitar Convite
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
