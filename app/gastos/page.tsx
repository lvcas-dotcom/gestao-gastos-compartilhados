"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, DollarSign, User, Tag, ArrowLeft, CheckCircle, Sparkles, Users, Calculator } from "lucide-react"
import { useRouter } from "next/navigation"

const categories = [
  { value: "Comida", label: "🍽️ Comida", color: "bg-orange-100 text-orange-700" },
  { value: "Transporte", label: "🚗 Transporte", color: "bg-blue-100 text-blue-700" },
  { value: "Lazer", label: "🎮 Lazer", color: "bg-purple-100 text-purple-700" },
  { value: "Compras", label: "🛍️ Compras", color: "bg-pink-100 text-pink-700" },
  { value: "Saúde", label: "🏥 Saúde", color: "bg-red-100 text-red-700" },
  { value: "Educação", label: "📚 Educação", color: "bg-indigo-100 text-indigo-700" },
  { value: "Outros", label: "📦 Outros", color: "bg-gray-100 text-gray-700" },
]

export default function GastosPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    paidBy: "",
    owedBy: "",
    splitType: "full", // "full" = valor total, "half" = dividir pela metade
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const user1Data = localStorage.getItem("user1")
    const user2Data = localStorage.getItem("user2")

    if (!user1Data || !user2Data) {
      router.push("/")
      return
    }

    setUsers([JSON.parse(user1Data), JSON.parse(user2Data)])
  }, [router])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }

    if (!formData.amount) {
      newErrors.amount = "Valor é obrigatório"
    } else if (Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valor deve ser maior que zero"
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    if (!formData.paidBy) {
      newErrors.paidBy = "Selecione quem pagou"
    }

    if (!formData.owedBy) {
      newErrors.owedBy = "Selecione quem deve"
    }

    if (formData.paidBy && formData.owedBy && formData.paidBy === formData.owedBy) {
      newErrors.owedBy = "A pessoa que pagou deve ser diferente da que deve"
    }

    if (!formData.splitType) {
      newErrors.splitType = "Selecione o tipo de divisão"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateOwedAmount = () => {
    const totalAmount = Number.parseFloat(formData.amount) || 0
    return formData.splitType === "half" ? totalAmount / 2 : totalAmount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const totalAmount = Number.parseFloat(formData.amount)
      const owedAmount = calculateOwedAmount()

      // Criar novo gasto
      const newExpense = {
        id: Date.now().toString(),
        description: formData.description,
        amount: owedAmount, // Valor que será devido
        totalAmount: totalAmount, // Valor total gasto
        category: formData.category,
        paidBy: formData.paidBy,
        owedBy: formData.owedBy,
        splitType: formData.splitType,
        date: new Date().toISOString().split("T")[0],
      }

      // Salvar no localStorage
      const existingExpenses = JSON.parse(localStorage.getItem("expenses") || "[]")
      const updatedExpenses = [newExpense, ...existingExpenses]
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses))

      router.push("/dashboard")
    } catch (error) {
      alert("Erro ao adicionar gasto. Tente novamente.")
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

  const getOwedByUser = () => {
    return users.find((user) => user.id === formData.owedBy)
  }

  const getPaidByUser = () => {
    return users.find((user) => user.id === formData.paidBy)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-32 h-32 xs:w-48 xs:h-48 sm:w-64 sm:h-64 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 px-3 xs:px-4 py-4 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
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
          <h1 className="font-semibold text-sm xs:text-base sm:text-lg bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
            Novo Gasto
          </h1>
          <div className="w-12 xs:w-16" />
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-lg xs:shadow-xl sm:shadow-2xl shadow-purple-500/10 xs:shadow-purple-500/15 bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50">
          <CardHeader className="pb-3 xs:pb-4 p-4 xs:p-6">
            <CardTitle className="flex items-center gap-2 xs:gap-3 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent text-base xs:text-lg sm:text-xl">
              <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                <Plus className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600" />
              </div>
              Adicionar Gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4 p-4 xs:p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
              {/* Descrição */}
              <div className="space-y-2 xs:space-y-3">
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-semibold text-sm xs:text-base flex items-center"
                >
                  <Sparkles className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Descrição do Gasto
                </Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Almoço no restaurante, Uber para casa..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`min-h-[60px] xs:min-h-[80px] border-2 rounded-xl text-sm xs:text-base resize-none transition-all duration-300 ${
                    errors.description
                      ? "border-red-300 focus:border-red-500 bg-red-50/50"
                      : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                  } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p
                    id="description-error"
                    className="text-red-500 text-xs xs:text-sm flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Valor */}
              <div className="space-y-2 xs:space-y-3">
                <Label htmlFor="amount" className="text-gray-700 font-semibold text-sm xs:text-base flex items-center">
                  <DollarSign className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Valor Total (R$)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`h-10 xs:h-12 border-2 rounded-xl text-sm xs:text-base transition-all duration-300 ${
                    errors.amount
                      ? "border-red-300 focus:border-red-500 bg-red-50/50"
                      : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                  } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                />
                {errors.amount && (
                  <p
                    id="amount-error"
                    className="text-red-500 text-xs xs:text-sm flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Categoria */}
              <div className="space-y-2 xs:space-y-3">
                <Label className="text-gray-700 font-semibold text-sm xs:text-base flex items-center">
                  <Tag className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Categoria
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger
                    className={`h-10 xs:h-12 border-2 rounded-xl text-sm xs:text-base transition-all duration-300 ${
                      errors.category
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                    aria-describedby={errors.category ? "category-error" : undefined}
                  >
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="border-purple-200">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="hover:bg-purple-50 text-sm xs:text-base"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p
                    id="category-error"
                    className="text-red-500 text-xs xs:text-sm flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Quem Pagou */}
              <div className="space-y-2 xs:space-y-3">
                <Label className="text-gray-700 font-semibold text-sm xs:text-base flex items-center">
                  <User className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Quem Pagou
                </Label>
                <Select value={formData.paidBy} onValueChange={(value) => handleInputChange("paidBy", value)}>
                  <SelectTrigger
                    className={`h-10 xs:h-12 border-2 rounded-xl text-sm xs:text-base transition-all duration-300 ${
                      errors.paidBy
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                    aria-describedby={errors.paidBy ? "paid-by-error" : undefined}
                  >
                    <SelectValue placeholder="Selecione quem pagou" />
                  </SelectTrigger>
                  <SelectContent className="border-purple-200">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="hover:bg-purple-50 text-sm xs:text-base">
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paidBy && (
                  <p
                    id="paid-by-error"
                    className="text-red-500 text-xs xs:text-sm flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.paidBy}
                  </p>
                )}
              </div>

              {/* Quem Deve */}
              <div className="space-y-2 xs:space-y-3">
                <Label className="text-gray-700 font-semibold text-sm xs:text-base flex items-center">
                  <User className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Quem Deve
                </Label>
                <Select value={formData.owedBy} onValueChange={(value) => handleInputChange("owedBy", value)}>
                  <SelectTrigger
                    className={`h-10 xs:h-12 border-2 rounded-xl text-sm xs:text-base transition-all duration-300 ${
                      errors.owedBy
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                    aria-describedby={errors.owedBy ? "owed-by-error" : undefined}
                  >
                    <SelectValue placeholder="Selecione quem deve" />
                  </SelectTrigger>
                  <SelectContent className="border-purple-200">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="hover:bg-purple-50 text-sm xs:text-base">
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.owedBy && (
                  <p
                    id="owed-by-error"
                    className="text-red-500 text-xs xs:text-sm flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.owedBy}
                  </p>
                )}
              </div>

              {/* Tipo de Divisão */}
              <div className="space-y-2 xs:space-y-3">
                <Label className="text-gray-700 font-semibold text-sm xs:text-base flex items-center">
                  <Calculator className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Como Dividir a Conta
                </Label>
                <RadioGroup
                  value={formData.splitType}
                  onValueChange={(value) => handleInputChange("splitType", value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 xs:p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300 bg-white/50">
                    <RadioGroupItem value="full" id="full" className="text-purple-600" />
                    <div className="flex-1">
                      <Label
                        htmlFor="full"
                        className="text-sm xs:text-base font-medium text-gray-700 cursor-pointer flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Valor Total
                      </Label>
                      <p className="text-xs xs:text-sm text-gray-500 mt-1">
                        {getOwedByUser()?.name?.split(" ")[0]} deve pagar o valor total da conta
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 xs:p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300 bg-white/50">
                    <RadioGroupItem value="half" id="half" className="text-purple-600" />
                    <div className="flex-1">
                      <Label
                        htmlFor="half"
                        className="text-sm xs:text-base font-medium text-gray-700 cursor-pointer flex items-center gap-2"
                      >
                        <Users className="h-4 w-4 text-blue-600" />
                        Dividir pela Metade
                      </Label>
                      <p className="text-xs xs:text-sm text-gray-500 mt-1">
                        {getOwedByUser()?.name?.split(" ")[0]} deve pagar apenas metade da conta
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                {errors.splitType && (
                  <p className="text-red-500 text-xs xs:text-sm flex items-center animate-in slide-in-from-left-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.splitType}
                  </p>
                )}
              </div>

              {/* Preview do Cálculo */}
              {formData.amount && formData.splitType && getOwedByUser() && getPaidByUser() && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-3 xs:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-purple-600" />
                    <span className="text-sm xs:text-base font-semibold text-purple-700">Resumo do Cálculo</span>
                  </div>
                  <div className="space-y-2 text-xs xs:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor total da conta:</span>
                      <span className="font-semibold">R$ {Number.parseFloat(formData.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getOwedByUser()?.name?.split(" ")[0]} deve pagar:</span>
                      <span className="font-bold text-purple-700">
                        R$ {calculateOwedAmount().toFixed(2)}
                        {formData.splitType === "half" && <span className="text-xs text-gray-500 ml-1">(metade)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{getPaidByUser()?.name?.split(" ")[0]} pagou:</span>
                      <span className="font-semibold text-green-600">
                        R$ {Number.parseFloat(formData.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 xs:h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white font-semibold text-sm xs:text-base shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-purple-500/40 group"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs xs:text-sm">Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 xs:gap-3">
                    <CheckCircle className="h-4 w-4 xs:h-5 xs:w-5" />
                    <span>Adicionar Gasto</span>
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
