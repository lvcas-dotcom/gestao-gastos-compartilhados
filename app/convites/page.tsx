"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Share2,
  Copy,
  Plus,
  Users,
  ArrowLeft,
  Check,
  Clock,
  Trash2,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
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

export default function ConvitesPage() {
  const router = useRouter()
  const [group, setGroup] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string>("")
  const [formData, setFormData] = useState({
    maxUses: "5",
    expiresIn: "7", // dias
  })

  useEffect(() => {
    const initializePage = () => {
      const groupData = localStorage.getItem("group")
      const groupConfig = localStorage.getItem("groupConfig")
      let user1Data = localStorage.getItem("user1")
      let user2Data = localStorage.getItem("user2")

      // Criar dados padrão se não existirem
      if (!user1Data || !user2Data) {
        const defaultUser1 = {
          id: "1",
          name: "Você",
          email: "user@example.com",
          avatar: "/placeholder-user.jpg"
        }
        const defaultUser2 = {
          id: "2", 
          name: "Membro",
          email: "member@example.com",
          avatar: "/placeholder-user.jpg"
        }
        localStorage.setItem("user1", JSON.stringify(defaultUser1))
        localStorage.setItem("user2", JSON.stringify(defaultUser2))
        user1Data = JSON.stringify(defaultUser1)
        user2Data = JSON.stringify(defaultUser2)
      }

      // Priorizar groupConfig que tem a foto, senão usar groupData
      if (groupConfig) {
        const config = JSON.parse(groupConfig)
        setGroup({
          id: "group1",
          name: config.groupName || "Meu Grupo",
          numberOfPeople: config.numberOfPeople || 2,
          photo: config.groupPhoto || "/placeholder-logo.png"
        })
      } else if (groupData) {
        const parsed = JSON.parse(groupData)
        setGroup({
          ...parsed,
          id: parsed.id || "group1",
          photo: parsed.photo || "/placeholder-logo.png"
        })
      } else {
        // Criar grupo padrão se não existe
        const defaultGroup = {
          id: "group1",
          name: "Meu Grupo",
          numberOfPeople: 2,
          photo: "/placeholder-logo.png"
        }
        setGroup(defaultGroup)
        localStorage.setItem("groupConfig", JSON.stringify({
          groupName: defaultGroup.name,
          numberOfPeople: defaultGroup.numberOfPeople,
          groupPhoto: defaultGroup.photo
        }))
      }

      setUsers([JSON.parse(user1Data), JSON.parse(user2Data)])
      loadInvites()
    }

    initializePage()
  }, [router])

  const loadInvites = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Se não há token, usar dados simulados
        const savedInvites = localStorage.getItem("invites")
        if (savedInvites) {
          try {
            setInvites(JSON.parse(savedInvites))
          } catch (err) {
            console.warn("Invites corrompidos, recriando…", err)
            localStorage.removeItem("invites")
            setInvites([])
          }
        } else {
          const exampleInvites: Invite[] = [
            {
              id: "inv_" + Date.now(),
              groupId: "group1",
              createdBy: "1",
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              maxUses: 5,
              currentUses: 0,
              status: "active",
              createdAt: new Date().toISOString(),
            },
          ]
          setInvites(exampleInvites)
          localStorage.setItem("invites", JSON.stringify(exampleInvites))
        }
        return
      }

      // Tentar carregar da API
      const response = await fetch(API_ENDPOINTS.INVITES.LIST, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInvites(data.data.invites || [])
      } else {
        // Se falhar, usar dados locais como fallback
        const savedInvites = localStorage.getItem("invites")
        if (savedInvites) {
          setInvites(JSON.parse(savedInvites))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
      // Usar dados locais como fallback
      const savedInvites = localStorage.getItem("invites")
      if (savedInvites) {
        setInvites(JSON.parse(savedInvites))
      }
    }
  }

  const generateInviteLink = (inviteId: string) => {
    return `${window.location.origin}/convite/${inviteId}`
  }

  const handleCreateInvite = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Fallback para funcionamento local
        const newInvite: Invite = {
          id: `inv_${Date.now()}`,
          groupId: group.id,
          createdBy: "1",
          expiresAt: new Date(Date.now() + Number.parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
          maxUses: Number.parseInt(formData.maxUses),
          currentUses: 0,
          status: "active",
          createdAt: new Date().toISOString(),
        }

        const updatedInvites = [newInvite, ...invites]
        setInvites(updatedInvites)
        localStorage.setItem("invites", JSON.stringify(updatedInvites))
        setShowCreateForm(false)
        return
      }

      const response = await fetch(API_ENDPOINTS.INVITES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          groupId: group.id,
          maxUses: Number.parseInt(formData.maxUses),
          expiresIn: Number.parseInt(formData.expiresIn)
        })
      })

      if (response.ok) {
        const data = await response.json()
        await loadInvites()
        setShowCreateForm(false)
      } else {
        // Fallback para funcionamento local em caso de erro
        const newInvite: Invite = {
          id: `inv_${Date.now()}`,
          groupId: group.id,
          createdBy: "1",
          expiresAt: new Date(Date.now() + Number.parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
          maxUses: Number.parseInt(formData.maxUses),
          currentUses: 0,
          status: "active",
          createdAt: new Date().toISOString(),
        }

        const updatedInvites = [newInvite, ...invites]
        setInvites(updatedInvites)
        localStorage.setItem("invites", JSON.stringify(updatedInvites))
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error)
      // Fallback para funcionamento local
      const newInvite: Invite = {
        id: `inv_${Date.now()}`,
        groupId: group.id,
        createdBy: "1",
        expiresAt: new Date(Date.now() + Number.parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: Number.parseInt(formData.maxUses),
        currentUses: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      }

      const updatedInvites = [newInvite, ...invites]
      setInvites(updatedInvites)
      localStorage.setItem("invites", JSON.stringify(updatedInvites))
      setShowCreateForm(false)
    }
  }

  const handleCopyInviteLink = (inviteId: string) => {
    // Usar a URL correta do frontend
    const inviteUrl = generateInviteLink(inviteId)
    navigator.clipboard.writeText(inviteUrl)
    setCopiedId(inviteId)
    setTimeout(() => setCopiedId(""), 2000)
  }

  const handleShareWhatsApp = (inviteId: string) => {
    const link = generateInviteLink(inviteId)
    const message = `🎯 *Convite para Gestão de Gastos Compartilhados*\n\nOlá! Você foi convidado(a) para participar do grupo *"${group?.name}"* 💰\n\n📊 Organize e controle gastos em grupo de forma fácil e transparente!\n\n👆 Clique no link abaixo para entrar:\n${link}\n\n✨ Vamos economizar juntos!`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleDeleteInvite = (inviteId: string) => {
    if (confirm("Tem certeza que deseja excluir este convite?")) {
      const updatedInvites = invites.filter((inv) => inv.id !== inviteId)
      setInvites(updatedInvites)
      localStorage.setItem("invites", JSON.stringify(updatedInvites))
    }
  }

  const getStatusColor = (invite: Invite) => {
    if (invite.status === "expired" || new Date(invite.expiresAt) < new Date()) {
      return "bg-red-100 text-red-700 border-red-200"
    }
    if (invite.currentUses >= invite.maxUses) {
      return "bg-orange-100 text-orange-700 border-orange-200"
    }
    return "bg-purple-100 text-purple-700 border-purple-200"
  }

  const getStatusText = (invite: Invite) => {
    if (invite.status === "expired" || new Date(invite.expiresAt) < new Date()) {
      return "Expirado"
    }
    if (invite.currentUses >= invite.maxUses) {
      return "Esgotado"
    }
    return "Ativo"
  }

  if (!group) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-to-tr from-violet-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-800 hover:bg-white/60 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="font-semibold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
            Convites
          </h1>
          <div className="w-16" />
        </div>

        {/* Group Info */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 text-white hover:shadow-2xl shadow-purple-500/40 transition-all duration-300">
          <CardContent className="p-4">
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
                <p className="font-semibold">{group.name}</p>
                <p className="text-purple-100 text-sm">{users.length} membros</p>
              </div>
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Invite Button */}
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white shadow-xl shadow-purple-500/30 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl shadow-purple-500/40"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar Novo Convite
          </Button>
        )}

        {/* Create Invite Form */}
        {showCreateForm && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                <Plus className="h-5 w-5 text-purple-600" />
                Novo Convite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Máximo de usos</Label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxUses: e.target.value }))}
                  className="h-10 border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/70 hover:border-purple-300 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                  min="1"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Expira em (dias)</Label>
                <Input
                  type="number"
                  value={formData.expiresIn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiresIn: e.target.value }))}
                  className="h-10 border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/70 hover:border-purple-300 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                  min="1"
                  max="365"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="w-full border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl h-10 transition-all duration-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateInvite}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl h-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Criar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Invites */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent text-lg">
              Convites Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-gray-500 mb-2">Nenhum convite criado ainda</p>
                <p className="text-sm text-gray-400">Crie um convite para adicionar pessoas ao grupo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border ${getStatusColor(invite)}`}>{getStatusText(invite)}</Badge>
                        <span className="text-sm text-gray-600">
                          {invite.currentUses}/{invite.maxUses} usos
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Input
                        value={generateInviteLink(invite.id)}
                        readOnly
                        className="h-8 text-xs bg-white/70 border border-gray-200 rounded-lg flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyInviteLink(invite.id)}
                        className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                          copiedId === invite.id
                            ? "bg-purple-50 border-purple-300 text-purple-600"
                            : "border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
                        }`}
                      >
                        {copiedId === invite.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareWhatsApp(invite.id)}
                        className="flex-1 h-10 text-sm font-medium border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 rounded-lg transition-all duration-200 shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Compartilhar no WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteInvite(invite.id)}
                        className="h-10 w-10 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <ExternalLink className="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-1">Como funciona</h4>
              <p className="text-sm text-purple-700 leading-relaxed">
                Compartilhe o link do convite com as pessoas que você quer adicionar ao grupo. Elas poderão se cadastrar
                e entrar automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
