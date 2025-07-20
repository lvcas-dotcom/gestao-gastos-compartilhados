"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff, UserPlus, User, CheckCircle, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function CadastroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

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

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: 'Este email já está cadastrado' })
        } else if (data.errors) {
          // Tratar erros de validação do backend
          const backendErrors: { [key: string]: string } = {}
          data.errors.forEach((error: any) => {
            if (error.path && error.path[0]) {
              backendErrors[error.path[0]] = error.message
            }
          })
          setErrors(backendErrors)
        } else {
          setErrors({ general: data.message || 'Erro no cadastro' })
        }
        return
      }

      // Cadastro realizado com sucesso
      setIsSuccess(true)
      
      // Salvar token e dados do usuário
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      // Exibir animação de sucesso por 2 segundos
      setTimeout(() => {
        // Redirecionar para login ou dashboard
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Erro na requisição:', error)
      setErrors({ general: 'Erro de conexão. Tente novamente.' })
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 xs:-top-40 -right-20 xs:-right-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-br from-purple-200/40 to-violet-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 xs:-bottom-40 -left-20 xs:-left-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-tr from-blue-200/40 to-indigo-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 text-center px-4">
          <Card className="border-0 shadow-xl xs:shadow-2xl shadow-purple-500/15 bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50 max-w-md mx-auto">
            <CardContent className="p-6 xs:p-8">
              <div className="w-16 h-16 xs:w-20 xs:h-20 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 xs:mb-6 shadow-lg shadow-purple-500/30">
                <CheckCircle className="h-8 w-8 xs:h-10 xs:w-10 text-white" />
              </div>
              <h1 className="text-xl xs:text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2 xs:mb-3">
                Conta Criada com Sucesso!
              </h1>
              <p className="text-gray-600 text-sm xs:text-base leading-relaxed mb-4 xs:mb-6">
                Sua conta foi criada com sucesso. Você será redirecionado para a página de login em instantes.
              </p>
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 xs:-top-40 -right-20 xs:-right-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-br from-purple-200/40 to-violet-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 xs:-bottom-40 -left-20 xs:-left-40 w-40 h-40 xs:w-80 xs:h-80 bg-gradient-to-tr from-blue-200/40 to-indigo-300/40 rounded-full blur-2xl xs:blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 xs:w-96 xs:h-96 bg-gradient-to-r from-violet-200/20 to-purple-200/20 rounded-full blur-2xl xs:blur-3xl" />
      </div>

      <div className="relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-3 xs:py-4 sm:py-6 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-6 xs:mb-8">
          <div className="relative w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center mx-auto mb-0 xs:mb-1 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Logo Controle de Gastos"
              width={150}
              height={150}
              className="object-contain drop-shadow-lg w-20 h-20 xs:w-28 xs:h-28 sm:w-36 sm:h-36 md:w-44 md:h-44"
            />
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent mb-2 xs:mb-3">
            Criar Nova Conta
          </h1>
          <p className="text-gray-600 text-sm xs:text-base sm:text-lg leading-relaxed px-2 xs:px-4">
            Crie sua conta gratuitamente e comece a gerenciar seus gastos compartilhados
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl xs:shadow-2xl shadow-purple-500/15 bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50">
          <CardContent className="p-4 xs:p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-6">
              {/* Nome */}
              <div className="space-y-2 xs:space-y-3">
                <Label
                  htmlFor="name"
                  className="text-gray-700 font-semibold text-sm xs:text-base flex items-center"
                >
                  <User className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`h-10 xs:h-12 sm:h-14 border-2 rounded-lg xs:rounded-xl text-sm xs:text-base transition-all duration-300 ${
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
                    className="text-red-500 text-xs xs:text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* E-mail */}
              <div className="space-y-2 xs:space-y-3">
                <Label
                  htmlFor="email"
                  className="text-gray-700 font-semibold text-sm xs:text-base flex items-center"
                >
                  <Mail className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-10 xs:h-12 sm:h-14 border-2 rounded-lg xs:rounded-xl text-sm xs:text-base transition-all duration-300 ${
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
                    className="text-red-500 text-xs xs:text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2 xs:space-y-3">
                <Label
                  htmlFor="password"
                  className="text-gray-700 font-semibold text-sm xs:text-base flex items-center"
                >
                  <Lock className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha (min. 6 caracteres)"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`h-10 xs:h-12 sm:h-14 border-2 rounded-lg xs:rounded-xl text-sm xs:text-base pr-12 transition-all duration-300 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                    autoComplete="new-password"
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 xs:h-9 xs:w-9 text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3 xs:h-4 xs:w-4" />
                    ) : (
                      <Eye className="h-3 w-3 xs:h-4 xs:w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-red-500 text-xs xs:text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2 xs:space-y-3">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-700 font-semibold text-sm xs:text-base flex items-center"
                >
                  <Lock className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`h-10 xs:h-12 sm:h-14 border-2 rounded-lg xs:rounded-xl text-sm xs:text-base pr-12 transition-all duration-300 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                    autoComplete="new-password"
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 xs:h-9 xs:w-9 text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3 w-3 xs:h-4 xs:w-4" />
                    ) : (
                      <Eye className="h-3 w-3 xs:h-4 xs:w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="text-red-500 text-xs xs:text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Erro geral */}
              {errors.general && (
                <div className="p-3 xs:p-4 bg-red-50 border border-red-200 rounded-lg xs:rounded-xl animate-in slide-in-from-left-2">
                  <p className="text-red-600 text-xs xs:text-sm font-medium flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 xs:h-12 sm:h-14 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white font-semibold text-sm xs:text-base shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-purple-500/40"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm xs:text-base">Criando conta...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 xs:gap-3">
                    <UserPlus className="h-4 w-4 xs:h-5 xs:w-5" />
                    <span className="text-sm xs:text-base">Criar Conta</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4 xs:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm xs:text-base">
                <span className="px-2 bg-white/90 text-gray-500">ou</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm xs:text-base">
                Já tem uma conta?{" "}
                <Link 
                  href="/login" 
                  className="text-purple-600 font-semibold hover:text-purple-700 underline underline-offset-2 hover:underline-offset-4 transition-all"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg xs:rounded-xl p-3 xs:p-4 mt-4 xs:mt-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-start space-x-2 xs:space-x-3">
            <div className="w-5 h-5 xs:w-6 xs:h-6 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="h-2 w-2 xs:h-3 xs:w-3 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-1 text-sm xs:text-base">Por que se cadastrar?</h4>
              <p className="text-xs xs:text-sm text-purple-700 leading-relaxed">
                Tenha acesso completo ao controle de gastos compartilhados, relatórios detalhados e sincronização entre dispositivos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 xs:mt-8 px-2 xs:px-4">
          <p className="text-xs xs:text-sm text-gray-500 leading-relaxed">
            Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade
          </p>
        </div>
      </div>
    </div>
  )
}
