"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { API_ENDPOINTS } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = "E-mail deve ter um formato válido"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres"
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
    setErrors({}) // Limpar erros anteriores

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ email: "E-mail ou senha incorretos. Verifique suas credenciais." })
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
          setErrors({ general: data.message || 'Erro no login' })
        }
        return
      }

      // Login realizado com sucesso
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      // Após login bem-sucedido, sempre ir para criar-grupo
      // O usuário pode criar um grupo ou pular se já tiver convite
      router.push("/criar-grupo")

    } catch (error) {
      console.error("Erro no login:", error)
      setErrors({ general: "Erro interno. Tente novamente." })
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
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-code-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent mb-2 xs:mb-3">
            Entrar na Conta
          </h1>
          <p className="text-gray-600 text-sm xs:text-base sm:text-lg leading-relaxed px-2 xs:px-4">
            Acesse sua conta para gerenciar seus gastos compartilhados
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl xs:shadow-2xl shadow-purple-500/15 bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50">
          <CardContent className="p-4 xs:p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-6">
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
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`h-10 xs:h-12 sm:h-14 border-2 rounded-lg xs:rounded-xl text-sm xs:text-base pr-12 transition-all duration-300 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                    autoComplete="current-password"
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

              {/* Erro Geral */}
              {errors.general && (
                <div className="p-3 xs:p-4 bg-red-50 border border-red-200 rounded-lg xs:rounded-xl">
                  <p className="text-red-600 text-sm xs:text-base text-center font-medium">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 xs:h-12 sm:h-14 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white font-code-bold text-sm xs:text-base shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-purple-500/40"
              >
                {isLoading ? (
                  <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center gap-2 xs:gap-3">
                    <LogIn className="h-4 w-4 xs:h-5 xs:w-5" />
                    <span className="text-sm xs:text-base">Entrar</span>
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

            {/* Create Account Button */}
            <Link href="/cadastro">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 xs:h-12 sm:h-14 border-2 border-gray-200 hover:border-purple-300 bg-white/70 hover:bg-purple-50/50 text-gray-700 hover:text-purple-700 font-semibold text-sm xs:text-base rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <UserPlus className="h-4 w-4 xs:h-5 xs:w-5" />
                  <span className="text-sm xs:text-base">Criar nova conta</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg xs:rounded-xl p-3 xs:p-4 mt-4 xs:mt-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-start space-x-2 xs:space-x-3">
            <div className="w-5 h-5 xs:w-6 xs:h-6 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="h-2 w-2 xs:h-3 xs:w-3 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-1 text-sm xs:text-base">Primeira vez aqui?</h4>
              <p className="text-xs xs:text-sm text-purple-700 leading-relaxed">
                Crie sua conta gratuitamente e comece a gerenciar seus gastos compartilhados de forma inteligente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 xs:mt-8 px-2 xs:px-4">
          <p className="text-xs xs:text-sm text-gray-500 leading-relaxed">
            Ao fazer login, você concorda com nossos termos de uso e política de privacidade
          </p>
        </div>
      </div>
    </div>
  )
}
