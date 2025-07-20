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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface User {
  id: string
  name: string
  email: string
}

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
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [group, setGroup] = useState<any>(null)

  const handleLogout = () => {
    // Limpar todos os dados do localStorage se necessário
    // localStorage.clear() - use apenas se quiser limpar tudo
    
    // Ou limpar apenas dados específicos:
    // localStorage.removeItem("user1")
    // localStorage.removeItem("user2")
    // localStorage.removeItem("group")
    
    // Redirecionar para a página de login
    router.push("/")
  }

  useEffect(() => {
    // Verificar se os usuários estão cadastrados
    const user1Data = localStorage.getItem("user1")
    const user2Data = localStorage.getItem("user2")
    const groupData = localStorage.getItem("group")
    const groupConfig = localStorage.getItem("groupConfig")

    if (!user1Data || !user2Data || (!groupData && !groupConfig)) {
      router.push("/")
      return
    }

    setUsers([JSON.parse(user1Data), JSON.parse(user2Data)])
    
    // Priorizar groupConfig que tem a foto, senão usar groupData
    if (groupConfig) {
      const config = JSON.parse(groupConfig)
      setGroup({
        name: config.groupName,
        numberOfPeople: config.numberOfPeople,
        photo: config.groupPhoto, // Esta é a foto do grupo
      })
    } else if (groupData) {
      setGroup(JSON.parse(groupData))
    }

    // Carregar gastos salvos ou usar dados de exemplo
    const savedExpenses = localStorage.getItem("expenses")
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    } else {
      // Dados de exemplo
      const exampleExpenses = [
        {
          id: "1",
          description: "Almoço no restaurante",
          amount: 45.5,
          category: "Comida",
          paidBy: "1",
          owedBy: "2",
          date: new Date().toISOString().split("T")[0],
        },
        {
          id: "2",
          description: "Uber para casa",
          amount: 18.3,
          category: "Transporte",
          paidBy: "2",
          owedBy: "1",
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        },
      ]
      setExpenses(exampleExpenses)
      localStorage.setItem("expenses", JSON.stringify(exampleExpenses))
    }
  }, [router])

  const calculateBalance = () => {
    let user1Balance = 0
    let user2Balance = 0

    expenses.forEach((expense) => {
      if (expense.paidBy === "1" && expense.owedBy === "2") {
        user1Balance += expense.amount
      } else if (expense.paidBy === "2" && expense.owedBy === "1") {
        user2Balance += expense.amount
      }
    })

    const netBalance = user1Balance - user2Balance
    return {
      user1Owed: netBalance > 0 ? netBalance : 0,
      user2Owed: netBalance < 0 ? Math.abs(netBalance) : 0,
      netBalance,
    }
  }

  const balance = calculateBalance()
  const recentExpenses = expenses.slice(0, 3)

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Comida: "bg-orange-100 text-orange-700 border-orange-200",
      Transporte: "bg-blue-100 text-blue-700 border-blue-200",
      Lazer: "bg-purple-100 text-purple-700 border-purple-200",
      Compras: "bg-pink-100 text-pink-700 border-pink-200",
      Saúde: "bg-red-100 text-red-700 border-red-200",
      Educação: "bg-indigo-100 text-indigo-200",
      Outros: "bg-gray-100 text-gray-700 border-gray-200",
    }
    return colors[category] || colors["Outros"]
  }

  if (!group || users.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 xs:top-20 right-5 xs:right-10 w-32 h-32 xs:w-64 xs:h-64 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full blur-xl xs:blur-2xl" />
        <div className="absolute bottom-10 xs:bottom-20 left-5 xs:left-10 w-32 h-32 xs:w-64 xs:h-64 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-xl xs:blur-2xl" />
      </div>

      <div className="relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 py-3 xs:py-4 sm:py-6 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-3 xs:space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center relative">
          {/* Botão de Logout */}
          <div className="absolute top-0 right-0">
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
            {group?.photo ? (
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl xs:rounded-2xl overflow-hidden shadow-lg xs:shadow-xl shadow-purple-500/30 ring-1 xs:ring-2 ring-purple-100">
                <Image
                  src={group.photo || "/placeholder.svg"}
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
            {group?.name || "Grupo"}
          </h1>
          <p className="text-gray-600 text-xs xs:text-sm sm:text-base">Controle de gastos compartilhados</p>
        </div>

        {/* Balance Cards */}
        <div className="space-y-3 xs:space-y-4">
          <Card className="border-0 shadow-lg xs:shadow-xl bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 text-white hover:shadow-xl xs:hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300">
            <CardContent className="p-3 xs:p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <h3 className="font-semibold text-sm xs:text-base sm:text-lg">Saldo Atual</h3>
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-white/20 rounded-lg xs:rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="space-y-2 xs:space-y-3">
                <div className="flex justify-between items-center p-2 xs:p-3 bg-white/10 rounded-lg xs:rounded-xl backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <span className="font-medium text-xs xs:text-sm sm:text-base">{users[0]?.name?.split(" ")[0]}</span>
                  <div className="flex items-center gap-1 xs:gap-2">
                    {balance.user1Owed > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4" />
                        <span className="font-bold text-xs xs:text-sm sm:text-base">
                          +R$ {balance.user1Owed.toFixed(2)}
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
                  <span className="font-medium text-xs xs:text-sm sm:text-base">{users[1]?.name?.split(" ")[0]}</span>
                  <div className="flex items-center gap-1 xs:gap-2">
                    {balance.user2Owed > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4" />
                        <span className="font-bold text-xs xs:text-sm sm:text-base">
                          +R$ {balance.user2Owed.toFixed(2)}
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
                <p className="text-gray-500 mb-4 xs:mb-4 text-sm xs:text-base">Nenhum gasto registrado ainda</p>
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
                        <span>{users.find((u) => u.id === expense.paidBy)?.name?.split(" ")[0]} pagou</span>
                        <span>•</span>
                        <span>{users.find((u) => u.id === expense.owedBy)?.name?.split(" ")[0]} deve</span>
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
              className="w-full h-10 xs:h-12 sm:h-14 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 rounded-lg xs:rounded-xl bg-white/80 backdrop-blur-sm shadow-md xs:shadow-lg hover:shadow-lg xs:hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-xs xs:text-sm"
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
