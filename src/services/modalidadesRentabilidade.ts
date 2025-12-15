import { api } from './api'

const API_CONTRATOS_URL = import.meta.env.VITE_API_CONTRATOS_BASE_URL ?? 'http://localhost:3336/api'

// Debug: verificar se a variável está sendo lida corretamente
if (typeof window !== 'undefined') {
  console.log('[DEBUG] VITE_API_CONTRATOS_BASE_URL:', import.meta.env.VITE_API_CONTRATOS_BASE_URL)
  console.log('[DEBUG] API_CONTRATOS_URL final:', API_CONTRATOS_URL)
}

export type ModalidadeRentabilidadeDTO = {
  id: string
  seqId?: number | null
  rentabilidadePercentual: number
  prazoMeses: number
  cicloPagamentoId: string
  frequenciaPagamento: number
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt?: string | null
}

export type CreateModalidadeRentabilidadePayload = {
  rentabilidadePercentual: number
  prazoMeses: number
  cicloPagamentoId: string
  frequenciaPagamento: number
  createdBy: string
}

export type UpdateModalidadeRentabilidadePayload = {
  rentabilidadePercentual?: number
  prazoMeses?: number
  cicloPagamentoId?: string
  frequenciaPagamento?: number
  updatedBy: string
}

const adaptModalidadeRentabilidade = (data: any): ModalidadeRentabilidadeDTO => {
  return {
    id: data.id,
    seqId: data.seqId,
    rentabilidadePercentual: data.rentabilidadePercentual,
    prazoMeses: data.prazoMeses,
    cicloPagamentoId: data.cicloPagamentoId,
    frequenciaPagamento: data.frequenciaPagamento,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

const list = async () => {
  const response = await api.get<any[]>('/modalidades-rentabilidade', { baseUrl: API_CONTRATOS_URL })
  return response.map(adaptModalidadeRentabilidade)
}

const create = async (payload: CreateModalidadeRentabilidadePayload) => {
  const response = await api.post<any>('/modalidades-rentabilidade', payload, { baseUrl: API_CONTRATOS_URL })
  return adaptModalidadeRentabilidade(response)
}

const update = async (id: string, payload: UpdateModalidadeRentabilidadePayload) => {
  const response = await api.put<any>(`/modalidades-rentabilidade/${id}`, payload, { baseUrl: API_CONTRATOS_URL })
  return adaptModalidadeRentabilidade(response)
}

const remove = (id: string) => api.delete<void>(`/modalidades-rentabilidade/${id}`, { baseUrl: API_CONTRATOS_URL })

const getById = async (id: string) => {
  const response = await api.get<any>(`/modalidades-rentabilidade/${id}`, { baseUrl: API_CONTRATOS_URL })
  return adaptModalidadeRentabilidade(response)
}

export const modalidadeRentabilidadeService = {
  list,
  create,
  update,
  remove,
  getById,
}

