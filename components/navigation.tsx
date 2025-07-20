"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Plus, History, TrendingUp, Settings, Menu, LogIn, UserPlus, Share2 } from "lucide-react"
import Image from "next/image"

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/gastos", label: "Gastos", icon: Plus },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/divida", label: "Dívidas", icon: TrendingUp },
  { href: "/convites", label: "Convites", icon: Share2 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 xs:h-16 sm:h-18 lg:h-20">
          <Link href="/" className="flex items-end space-x-2 xs:space-x-3 pb-1">
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-end justify-center pb-1">
              <Image
                src="/logo.png"
                alt="Logo Controle de Gastos"
                width={40}
                height={40}
                className="object-contain w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
              />
            </div>
            <span className="font-code-bold text-gray-800 text-sm xs:text-base sm:text-lg lg:text-xl hidden xs:block pb-2">
              Controle de Gastos
            </span>
            <span className="font-code-bold text-gray-800 text-xs block xs:hidden pb-2">CG</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 text-sm lg:text-base px-3 lg:px-4 py-2 font-code-bold ${
                      isActive ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-700 hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Tablet Navigation */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center justify-center w-10 h-10 ${
                      isActive ? "bg-purple-600 text-white hover:bg-purple-700" : "text-gray-700 hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </Link>
              )
            })}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-700 w-10 h-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col space-y-2 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start space-x-3 h-12 text-base font-code-bold ${
                            isActive
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "text-gray-700 hover:bg-purple-50"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-700 w-8 h-8 xs:w-10 xs:h-10">
                  <Menu className="h-4 w-4 xs:h-5 xs:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 xs:w-72">
                <div className="flex flex-col space-y-2 mt-6 xs:mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start space-x-2 xs:space-x-3 h-10 xs:h-12 text-sm xs:text-base font-code-bold ${
                            isActive
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "text-gray-700 hover:bg-purple-50"
                          }`}
                        >
                          <Icon className="h-4 w-4 xs:h-5 xs:w-5" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    )
                  })}
                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="space-y-2">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start space-x-2 xs:space-x-3 h-10 xs:h-12 text-sm xs:text-base font-code-bold text-gray-700 hover:bg-purple-50"
                        >
                          <LogIn className="h-4 w-4 xs:h-5 xs:w-5" />
                          <span>Entrar</span>
                        </Button>
                      </Link>
                      <Link href="/cadastro" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="default"
                          className="w-full justify-start space-x-2 xs:space-x-3 h-10 xs:h-12 text-sm xs:text-base font-code-bold bg-purple-600 text-white hover:bg-purple-700"
                        >
                          <UserPlus className="h-4 w-4 xs:h-5 xs:w-5" />
                          <span>Criar Conta</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
