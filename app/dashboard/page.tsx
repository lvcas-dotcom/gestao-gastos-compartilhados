"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  History,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Share2,
  LogOut,
  Settings,
  X,
  Camera,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { groupService } from "@/lib/groupService"

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  paidBy: string
  owedBy: string
  date: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [group, setGroup] = useState<any>(null)
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showFirstGroupModal, setShowFirstGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupFormData, setGroupFormData] = useState({
    groupName: "",
    numberOfPeople: "",
    groupPhoto: "",
  })
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!isLoading && user) {
      // Verificar se deve mostrar o modal de primeiro grupo
      const shouldShowFirstModal = localStorage.getItem('show_first_group_modal')
      if (shouldShowFirstModal === 'true' && !user.hasGroups) {
        setShowFirstGroupModal(true)
        localStorage.removeItem('show_first_group_modal')
      }

      // Carregar dados dos grupos se o usuário tem grupos
      if (user.hasGroups) {
        loadUserGroups()
      }

      // Carregar configurações do grupo (foto, etc.)
      const groupConfig = localStorage.getItem("groupConfig")
      if (groupConfig) {
        const config = JSON.parse(groupConfig)
        setGroup((prev: any) => ({
          ...prev,
          groupName: config.groupName,
          numberOfPeople: config.numberOfPeople,
          groupPhoto: config.groupPhoto,
        }))
      }

      // Carregar gastos salvos específicos do usuário
      const userExpensesKey = `expenses_${user.id}`
      const savedExpenses = localStorage.getItem(userExpensesKey)
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses))
      }
      // Não carregar dados de exemplo - aplicação limpa para produção
    }
  }, [user, isLoading])

  // Redirect se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const loadUserGroups = async () => {
    if (!user) return
    
    try {
      const result = await groupService.getAllUserGroups()
      if (result.success && result.groups.length > 0) {
        // Usar o primeiro grupo como grupo ativo (pode ser melhorado com seleção)
        const activeGroup = result.groups[0]
        setGroup(activeGroup)
        setGroupMembers([]) // Por enquanto, vamos carregar membros depois
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return

    setIsCreatingGroup(true)

    try {
      // Criar grupo usando groupService
      const result = await groupService.createGroup({
        name: newGroupName.trim()
      })
      
      if (result.success && result.group) {
        // Atualizar estado local
        setGroup(result.group)
        
        // Salvar configuração do grupo
        const groupConfig = {
          groupName: result.group.name,
          numberOfPeople: 1, // Por enquanto só o criador
        }
        localStorage.setItem("groupConfig", JSON.stringify(groupConfig))

        // Recarregar grupos do usuário
        await loadUserGroups()

        // Limpar formulário e fechar modal
        setNewGroupName("")
        setShowCreateGroupModal(false)
        
        // Recarregar dados
        window.location.reload()
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error)
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const validateGroupForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!groupFormData.groupName.trim()) {
      newErrors.groupName = "Nome do grupo é obrigatório"
    } else if (groupFormData.groupName.trim().length < 3) {
      newErrors.groupName = "Nome deve ter pelo menos 3 caracteres"
    }

    if (!groupFormData.numberOfPeople) {
      newErrors.numberOfPeople = "Selecione o número de pessoas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCompleteGroupSetup = async () => {
    if (!validateGroupForm() || !user) return

    setIsCreatingGroup(true)

    try {
      // Criar grupo usando groupService
      const result = await groupService.createGroup({
        name: groupFormData.groupName.trim(),
        description: `Grupo com ${groupFormData.numberOfPeople} pessoas`
      })
      
      if (result.success && result.group) {
        // Salvar configuração do grupo
        const groupConfig = {
          groupName: groupFormData.groupName,
          numberOfPeople: parseInt(groupFormData.numberOfPeople),
          groupPhoto: groupFormData.groupPhoto,
        }
        localStorage.setItem("groupConfig", JSON.stringify(groupConfig))

        // Recarregar grupos do usuário
        await loadUserGroups()

        // Limpar formulário e fechar modal
        setGroupFormData({ groupName: "", numberOfPeople: "", groupPhoto: "" })
        setPhotoPreview("")
        setShowFirstGroupModal(false)
        setErrors({})
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error)
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPhotoPreview(result)
        setGroupFormData((prev) => ({ ...prev, groupPhoto: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateBalance = () => {
    if (!user || groupMembers.length === 0) {
      return { userOwed: 0, userOwes: 0, netBalance: 0 }
    }

    let userOwed = 0  // Quanto outros devem para o usuário atual
    let userOwes = 0  // Quanto o usuário atual deve para outros

    expenses.forEach((expense) => {
      if (expense.paidBy === user.id && expense.owedBy !== user.id) {
        userOwed += expense.amount
      } else if (expense.paidBy !== user.id && expense.owedBy === user.id) {
        userOwes += expense.amount
      }
    })

    const netBalance = userOwed - userOwes
    return { userOwed, userOwes, netBalance }
  }

  const balance = calculateBalance()
  const recentExpenses = expenses.slice(0, 3)

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 rounded-full animate-spin mx-auto">
            <div className="w-12 h-12 bg-white rounded-full m-2"></div>
          </div>
        </div>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Comida: "bg-orange-100 text-orange-700 border-orange-200",
      Transporte: "bg-blue-100 text-blue-700 border-blue-200",
      Lazer: "bg-purple-100 text-purple-700 border-purple-200",
      Compras: "bg-pink-100 text-pink-700 border-pink-200",
      Saúde: "bg-red-100 text-red-700 border-red-200",
      Educação: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Outros: "bg-gray-100 text-gray-700 border-gray-200",
    }
    return colors[category] || colors["Outros"]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 xs:top-20 right-5 xs:right-10 w-32 h-32 xs:w-64 xs:h-64 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full blur-xl xs:blur-2xl" />
        <div className="absolute bottom-10 xs:bottom-20 left-5 xs:left-10 w-32 h-32 xs:w-64 xs:h-64 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-xl xs:blur-2xl" />
      </div>

      <div className="relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-6 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-3 xs:space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center relative">
          {/* Botões do Header */}
          <div className="absolute top-0 right-0 flex gap-2">
            <Link href="/configuracoes">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 xs:h-10 xs:w-10 p-0 text-gray-600 hover:text-purple-600 hover:bg-purple-50/80 transition-all duration-200 rounded-full"
                title="Configurações"
              >
                <Settings className="h-4 w-4 xs:h-5 xs:w-5" />
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="h-8 w-8 xs:h-10 xs:w-10 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200 rounded-full"
              title="Sair da conta"
            >
              <LogOut className="h-4 w-4 xs:h-5 xs:w-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center mb-3 xs:mb-4">
            {group?.groupPhoto ? (
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl xs:rounded-2xl overflow-hidden shadow-lg xs:shadow-xl shadow-purple-500/30 ring-1 xs:ring-2 ring-purple-100">
                <Image
                  src={group.groupPhoto || "/placeholder.svg"}
                  alt="Foto do grupo"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 rounded-xl xs:rounded-2xl flex items-center justify-center shadow-lg xs:shadow-xl shadow-purple-500/30 ring-1 xs:ring-2 ring-purple-100">
                <Users className="h-6 w-6 xs:h-8 xs:w-8 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent mb-1 xs:mb-2">
            {group?.groupName || group?.name || `Olá, ${user.name}`}
          </h1>
          <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
            {group ? 'Controle de gastos compartilhados' : 'Dashboard pessoal - Crie um grupo para começar'}
          </p>
        </div>

        {/* Balance Cards */}
        <div className="space-y-3 xs:space-y-4">
          <Card className="border-0 shadow-lg xs:shadow-xl bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 text-white hover:shadow-xl xs:hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300">
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <h3 className="font-semibold text-sm xs:text-base sm:text-lg">Seu Saldo</h3>
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-white/20 rounded-lg xs:rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="space-y-2 xs:space-y-3">
                <div className="flex justify-between items-center p-2 xs:p-3 bg-white/10 rounded-lg xs:rounded-xl backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <span className="font-medium text-xs xs:text-sm sm:text-base">Você recebe</span>
                  <div className="flex items-center gap-1 xs:gap-2">
                    {balance.userOwed > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4" />
                        <span className="font-bold text-xs xs:text-sm sm:text-base">
                          +R$ {balance.userOwed.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 xs:h-4 xs:w-4 opacity-60" />
                        <span className="font-bold opacity-60 text-xs xs:text-sm sm:text-base">R$ 0,00</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 xs:p-3 bg-white/10 rounded-lg xs:rounded-xl backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <span className="font-medium text-xs xs:text-sm sm:text-base">Você deve</span>
                  <div className="flex items-center gap-1 xs:gap-2">
                    {balance.userOwes > 0 ? (
                      <>
                        <TrendingDown className="h-3 w-3 xs:h-4 xs:w-4" />
                        <span className="font-bold text-xs xs:text-sm sm:text-base">
                          -R$ {balance.userOwes.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 opacity-60" />
                        <span className="font-bold opacity-60 text-xs xs:text-sm sm:text-base">R$ 0,00</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="border-t border-white/20 pt-2 xs:pt-3 mt-3 xs:mt-4">
                  <div className="text-center">
                    <p className="text-xs xs:text-sm opacity-90 mb-1">Saldo Total</p>
                    {balance.netBalance === 0 ? (
                      <p className="font-bold text-sm xs:text-base sm:text-lg text-white">
                        ✅ Tudo certo!
                      </p>
                    ) : balance.netBalance > 0 ? (
                      <p className="font-bold text-sm xs:text-base sm:text-lg text-green-200">
                        +R$ {balance.netBalance.toFixed(2)}
                      </p>
                    ) : (
                      <p className="font-bold text-sm xs:text-base sm:text-lg text-red-200">
                        -R$ {Math.abs(balance.netBalance).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 xs:gap-4">
            <Card className="border-0 shadow-md xs:shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-lg xs:hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-3 xs:p-4 text-center">
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg xs:rounded-xl flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-4 w-4 xs:h-5 xs:w-5 text-blue-600" />
                </div>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                  R${" "}
                  {expenses
                    .filter((exp) => exp.category !== "Pagamento")
                    .reduce((sum, exp) => sum + exp.amount, 0)
                    .toFixed(2)}
                </p>
                <p className="text-xs xs:text-sm text-gray-600">Total Gastos</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md xs:shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-lg xs:hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-3 xs:p-4 text-center">
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg xs:rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600" />
                </div>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                  {expenses.filter((exp) => exp.category !== "Pagamento").length}
                </p>
                <p className="text-xs xs:text-sm text-gray-600">Transações</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Expenses */}
        <Card className="border-0 shadow-md xs:shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-lg xs:hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="pb-2 xs:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm xs:text-base sm:text-lg bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent flex items-center gap-1 xs:gap-2">
                <Sparkles className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600" />
                Gastos Recentes
              </CardTitle>
              <Link href="/historico">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 text-xs xs:text-sm h-6 xs:h-8 px-2 xs:px-3"
                >
                  Ver todos
                  <ArrowUpRight className="h-3 w-3 xs:h-4 xs:w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-3">
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8 xs:py-8">
                <div className="w-14 h-14 xs:w-16 xs:h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 xs:mb-4">
                  <History className="h-7 w-7 xs:h-8 xs:w-8 text-purple-500" />
                </div>
                <p className="text-gray-500 mb-2 xs:mb-2 text-sm xs:text-base font-medium">Nenhum gasto registrado</p>
                <p className="text-gray-400 mb-4 xs:mb-4 text-xs xs:text-sm">Comece adicionando seu primeiro gasto compartilhado</p>
                <Link href="/gastos">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm xs:text-sm h-10 xs:h-10 px-4 xs:px-4">
                    <Plus className="h-4 w-4 xs:h-4 xs:w-4 mr-2 xs:mr-2" />
                    Adicionar Primeiro Gasto
                  </Button>
                </Link>
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start xs:items-center justify-between p-3 xs:p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg xs:rounded-xl hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 pr-3 xs:pr-3">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm xs:text-sm sm:text-base line-clamp-1">
                        {expense.description}
                      </span>
                      <Badge className={`text-xs border ${getCategoryColor(expense.category)} self-start xs:self-auto w-fit mt-1 xs:mt-0 hidden xs:inline-flex`}>
                        {expense.category}
                      </Badge>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs xs:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>
                          {expense.paidBy === user.id ? 'Você' : groupMembers.find((u) => u.id === expense.paidBy)?.name?.split(" ")[0] || 'Alguém'} pagou
                        </span>
                        <span>•</span>
                        <span>
                          {expense.owedBy === user.id ? 'Você' : groupMembers.find((u) => u.id === expense.owedBy)?.name?.split(" ")[0] || 'Alguém'} deve
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(expense.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    {/* Badge mobile */}
                    <Badge className={`text-xs border ${getCategoryColor(expense.category)} w-fit mt-2 xs:hidden`}>
                      {expense.category}
                    </Badge>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-sm xs:text-base sm:text-lg">
                      R$ {expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 xs:gap-3">
          <Link href="/gastos">
            <Button className="w-full h-10 xs:h-12 sm:h-14 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white shadow-lg xs:shadow-xl shadow-purple-500/30 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl xs:hover:shadow-2xl hover:shadow-purple-500/40 group text-xs xs:text-sm">
              <Plus className="mr-1 h-3 w-3 xs:h-4 xs:w-4" />
              <span>Novo Gasto</span>
            </Button>
          </Link>
          <Button 
            onClick={() => setShowCreateGroupModal(true)}
            className="w-full h-10 xs:h-12 sm:h-14 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white shadow-lg xs:shadow-xl shadow-purple-500/30 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl xs:hover:shadow-2xl hover:shadow-purple-500/40 group text-xs xs:text-sm"
          >
            <Users className="mr-1 h-3 w-3 xs:h-4 xs:w-4" />
            <span>Criar Grupo</span>
          </Button>
          <Link href="/divida">
            <Button
              variant="outline"
              className="w-full h-10 xs:h-12 sm:h-14 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 rounded-lg xs:rounded-xl bg-white/80 backdrop-blur-sm shadow-md xs:shadow-lg hover:shadow-lg xs:hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-xs xs:text-sm"
            >
              <TrendingUp className="mr-1 h-3 w-3 xs:h-4 xs:w-4" />
              <span>Dívidas</span>
            </Button>
          </Link>
          <Link href="/convites">
            <Button
              variant="outline"
              className="w-full h-10 xs:h-12 sm:h-14 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-lg xs:rounded-xl bg-white/80 backdrop-blur-sm shadow-md xs:shadow-lg hover:shadow-lg xs:hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-xs xs:text-sm"
            >
              <Share2 className="mr-1 h-3 w-3 xs:h-4 xs:w-4" />
              <span>Convites</span>
            </Button>
          </Link>
        </div>

        {/* Additional Group Management */}
        {group && (
          <div className="mt-4 xs:mt-6">
            <Link href="/meus-grupos">
              <Button
                variant="outline"
                className="w-full h-10 xs:h-12 sm:h-14 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 rounded-lg xs:rounded-xl bg-white/80 backdrop-blur-sm shadow-md xs:shadow-lg hover:shadow-lg xs:hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-xs xs:text-sm"
              >
                <Settings className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                <span>Gerenciar Meus Grupos</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Modal Criar Grupo */}
      {showCreateGroupModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateGroupModal(false)
              setNewGroupName("")
            }
          }}
        >
          <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-in zoom-in-95 duration-200">
            <div className="p-4 xs:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg xs:text-xl font-semibold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                  Criar Novo Grupo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateGroupModal(false)
                    setNewGroupName("")
                  }}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName" className="text-sm font-medium text-gray-700">
                    Nome do Grupo
                  </Label>
                  <Input
                    id="groupName"
                    placeholder="Digite o nome do grupo..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="mt-2 h-10 xs:h-12 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newGroupName.trim()) {
                        handleCreateGroup()
                      } else if (e.key === 'Escape') {
                        setShowCreateGroupModal(false)
                        setNewGroupName("")
                      }
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateGroupModal(false)
                      setNewGroupName("")
                    }}
                    className="flex-1 h-10 xs:h-12"
                    disabled={isCreatingGroup}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || isCreatingGroup}
                    className="flex-1 h-10 xs:h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {isCreatingGroup ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Criar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Primeiro Grupo */}
      {showFirstGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl w-full max-w-lg mx-auto animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-4 xs:p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl xs:text-2xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent mb-2">
                  Configure seu Grupo
                </h2>
                <p className="text-gray-600 text-sm xs:text-base">
                  Vamos configurar seu primeiro grupo para controle de gastos compartilhados
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4 xs:space-y-6">
                {/* Nome do Grupo */}
                <div>
                  <Label htmlFor="firstGroupName" className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-purple-600" />
                    Nome do Grupo
                  </Label>
                  <Input
                    id="firstGroupName"
                    placeholder="Ex: Casa da Família Silva"
                    value={groupFormData.groupName}
                    onChange={(e) => {
                      setGroupFormData(prev => ({ ...prev, groupName: e.target.value }))
                      if (errors.groupName) {
                        setErrors(prev => ({ ...prev, groupName: "" }))
                      }
                    }}
                    className={`h-12 border-2 rounded-lg text-base transition-all duration-300 ${
                      errors.groupName
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20`}
                  />
                  {errors.groupName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                      {errors.groupName}
                    </p>
                  )}
                </div>

                {/* Número de Pessoas */}
                <div>
                  <Label htmlFor="numberOfPeople" className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                    Quantas pessoas no grupo?
                  </Label>
                  <Select
                    value={groupFormData.numberOfPeople}
                    onValueChange={(value) => {
                      setGroupFormData(prev => ({ ...prev, numberOfPeople: value }))
                      if (errors.numberOfPeople) {
                        setErrors(prev => ({ ...prev, numberOfPeople: "" }))
                      }
                    }}
                  >
                    <SelectTrigger className={`h-12 border-2 rounded-lg text-base transition-all duration-300 ${
                      errors.numberOfPeople
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    }`}>
                      <SelectValue placeholder="Selecione o número de pessoas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 pessoas</SelectItem>
                      <SelectItem value="3">3 pessoas</SelectItem>
                      <SelectItem value="4">4 pessoas</SelectItem>
                      <SelectItem value="5">5 pessoas</SelectItem>
                      <SelectItem value="6">6 pessoas</SelectItem>
                      <SelectItem value="7">7 pessoas</SelectItem>
                      <SelectItem value="8">8 pessoas</SelectItem>
                      <SelectItem value="9">9 pessoas</SelectItem>
                      <SelectItem value="10">10+ pessoas</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.numberOfPeople && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                      {errors.numberOfPeople}
                    </p>
                  )}
                </div>

                {/* Upload de Foto */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                    <Camera className="h-4 w-4 mr-2 text-purple-600" />
                    Foto do Grupo (opcional)
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="h-6 w-6 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Label
                        htmlFor="photo-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 rounded-lg text-purple-700 hover:text-purple-800 transition-all"
                      >
                        <Upload className="h-4 w-4" />
                        Escolher Foto
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG até 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCompleteGroupSetup}
                    disabled={isCreatingGroup}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white shadow-lg rounded-lg transition-all duration-300"
                  >
                    {isCreatingGroup ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Criar Grupo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-1 text-sm">
                      Dica para começar
                    </h4>
                    <p className="text-purple-700 text-xs leading-relaxed">
                      Você pode convidar outras pessoas para o grupo depois de criá-lo. 
                      Por enquanto, vamos configurar o básico!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
