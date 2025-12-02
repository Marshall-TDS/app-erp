const API_BASE_URL = import.meta.env.VITE_API_COMUNICACOES_BASE_URL ?? 'http://localhost:3334/api'

export type ComunicacaoDTO = {
  id: string
  seqId?: number
  tipo: 'email'
  descricao: string
  assunto: string
  html: string
  remetenteId: string
  tipoEnvio: 'imediato' | 'agendado'
  chave: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export type CreateComunicacaoPayload = {
  tipo: 'email'
  descricao: string
  assunto: string
  html: string
  remetenteId: string
  tipoEnvio: 'imediato' | 'agendado'
  chave?: string
  createdBy: string
}

export type UpdateComunicacaoPayload = {
  tipo?: 'email'
  descricao?: string
  assunto?: string
  html?: string
  remetenteId?: string
  tipoEnvio?: 'imediato' | 'agendado'
  chave?: string
  updatedBy: string
}

export type SendEmailPayload = {
  chave: string
  destinatario: string
  variaveis: string[]
  anexos?: Array<{
    filename: string
    content: string // base64
    contentType?: string
  }>
}

const list = () => {
  const token = localStorage.getItem('marshall_access_token')
  return fetch(`${API_BASE_URL}/comunicacoes`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: `Erro ${res.status}` }))
      throw new Error(error.message || `Erro ${res.status}`)
    }
    return res.json() as Promise<ComunicacaoDTO[]>
  })
}

const create = (payload: CreateComunicacaoPayload) => {
  const token = localStorage.getItem('marshall_access_token')
  return fetch(`${API_BASE_URL}/comunicacoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: `Erro ${res.status}` }))
      throw new Error(error.message || `Erro ${res.status}`)
    }
    return res.json() as Promise<ComunicacaoDTO>
  })
}

const update = (id: string, payload: UpdateComunicacaoPayload) => {
  const token = localStorage.getItem('marshall_access_token')
  return fetch(`${API_BASE_URL}/comunicacoes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: `Erro ${res.status}` }))
      throw new Error(error.message || `Erro ${res.status}`)
    }
    return res.json() as Promise<ComunicacaoDTO>
  })
}

const remove = (id: string) => {
  const token = localStorage.getItem('marshall_access_token')
  return fetch(`${API_BASE_URL}/comunicacoes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: `Erro ${res.status}` }))
      throw new Error(error.message || `Erro ${res.status}`)
    }
    return undefined
  })
}

const send = (payload: SendEmailPayload) => {
  const token = localStorage.getItem('marshall_access_token')
  return fetch(`${API_BASE_URL}/comunicacoes/enviar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: `Erro ${res.status}` }))
      throw new Error(error.message || `Erro ${res.status}`)
    }
    return res.json() as Promise<{ status: string; message: string }>
  })
}

export const comunicacaoService = {
  list,
  create,
  update,
  remove,
  send,
}

