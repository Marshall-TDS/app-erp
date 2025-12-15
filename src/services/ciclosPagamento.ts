import { api } from './api'

const API_CONTRATOS_URL = import.meta.env.VITE_API_CONTRATOS_BASE_URL ?? 'http://localhost:3336/api'

export type CicloPagamentoDTO = {
  id: string
  descricao: string
  diaInicioCiclo: number
  diaFimCiclo: number
  diaPagamentoCiclo: number
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt?: string | null
}

export type CreateCicloPagamentoPayload = {
  descricao: string
  diaInicioCiclo: number
  diaFimCiclo: number
  diaPagamentoCiclo: number
  createdBy: string
}

export type UpdateCicloPagamentoPayload = {
  descricao?: string
  diaInicioCiclo?: number
  diaFimCiclo?: number
  diaPagamentoCiclo?: number
  updatedBy: string
}

const adaptCicloPagamento = (data: any): CicloPagamentoDTO => {
  return {
    id: data.id,
    descricao: data.descricao,
    diaInicioCiclo: data.diaInicioCiclo,
    diaFimCiclo: data.diaFimCiclo,
    diaPagamentoCiclo: data.diaPagamentoCiclo,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

const list = async () => {
  const response = await api.get<any[]>('/ciclos-pagamento', { baseUrl: API_CONTRATOS_URL })
  return response.map(adaptCicloPagamento)
}

const create = async (payload: CreateCicloPagamentoPayload) => {
  const response = await api.post<any>('/ciclos-pagamento', payload, { baseUrl: API_CONTRATOS_URL })
  return adaptCicloPagamento(response)
}

const update = async (id: string, payload: UpdateCicloPagamentoPayload) => {
  const response = await api.put<any>(`/ciclos-pagamento/${id}`, payload, { baseUrl: API_CONTRATOS_URL })
  return adaptCicloPagamento(response)
}

const remove = (id: string) => api.delete<void>(`/ciclos-pagamento/${id}`, { baseUrl: API_CONTRATOS_URL })

const getById = async (id: string) => {
  const response = await api.get<any>(`/ciclos-pagamento/${id}`, { baseUrl: API_CONTRATOS_URL })
  return adaptCicloPagamento(response)
}

export const cicloPagamentoService = {
  list,
  create,
  update,
  remove,
  getById,
}

