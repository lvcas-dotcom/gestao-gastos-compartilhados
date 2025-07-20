"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Camera, ArrowRight, Sparkles, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ConfigurarGrupo() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    groupName: "",
    numberOfPeople: "",
    groupPhoto: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [photoPreview, setPhotoPreview] = useState<string>("")

  // Verificar se já existe grupo configurado
  useEffect(() => {
    const groupConfig = localStorage.getItem("groupConfig")
    if (groupConfig) {
      const config = JSON.parse(groupConfig)
      setFormData(config)
      if (config.groupPhoto) {
        setPhotoPreview(config.groupPhoto)
      }
    }
  }, [])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.groupName.trim()) {
      newErrors.groupName = "Nome do grupo é obrigatório"
    } else if (formData.groupName.trim().length < 3) {
      newErrors.groupName = "Nome deve ter pelo menos 3 caracteres"
    }

    if (!formData.numberOfPeople) {
      newErrors.numberOfPeople = "Selecione o número de pessoas"
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

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('http://localhost:3001/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          groupName: formData.groupName,
          numberOfPeople: formData.numberOfPeople
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Salvar configuração do grupo
        localStorage.setItem("groupConfig", JSON.stringify(formData))
        
        // Simular delay de criação
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        // Redirecionar para dashboard
        router.push("/dashboard")
      } else {
        alert(data.message || 'Erro ao criar grupo')
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error)
      alert("Erro ao configurar grupo. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Pular etapa - ir direto para dashboard
    // Útil quando o usuário tem um link de convite
    router.push("/dashboard")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPhotoPreview(result)
        handleInputChange("groupPhoto", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview("")
    handleInputChange("groupPhoto", "")
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
          <div className="relative w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center mx-auto mb-2 xs:mb-3 transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Logo Controle de Gastos"
              width={150}
              height={150}
              className="object-contain drop-shadow-lg w-20 h-20 xs:w-28 xs:h-28 sm:w-36 sm:h-36 md:w-44 md:h-44"
            />
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 via-violet-700 to-blue-700 bg-clip-text text-transparent mb-2 xs:mb-3">
            Configurar Grupo
          </h1>
          <p className="text-gray-600 text-sm xs:text-base sm:text-lg leading-relaxed px-2 xs:px-4">
            Defina o nome do seu grupo e quantas pessoas participarão dos gastos compartilhados
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl xs:shadow-2xl shadow-purple-500/15 bg-white/90 backdrop-blur-xl ring-1 ring-purple-100/50">
          <CardContent className="p-4 xs:p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-6">
              {/* Group Photo */}
              <div className="space-y-2 xs:space-y-3">
                <Label className="text-gray-700 font-semibold text-sm xs:text-base flex items-center">
                  <Camera className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Foto do Grupo (Opcional)
                </Label>
                <div className="flex flex-col items-center gap-3 xs:gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                        <Image
                          src={photoPreview}
                          alt="Prévia da foto do grupo"
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 h-6 w-6 xs:h-8 xs:w-8 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 shadow-lg"
                      >
                        <X className="h-3 w-3 xs:h-4 xs:w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 border-4 border-purple-200 flex items-center justify-center shadow-lg">
                      <Camera className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 text-purple-600" />
                    </div>
                  )}
                  <Label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center px-3 xs:px-4 py-2 xs:py-2.5 bg-gradient-to-r from-purple-100 to-violet-100 hover:from-purple-200 hover:to-violet-200 text-purple-700 text-xs xs:text-sm font-medium rounded-lg xs:rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <Upload className="h-3 w-3 xs:h-4 xs:w-4 mr-2" />
                    {photoPreview ? "Alterar Foto" : "Adicionar Foto"}
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Group Name */}
              <div className="space-y-2 xs:space-y-3">
                <Label
                  htmlFor="groupName"
                  className="text-gray-700 font-semibold text-sm xs:text-base flex items-center"
                >
                  <Users className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Nome do Grupo
                </Label>
                <Input
                  id="groupName"
                  type="text"
                  placeholder="Ex: Casa da Praia, Apartamento dos Amigos..."
                  value={formData.groupName}
                  onChange={(e) => handleInputChange("groupName", e.target.value)}
                  className={`h-10 xs:h-12 sm:h-14 border-2 rounded-lg xs:rounded-xl text-sm xs:text-base transition-all duration-300 ${
                    errors.groupName
                      ? "border-red-300 focus:border-red-500 bg-red-50/50"
                      : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                  } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                  autoComplete="off"
                  aria-describedby={errors.groupName ? "group-name-error" : undefined}
                />
                {errors.groupName && (
                  <p
                    id="group-name-error"
                    className="text-red-500 text-xs xs:text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.groupName}
                  </p>
                )}
              </div>

              {/* Number of People */}
              <div className="space-y-2 xs:space-y-3">
                <Label
                  htmlFor="numberOfPeople"
                  className="text-gray-700 font-semibold text-sm xs:text-base flex items-center"
                >
                  <Users className="h-3 w-3 xs:h-4 xs:w-4 mr-2 text-purple-600" />
                  Número de Pessoas
                </Label>
                <Select
                  value={formData.numberOfPeople}
                  onValueChange={(value) => handleInputChange("numberOfPeople", value)}
                >
                  <SelectTrigger
                    className={`h-10 xs:h-12 sm:h-14 border-2 rounded-lg xs:rounded-xl text-sm xs:text-base transition-all duration-300 ${
                      errors.numberOfPeople
                        ? "border-red-300 focus:border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-purple-500 bg-white/70 hover:border-purple-300"
                    } focus:ring-4 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10`}
                    aria-describedby={errors.numberOfPeople ? "number-people-error" : undefined}
                  >
                    <SelectValue placeholder="Quantas pessoas moram/compartilham?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-purple-100 rounded-lg xs:rounded-xl shadow-xl">
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        className="text-sm xs:text-base hover:bg-purple-50 focus:bg-purple-50"
                      >
                        {num} {num === 1 ? "pessoa" : "pessoas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.numberOfPeople && (
                  <p
                    id="number-people-error"
                    className="text-red-500 text-xs xs:text-sm mt-1 flex items-center animate-in slide-in-from-left-2"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2" />
                    {errors.numberOfPeople}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 xs:h-12 sm:h-14 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white font-semibold text-sm xs:text-base shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-purple-500/40"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm xs:text-base">Criando grupo...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 xs:gap-3">
                    <span className="text-sm xs:text-base">Criar Grupo</span>
                    <ArrowRight className="h-4 w-4 xs:h-5 xs:w-5" />
                  </div>
                )}
              </Button>

              {/* Skip Button */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium text-sm xs:text-base"
                >
                  Pular etapa (tenho link de convite)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg xs:rounded-xl p-3 xs:p-4 mt-4 xs:mt-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-start space-x-2 xs:space-x-3">
            <div className="w-5 h-5 xs:w-6 xs:h-6 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="h-2 w-2 xs:h-3 xs:w-3 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-purple-800 mb-1 text-sm xs:text-base">Duas opções disponíveis</h4>
              <p className="text-xs xs:text-sm text-purple-700 leading-relaxed">
                <strong>Criar grupo:</strong> Configure seu grupo e convide outros membros.<br/>
                <strong>Pular etapa:</strong> Use se já tem um link de convite para entrar em um grupo existente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
