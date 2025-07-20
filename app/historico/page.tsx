"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Tag,
  TrendingUp,
  TrendingDown,
  Users,
  Calculator,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import UserManager from "@/lib/userManager"

const categories = [
  { value: "Comida", label: "🍽️ Comida", color: "bg-orange-100 text-orange-700" },
  { value: "Transporte", label: "🚗 Transporte", color: "bg-blue-100 text-blue-700" },
  { value: "Lazer", label: "🎮 Lazer", color: "bg-purple-100 text-purple-700" },
  { value: "Compras", label: "🛍️ Compras", color: "bg-pink-100 text-pink-700" },
  { value: "Saúde", label: "🏥 Saúde", color: "bg-red-100 text-red-700" },
  { value: "Educação", label: "📚 Educação", color: "bg-indigo-100 text-indigo-700" },
  { value: "Pagamento", label: "💰 Pagamento", color: "bg-green-100 text-green-700" },
  { value: "Outros", label: "📦 Outros", color: "bg-gray-100 text-gray-700" },
]

export default function HistoricoPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      // Carregar gastos específicos do usuário
      const userExpensesKey = `expenses_${user.id}`
      const expensesData = localStorage.getItem(userExpensesKey)
      const expensesArray = JSON.parse(expensesData || "[]")

      // Carregar membros do grupo se existir
      if (user.userGroup) {
        const allUsers = UserManager.getUsers()
        const members = allUsers.filter(u => u.userGroup === user.userGroup)
        setUsers(members)
      } else {
        setUsers([user])
      }

      setExpenses(expensesArray)
      setFilteredExpenses(expensesArray)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    let filtered = expenses

    if (searchTerm) {
      filtered = filtered.filter((expense) => expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((expense) => expense.category === categoryFilter)
    }

    if (userFilter !== "all") {
      filtered = filtered.filter((expense) => expense.paidBy === userFilter || expense.owedBy === userFilter)
    }

    setFilteredExpenses(filtered)
  }, [searchTerm, categoryFilter, userFilter, expenses])

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name.split(" ")[0] : "Usuário"
  }

  const getCategoryInfo = (category: string) => {
    return categories.find((cat) => cat.value === category) || categories[categories.length - 1]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const getTotalStats = () => {
    const total = expenses.reduce((sum, expense) => sum + (expense.totalAmount || expense.amount), 0)
    const totalOwed = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return { total, totalOwed, count: expenses.length }
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 px-3 xs:px-4 py-4 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-3 xs:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 xs:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-800 hover:bg-white/60 rounded-xl transition-all duration-200 h-8 xs:h-10 px-2 xs:px-3"
          >
            <ArrowLeft className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
            <span className="text-xs xs:text-sm">Voltar</span>
          </Button>
          <h1 className="font-semibold text-sm xs:text-base sm:text-lg bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
            Histórico
          </h1>
          <div className="w-12 xs:w-16" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 xs:gap-3 mb-4 xs:mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-3 xs:p-4 text-center">
              <DollarSign className="h-4 w-4 xs:h-5 xs:w-5 mx-auto mb-1 xs:mb-2" />
              <p className="text-lg xs:text-xl font-bold">R$ {stats.total.toFixed(2)}</p>
              <p className="text-xs xs:text-sm text-blue-100">Total Gasto</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-3 xs:p-4 text-center">
              <Calculator className="h-4 w-4 xs:h-5 xs:w-5 mx-auto mb-1 xs:mb-2" />
              <p className="text-lg xs:text-xl font-bold">R$ {stats.totalOwed.toFixed(2)}</p>
              <p className="text-xs xs:text-sm text-purple-100">Total Devido</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <CardContent className="p-3 xs:p-4 text-center">
              <Tag className="h-4 w-4 xs:h-5 xs:w-5 mx-auto mb-1 xs:mb-2" />
              <p className="text-lg xs:text-xl font-bold">{stats.count}</p>
              <p className="text-xs xs:text-sm text-indigo-100">Transações</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2 xs:pb-3 p-3 xs:p-4">
            <CardTitle className="flex items-center gap-2 text-gray-700 text-sm xs:text-base">
              <Filter className="h-4 w-4 xs:h-5 xs:w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 xs:p-4 pt-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              <Input
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 xs:pl-10 h-8 xs:h-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 text-xs xs:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 xs:gap-3">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 xs:h-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 text-xs xs:text-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-xs xs:text-sm">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* User Filter */}
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-8 xs:h-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/70 text-xs xs:text-sm">
                  <SelectValue placeholder="Usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="text-xs xs:text-sm">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || categoryFilter !== "all" || userFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                  setUserFilter("all")
                }}
                className="w-full h-8 xs:h-9 text-xs xs:text-sm border-2 border-gray-200 hover:border-gray-300 rounded-xl"
              >
                Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Expenses List */}
        <div className="space-y-2 xs:space-y-3">
          {filteredExpenses.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 xs:p-8 text-center">
                <div className="w-12 h-12 xs:w-16 xs:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                  <Search className="h-6 w-6 xs:h-8 xs:w-8 text-gray-400" />
                </div>
                <h3 className="text-base xs:text-lg font-semibold text-gray-700 mb-2">Nenhum gasto encontrado</h3>
                <p className="text-xs xs:text-sm text-gray-500">
                  {expenses.length === 0
                    ? "Ainda não há gastos registrados"
                    : "Tente ajustar os filtros para encontrar o que procura"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredExpenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category)
              const paidByName = getUserName(expense.paidBy)
              const owedByName = getUserName(expense.owedBy)
              const isPayment = expense.category === "Pagamento"

              return (
                <Card
                  key={expense.id}
                  className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${categoryInfo.color} text-xs px-2 py-1 rounded-full font-medium`}>
                            {categoryInfo.label}
                          </Badge>
                          {expense.splitType === "half" && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                              <Users className="h-3 w-3 mr-1" />
                              Dividido
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-800 text-sm xs:text-base mb-1 truncate">
                          {expense.description}
                        </h3>

                        <div className="flex items-center gap-4 text-xs xs:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(expense.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {paidByName} → {owedByName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="space-y-1">
                          {expense.totalAmount && expense.totalAmount !== expense.amount ? (
                            <>
                              <p className="text-xs text-gray-500">Total: R$ {expense.totalAmount.toFixed(2)}</p>
                              <p
                                className={`text-sm xs:text-base font-bold ${
                                  isPayment ? "text-green-600" : "text-purple-600"
                                }`}
                              >
                                {isPayment ? (
                                  <span className="flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3" />
                                    R$ {expense.amount.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    R$ {expense.amount.toFixed(2)}
                                  </span>
                                )}
                              </p>
                            </>
                          ) : (
                            <p
                              className={`text-sm xs:text-base font-bold ${
                                isPayment ? "text-green-600" : "text-purple-600"
                              }`}
                            >
                              {isPayment ? (
                                <span className="flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" />
                                  R$ {expense.amount.toFixed(2)}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  R$ {expense.amount.toFixed(2)}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
