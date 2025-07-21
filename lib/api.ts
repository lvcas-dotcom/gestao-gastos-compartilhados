// Configuração da API
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000'  // Desenvolvimento local
  : process.env.NEXT_PUBLIC_API_URL || ''  // Produção

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `/api/auth/login`,
    REGISTER: `/api/auth/register`,
    VERIFY: `/api/auth/verify`,
  },
  USER: {
    UPDATE: `/api/user/update`,
    DELETE: `/api/user/delete`,
    GROUPS: `/api/user/groups`,
  },
  GROUPS: {
    CREATE: `/api/groups`,
    LIST: `/api/groups`,
    UPDATE: `/api/groups`,
    DELETE: `/api/groups`,
  },
  INVITES: {
    LIST: `/api/invites`,
    CREATE: `/api/invites`,
    VALIDATE: `/api/invites/validate`,
    ACCEPT: `/api/invites/accept`,
  }
}

export default API_BASE_URL
