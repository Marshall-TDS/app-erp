import { api } from './api'

export type FeatureDefinition = {
  key: string
  name: string
  description: string
}

export type UserGroupDTO = {
  id: string
  name: string
  code: string
  features: string[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export type CreateUserGroupPayload = {
  name: string
  code: string
  features: string[]
  createdBy: string
}

export type UpdateUserGroupPayload = {
  name?: string
  code?: string
  features?: string[]
  updatedBy: string
}

const list = () => api.get<UserGroupDTO[]>('/groups')
const create = (payload: CreateUserGroupPayload) => api.post<UserGroupDTO>('/groups', payload)
const update = (id: string, payload: UpdateUserGroupPayload) =>
  api.put<UserGroupDTO>(`/groups/${id}`, payload)
const remove = (id: string) => api.delete<void>(`/groups/${id}`)
const listFeatures = () => api.get<FeatureDefinition[]>('/features')

export const userGroupService = {
  list,
  create,
  update,
  remove,
  listFeatures,
}

