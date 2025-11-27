const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3333/api'

const TOKEN_KEY = 'marshall_access_token'
const REFRESH_TOKEN_KEY = 'marshall_refresh_token'
const USER_KEY = 'marshall_user'

// Funções auxiliares para evitar dependência circular
const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

type RequestOptions = RequestInit & {
  parseJson?: boolean
  skipAuth?: boolean
}

async function request<TResponse>(path: string, options: RequestOptions = {}) {
  const { parseJson = true, headers, skipAuth = false, ...rest } = options
  
  // Adicionar token de autenticação se disponível e não for skipAuth
  const authHeaders: Record<string, string> = {}
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      authHeaders.Authorization = `Bearer ${token}`
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders,
      ...headers,
    },
    ...rest,
  })

  // Se receber 401 (não autorizado), pode ser token expirado ou inválido
  // 403 (Forbidden) significa que está autenticado mas sem permissão - não deve redirecionar
  if (response.status === 401 && !skipAuth) {
    // Remover tokens e redirecionar para login
    clearAuth()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`
    try {
      const data = await response.json()
      message = data?.message ?? message
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }

  if (!parseJson || response.status === 204) {
    return null as TResponse
  }

  return (await response.json()) as TResponse
}

export const api = {
  get: <TResponse>(path: string, options?: RequestOptions) => 
    request<TResponse>(path, { method: 'GET', ...options }),
  post: <TResponse>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TResponse>(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: <TResponse>(path: string, body?: unknown, options?: RequestOptions) =>
    request<TResponse>(path, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: <TResponse>(path: string, options?: RequestOptions) => 
    request<TResponse>(path, { method: 'DELETE', ...options }),
}

