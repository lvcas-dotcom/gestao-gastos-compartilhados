import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Controle de Gastos Compartilhados",
  description: "Gerencie gastos compartilhados de forma inteligente e organizada",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function cleanupExtensionInterference() {
                  // Remove classes injetadas pela extensão ColorZilla
                  const elementsWithExtensionClass = document.querySelectorAll('[class*="__className_"]');
                  elementsWithExtensionClass.forEach(el => {
                    el.classList.forEach(className => {
                      if (className.includes('__className_')) {
                        el.classList.remove(className);
                      }
                    });
                  });
                  
                  // Remove atributo cz-shortcut-listen se estiver causando problemas
                  const elementsWithCzAttr = document.querySelectorAll('[cz-shortcut-listen]');
                  elementsWithCzAttr.forEach(el => {
                    el.removeAttribute('cz-shortcut-listen');
                  });
                }
                
                // Execute imediatamente
                cleanupExtensionInterference();
                
                // Execute após o DOM estar pronto
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', cleanupExtensionInterference);
                } else {
                  cleanupExtensionInterference();
                }
                
                // Execute periodicamente para limpar interferências contínuas
                setInterval(cleanupExtensionInterference, 1000);
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
