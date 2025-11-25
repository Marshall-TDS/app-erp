import { api } from './api'

export type UserDTO = {
  id: string
  fullName: string
  login: string
  email: string
  groupIds: string[]
  allowFeatures: string[]
  deniedFeatures: string[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export type CreateUserPayload = {
  fullName: string
  login: string
  email: string
  groupIds: string[]
  allowFeatures: string[]
  deniedFeatures: string[]
  createdBy: string
}

export type UpdateUserPayload = {
  fullName?: string
  login?: string
  email?: string
  groupIds?: string[]
  allowFeatures?: string[]
  deniedFeatures?: string[]
  updatedBy: string
}

const list = () => api.get<UserDTO[]>('/users')
const create = (payload: CreateUserPayload) => api.post<UserDTO>('/users', payload)
const update = (id: string, payload: UpdateUserPayload) => api.put<UserDTO>(`/users/${id}`, payload)
const remove = (id: string) => api.delete<void>(`/users/${id}`)

export const userService = {
  list,
  create,
  update,
  remove,
}

