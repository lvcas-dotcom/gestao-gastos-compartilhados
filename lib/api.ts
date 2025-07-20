// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY: `${API_BASE_URL}/api/auth/verify`,
  },
  USER: {
    UPDATE: `${API_BASE_URL}/api/user/update`,
    DELETE: `${API_BASE_URL}/api/user/delete`,
    GROUPS: `${API_BASE_URL}/api/user/groups`,
  },
  GROUPS: {
    CREATE: `${API_BASE_URL}/api/groups`,
    LIST: `${API_BASE_URL}/api/groups`,
    UPDATE: `${API_BASE_URL}/api/groups`,
    DELETE: `${API_BASE_URL}/api/groups`,
  },
  INVITES: {
    LIST: `${API_BASE_URL}/api/invites`,
    CREATE: `${API_BASE_URL}/api/invites`,
    VALIDATE: `${API_BASE_URL}/api/invites/validate`,
    ACCEPT: `${API_BASE_URL}/api/invites/accept`,
  }
}

export default API_BASE_URL
