"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  Settings,
  Trash2,
  Plus,
  ArrowLeft,
  Search,
  Crown,
  UserPlus,
  LogOut,
  Edit3,
  Sparkles,
  X,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { groupService, type Group as GroupServiceType } from "@/lib/groupService"

interface Group extends GroupServiceType {
  photo?: string
  members?: string[]
  isOwner?: boolean
}

export default function MeusGruposPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [editGroupName, setEditGroupName] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      loadUserGroups()
    }
  }, [user, isLoading, router])

  const loadUserGroups = async () => {
    if (!user) return
    
    try {
      const result = await groupService.getAllUserGroups()
      if (result.success) {
        const mappedGroups: Group[] = result.groups.map(g => ({
          ...g,
          members: [], // Por enquanto vazio, será carregado depois
          isOwner: g.role === 'admin'
        }))
        setGroups(mappedGroups)
      } else {
        // Em caso de erro, usar grupos mock temporariamente
        const mockGroups: Group[] = [
          {
            id: "1",
            name: user?.userGroup || "Meu Grupo Principal",
            description: "Grupo principal para controle de gastos",
            members: ["user1", "user2", "user3"],
            createdBy: user?.id || "user1",
            createdAt: new Date().toISOString(),
            isOwner: true,
            role: 'admin'
          }
        ]

        // Carregar grupos salvos no localStorage
        const savedGroups = localStorage.getItem(`userGroups_${user?.id}`)
        if (savedGroups) {
          const parsedGroups = JSON.parse(savedGroups)
          setGroups([...mockGroups, ...parsedGroups])
        } else {
          setGroups(mockGroups)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      // Grupos mock em caso de erro
      const mockGroups: Group[] = [
        {
          id: "1",
          name: "Meu Grupo Principal",
          description: "Grupo principal para controle de gastos",
          members: ["user1", "user2", "user3"],
          createdBy: user?.id || "user1",
          createdAt: new Date().toISOString(),
          isOwner: true,
          role: 'admin'
        }
      ]
      setGroups(mockGroups)
    }
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      description: "Novo grupo criado",
      members: [user?.id || ""],
      createdBy: user?.id || "",
      createdAt: new Date().toISOString(),
      isOwner: true,
      role: 'admin'
    }

    const updatedGroups = [...groups, newGroup]
    setGroups(updatedGroups)

    // Salvar no localStorage
    const nonMockGroups = updatedGroups.filter(g => g.id !== "1")
    localStorage.setItem(`userGroups_${user?.id}`, JSON.stringify(nonMockGroups))

    setNewGroupName("")
    setIsCreatingGroup(false)
  }

  const handleLeaveGroup = (groupId: string) => {
    const updatedGroups = groups.filter(g => g.id !== groupId)
    setGroups(updatedGroups)

    // Atualizar localStorage
    const nonMockGroups = updatedGroups.filter(g => g.id !== "1")
    localStorage.setItem(`userGroups_${user?.id}`, JSON.stringify(nonMockGroups))
  }

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroup(groupId)
    const group = groups.find(g => g.id === groupId)
    
    if (group) {
      // Salvar configuração do grupo como grupo ativo
      const groupConfig = {
        groupName: group.name,
        numberOfPeople: 1, // Por enquanto, será melhorado depois
        groupPhoto: group.photo,
        activeGroupId: groupId
      }
      localStorage.setItem("groupConfig", JSON.stringify(groupConfig))

      // Redirecionar para dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    }
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setEditGroupName(group.name)
    setShowEditModal(true)
  }

  const handleUpdateGroupName = async () => {
    if (!editingGroup || !editGroupName.trim()) return

    setIsUpdatingGroup(true)

    try {
      // Atualizar o grupo na lista
      const updatedGroups = groups.map(group => 
        group.id === editingGroup.id 
          ? { ...group, name: editGroupName.trim() }
          : group
      )
      
      setGroups(updatedGroups)

      // Salvar no localStorage
      const nonMockGroups = updatedGroups.filter(g => g.id !== "1")
      localStorage.setItem(`userGroups_${user?.id}`, JSON.stringify(nonMockGroups))

      // Se o grupo editado é o grupo ativo, atualizar configuração
      if (user?.userGroup === editingGroup.id || editingGroup.id === "1") {
        const groupConfig = {
          groupName: editGroupName.trim(),
          numberOfPeople: editingGroup.members?.length || 1,
          groupPhoto: editingGroup.photo
        }
        localStorage.setItem("groupConfig", JSON.stringify(groupConfig))
      }

      // Fechar modal
      setShowEditModal(false)
      setEditingGroup(null)
      setEditGroupName("")
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error)
    } finally {
      setIsUpdatingGroup(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!editingGroup) return

    setIsUpdatingGroup(true)

    try {
      // Remover o grupo da lista
      const updatedGroups = groups.filter(g => g.id !== editingGroup.id)
      setGroups(updatedGroups)

      // Atualizar localStorage
      const nonMockGroups = updatedGroups.filter(g => g.id !== "1")
      localStorage.setItem(`userGroups_${user?.id}`, JSON.stringify(nonMockGroups))

      // Se o grupo deletado era o grupo ativo, limpar configuração
      const groupConfig = localStorage.getItem("groupConfig")
      if (groupConfig) {
        const config = JSON.parse(groupConfig)
        if (config.activeGroupId === editingGroup.id) {
          localStorage.removeItem("groupConfig")
        }
      }

      // Fechar modais
      setShowDeleteConfirm(false)
      setShowEditModal(false)
      setEditingGroup(null)
      setEditGroupName("")
    } catch (error) {
      console.error("Erro ao excluir grupo:", error)
    } finally {
      setIsUpdatingGroup(false)
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 xs:-top-40 -right-20 xs:-right-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-br from-purple-200/40 to-violet-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 xs:-bottom-40 -left-20 xs:-left-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-tr from-blue-200/40 to-indigo-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-6 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-4 xs:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 xs:gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 xs:h-10 xs:w-10 p-0 text-gray-600 hover:text-purple-600 hover:bg-purple-50/80 transition-all duration-200 rounded-full"
            >
              <ArrowLeft className="h-4 w-4 xs:h-5 xs:w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent">
              Meus Grupos
            </h1>
            <p className="text-gray-600 text-sm xs:text-base">
              Gerencie e alterne entre seus grupos
            </p>
          </div>
        </div>

        {/* Search and Create */}
        <div className="space-y-3 xs:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 xs:h-12 border-2 border-gray-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl"
            />
          </div>

          {!isCreatingGroup ? (
            <Button
              onClick={() => setIsCreatingGroup(true)}
              className="w-full h-10 xs:h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white shadow-lg rounded-lg xs:rounded-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Grupo
            </Button>
          ) : (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 xs:p-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Nome do Novo Grupo
                  </Label>
                  <Input
                    placeholder="Digite o nome do grupo..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="h-10 xs:h-12 border-2 border-gray-200 focus:border-purple-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateGroup}
                      disabled={!newGroupName.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Criar
                    </Button>
                    <Button
                      onClick={() => {
                        setIsCreatingGroup(false)
                        setNewGroupName("")
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Groups List */}
        <div className="space-y-3 xs:space-y-4">
          {filteredGroups.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 xs:p-8 text-center">
                <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 xs:h-10 xs:w-10 text-purple-600" />
                </div>
                <h3 className="text-lg xs:text-xl font-semibold text-gray-800 mb-2">
                  Nenhum grupo encontrado
                </h3>
                <p className="text-gray-600 text-sm xs:text-base">
                  {searchTerm ? "Tente ajustar sua pesquisa" : "Crie seu primeiro grupo para começar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((group) => (
              <Card
                key={group.id}
                className={`border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${
                  selectedGroup === group.id ? "ring-2 ring-purple-500" : ""
                }`}
              >
                <CardContent className="p-4 xs:p-6">
                  <div className="flex items-start gap-3 xs:gap-4">
                    {/* Group Avatar */}
                    <div className="w-12 h-12 xs:w-14 xs:h-14 bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      {group.photo ? (
                        <Image
                          src={group.photo}
                          alt={group.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Users className="h-6 w-6 xs:h-7 xs:w-7 text-white" />
                      )}
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm xs:text-base line-clamp-1">
                          {group.name}
                        </h3>
                        <div className="flex gap-1">
                          {group.isOwner && (
                            <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Owner
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {group.description && (
                        <p className="text-gray-600 text-xs xs:text-sm mb-2 line-clamp-2">
                          {group.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs xs:text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{group.members?.length || 1} membro{(group.members?.length || 1) > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Criado em {new Date(group.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSelectGroup(group.id)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs xs:text-sm h-8 xs:h-9"
                          disabled={selectedGroup === group.id}
                        >
                          {selectedGroup === group.id ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Settings className="w-3 h-3 mr-1" />
                              Ativar Grupo
                            </>
                          )}
                        </Button>
                        
                        {group.isOwner ? (
                          <Button
                            onClick={() => handleEditGroup(group)}
                            variant="outline"
                            size="sm"
                            className="text-xs xs:text-sm h-8 xs:h-9 border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-300"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleLeaveGroup(group.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs xs:text-sm h-8 xs:h-9 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <LogOut className="w-3 h-3 mr-1" />
                            Sair
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 via-violet-50 to-blue-50">
          <CardContent className="p-4 xs:p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-1 text-sm xs:text-base">
                  Dica sobre Grupos
                </h4>
                <p className="text-purple-700 text-xs xs:text-sm leading-relaxed">
                  Você pode participar de vários grupos e alternar entre eles facilmente. 
                  O grupo ativo será usado para todos os novos gastos registrados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-in zoom-in-95 duration-200">
            <div className="p-4 xs:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg xs:text-xl font-semibold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                  Editar Grupo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingGroup(null)
                    setEditGroupName("")
                  }}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editGroupName" className="text-sm font-medium text-gray-700">
                    Nome do Grupo
                  </Label>
                  <Input
                    id="editGroupName"
                    placeholder="Digite o novo nome do grupo..."
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    className="mt-2 h-10 xs:h-12 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editGroupName.trim()) {
                        handleUpdateGroupName()
                      } else if (e.key === 'Escape') {
                        setShowEditModal(false)
                        setEditingGroup(null)
                        setEditGroupName("")
                      }
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleUpdateGroupName}
                    disabled={!editGroupName.trim() || isUpdatingGroup || editGroupName === editingGroup.name}
                    className="flex-1 h-10 xs:h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {isUpdatingGroup ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 text-sm mb-1">
                        Zona de Perigo
                      </h4>
                      <p className="text-red-700 text-xs mb-3">
                        Esta ação não pode ser desfeita. Todos os dados do grupo serão perdidos permanentemente.
                      </p>
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 h-9"
                        disabled={isUpdatingGroup}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Grupo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && editingGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-in zoom-in-95 duration-200">
            <div className="p-4 xs:p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Tem certeza de que deseja excluir o grupo <strong>"{editingGroup.name}"</strong>? 
                  Todos os dados, gastos e configurações associadas a este grupo serão perdidos permanentemente.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1 h-10 xs:h-12"
                  disabled={isUpdatingGroup}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteGroup}
                  disabled={isUpdatingGroup}
                  className="flex-1 h-10 xs:h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  {isUpdatingGroup ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Grupo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
