/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações específicas para API
  experimental: {
    // Permitir apenas API routes
    appDir: false
  },
  
  // CORS para permitir acesso do frontend
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.FRONTEND_URL || "http://localhost:3000"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type,Authorization"
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
