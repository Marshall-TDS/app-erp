const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3333/api'

type RequestOptions = RequestInit & {
  parseJson?: boolean
}

async function request<TResponse>(path: string, options: RequestOptions = {}) {
  const { parseJson = true, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    ...rest,
  })

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
  get: <TResponse>(path: string) => request<TResponse>(path, { method: 'GET' }),
  post: <TResponse>(path: string, body?: unknown) =>
    request<TResponse>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <TResponse>(path: string, body?: unknown) =>
    request<TResponse>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <TResponse>(path: string) => request<TResponse>(path, { method: 'DELETE' }),
}

