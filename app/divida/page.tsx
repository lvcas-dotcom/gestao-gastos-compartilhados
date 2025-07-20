"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRightLeft,
  CheckCircle,
  ArrowLeft,
  Users,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function DividaPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [paymentAmount, setPaymentAmount] = useState("")
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const user1Data = localStorage.getItem("user1")
    const user2Data = localStorage.getItem("user2")
    const expensesData = localStorage.getItem("expenses")

    if (!user1Data || !user2Data) {
      router.push("/")
      return
    }

    setUsers([JSON.parse(user1Data), JSON.parse(user2Data)])
    setExpenses(JSON.parse(expensesData || "[]"))
  }, [router])

  const calculateBalance = () => {
    let user1Balance = 0
    let user2Balance = 0

    expenses.forEach((expense) => {
      // Usar o valor devido (amount) em vez do valor total
      const owedAmount = expense.amount || 0

      if (expense.paidBy === "1" && expense.owedBy === "2") {
        user1Balance += owedAmount
      } else if (expense.paidBy === "2" && expense.owedBy === "1") {
        user2Balance += owedAmount
      }
    })

    const netBalance = user1Balance - user2Balance
    return {
      user1Owed: netBalance > 0 ? netBalance : 0,
      user2Owed: netBalance < 0 ? Math.abs(netBalance) : 0,
      netBalance,
      user1Paid: user1Balance,
      user2Paid: user2Balance,
      totalExpenses: user1Balance + user2Balance,
    }
  }

  const balance = calculateBalance()
  const debtorName = balance.user1Owed > 0 ? users[1]?.name?.split(" ")[0] : users[0]?.name?.split(" ")[0]
  const creditorName = balance.user1Owed > 0 ? users[0]?.name?.split(" ")[0] : users[1]?.name?.split(" ")[0]
  const debtAmount = Math.max(balance.user1Owed, balance.user2Owed)

  const handlePayment = async () => {
    const amount = Number.parseFloat(paymentAmount)
    if (!amount || amount <= 0) {
      alert("Por favor, insira um valor válido")
      return
    }

    if (amount > debtAmount) {
      alert("O valor não pode ser maior que a dívida atual")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Criar um "pagamento" como gasto negativo ou ajuste
      const paymentExpense = {
        id: Date.now().toString(),
        description: `Pagamento de dívida - R$ ${amount.toFixed(2)}`,
        amount: amount,
        totalAmount: amount,
        category: "Pagamento",
        paidBy: balance.user1Owed > 0 ? "2" : "1", // Quem deve está pagando
        owedBy: balance.user1Owed > 0 ? "1" : "2", // Para quem deve
        splitType: "full",
        date: new Date().toISOString().split("T")[0],
      }

      const updatedExpenses = [paymentExpense, ...expenses]
      setExpenses(updatedExpenses)
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses))

      alert(`Pagamento de R$ ${amount.toFixed(2)} registrado com sucesso!`)
      setPaymentAmount("")
      setShowPaymentForm(false)
    } catch (error) {
      alert("Erro ao registrar pagamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 px-3 xs:px-4 py-4 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto space-y-3 xs:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-800 hover:bg-white/60 rounded-xl transition-all duration-200 h-8 xs:h-10 px-2 xs:px-3"
          >
            <ArrowLeft className="h-3 w-3 xs:h-4 xs:w-4 mr-1" />
            <span className="text-xs xs:text-sm">Voltar</span>
          </Button>
          <h1 className="font-semibold text-sm xs:text-base sm:text-lg bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
            Dívidas
          </h1>
          <div className="w-12 xs:w-16" />
        </div>

        {/* Status da Dívida */}
        <Card className="border-0 shadow-lg xs:shadow-xl hover:shadow-xl hover:shadow-purple-500/10 bg-white/90 backdrop-blur-sm transition-all duration-300">
          <CardHeader className="pb-2 xs:pb-3 p-4 xs:p-6">
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent text-base xs:text-lg sm:text-xl">
              <TrendingUp className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 xs:p-6 pt-0">
            {debtAmount === 0 ? (
              <div className="text-center py-6 xs:py-8">
                <div className="w-12 h-12 xs:w-16 xs:h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 shadow-xl shadow-green-500/30">
                  <CheckCircle className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-lg xs:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Contas em Dia!
                </h3>
                <p className="text-green-600 text-sm xs:text-base">Não há dívidas pendentes entre os usuários</p>
              </div>
            ) : (
              <div className="space-y-4 xs:space-y-6">
                <div className="text-center">
                  <p className="text-xs xs:text-sm text-gray-600 mb-2">Dívida Atual</p>
                  <p className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
                    R$ {debtAmount.toFixed(2)}
                  </p>
                  <div className="inline-flex items-center px-3 xs:px-4 py-1.5 xs:py-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-full text-xs xs:text-sm font-medium">
                    <span className="font-semibold">{debtorName}</span>
                    <ArrowRightLeft className="h-2 w-2 xs:h-3 xs:w-3 mx-1 xs:mx-2" />
                    <span className="font-semibold">{creditorName}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-xl p-3 xs:p-4">
                  <div className="flex justify-between items-center mb-2 xs:mb-3">
                    <span className="text-xs xs:text-sm font-medium text-gray-700 flex items-center gap-1 xs:gap-2">
                      <Sparkles className="h-3 w-3 xs:h-4 xs:w-4 text-purple-600" />
                      Progresso da Dívida
                    </span>
                    <span className="text-xs text-gray-600">
                      {((debtAmount / balance.totalExpenses) * 100).toFixed(1)}% do total
                    </span>
                  </div>
                  <Progress value={(debtAmount / balance.totalExpenses) * 100} className="h-2 xs:h-3" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Detalhado */}
        <div className="grid grid-cols-2 gap-3 xs:gap-4">
          <Card className="border-0 shadow-lg xs:shadow-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300">
            <CardContent className="p-3 xs:p-4">
              <div className="text-center">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 backdrop-blur-sm">
                  <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-semibold mb-1 xs:mb-2 text-sm xs:text-base">{users[0]?.name?.split(" ")[0]}</h3>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold mb-1">R$ {balance.user1Paid.toFixed(2)}</p>
                <p className="text-violet-100 text-xs xs:text-sm">Total Pago</p>
                <div className="mt-2 xs:mt-3 flex items-center justify-center gap-1 p-1.5 xs:p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  {balance.user1Owed > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4" />
                      <span className="text-xs xs:text-sm font-medium">+R$ {balance.user1Owed.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 xs:h-4 xs:w-4 opacity-60" />
                      <span className="text-xs xs:text-sm opacity-60">-R$ {balance.user2Owed.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg xs:shadow-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300">
            <CardContent className="p-3 xs:p-4">
              <div className="text-center">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 backdrop-blur-sm">
                  <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="font-semibold mb-1 xs:mb-2 text-sm xs:text-base">{users[1]?.name?.split(" ")[0]}</h3>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold mb-1">R$ {balance.user2Paid.toFixed(2)}</p>
                <p className="text-blue-100 text-xs xs:text-sm">Total Pago</p>
                <div className="mt-2 xs:mt-3 flex items-center justify-center gap-1 p-1.5 xs:p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  {balance.user2Owed > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4" />
                      <span className="text-xs xs:text-sm font-medium">+R$ {balance.user2Owed.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 xs:h-4 xs:w-4 opacity-60" />
                      <span className="text-xs xs:text-sm opacity-60">-R$ {balance.user1Owed.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pagamento Manual */}
        {debtAmount > 0 && (
          <Card className="border-0 shadow-lg xs:shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="pb-2 xs:pb-3 p-4 xs:p-6">
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent text-base xs:text-lg sm:text-xl">
                <ArrowRightLeft className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600" />
                Registrar Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 xs:p-6 pt-0">
              {!showPaymentForm ? (
                <div className="text-center py-4 xs:py-6">
                  <p className="text-gray-600 mb-3 xs:mb-4 text-sm xs:text-base">
                    Registre um pagamento manual para atualizar o saldo
                  </p>
                  <Button
                    onClick={() => setShowPaymentForm(true)}
                    className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl h-9 xs:h-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm xs:text-base"
                  >
                    <DollarSign className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                    Registrar Pagamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 xs:space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 xs:p-4">
                    <p className="text-blue-800 text-xs xs:text-sm">
                      <strong>{debtorName}</strong> está registrando um pagamento para <strong>{creditorName}</strong>
                    </p>
                  </div>

                  <div className="space-y-2 xs:space-y-3">
                    <Label
                      htmlFor="payment"
                      className="text-gray-700 font-semibold text-sm xs:text-base flex items-center gap-1 xs:gap-2"
                    >
                      <DollarSign className="h-3 w-3 xs:h-4 xs:w-4 text-purple-600" />
                      Valor do Pagamento (R$)
                    </Label>
                    <Input
                      id="payment"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="h-9 xs:h-10 border-2 border-gray-200 focus:border-purple-500 rounded-xl bg-white/70 hover:border-purple-300 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-sm xs:text-base"
                      max={debtAmount}
                    />
                    <p className="text-xs text-gray-500">Máximo: R$ {debtAmount.toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 xs:gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPaymentForm(false)
                        setPaymentAmount("")
                      }}
                      className="w-full border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl h-9 xs:h-10 transition-all duration-200 text-xs xs:text-sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handlePayment}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl h-9 xs:h-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xs xs:text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-1 xs:gap-2">
                          <div className="w-3 h-3 xs:w-4 xs:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">Processando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 xs:gap-2">
                          <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4" />
                          <span>Confirmar</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
