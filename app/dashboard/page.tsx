"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import UserManager from "@/lib/userManager"

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

  useEffect(() => {
    if (!isLoading && user) {
      // Carregar dados do grupo se o usuário tem um
      if (user.userGroup) {
        const userGroup = UserManager.getUserGroup(user.id)
        if (userGroup) {
          setGroup(userGroup)
          
          // Carregar membros do grupo
          const allUsers = UserManager.getUsers()
          const members = allUsers.filter(u => u.userGroup === user.userGroup)
          setGroupMembers(members)
        }
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

  const handleLogout = () => {
    logout()
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
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 rounded-full animate-spin mx-auto mb-4">
            <div className="w-12 h-12 bg-white rounded-full m-2"></div>
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent">
            Carregando Dashboard...
          </h2>
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
        <div className="grid grid-cols-3 gap-2 xs:gap-3">
          <Link href="/gastos">
            <Button className="w-full h-10 xs:h-12 sm:h-14 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white shadow-lg xs:shadow-xl shadow-purple-500/30 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl xs:hover:shadow-2xl hover:shadow-purple-500/40 group text-xs xs:text-sm">
              <Plus className="mr-1 h-3 w-3 xs:h-4 xs:w-4" />
              <span>Gasto</span>
            </Button>
          </Link>
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
      </div>
    </div>
  )
}
