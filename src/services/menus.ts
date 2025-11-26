import { api } from './api'

export interface MenuDefinition {
    key: string
    category: string
    name: string
    description: string
    url: string
    icon: string
}

export const menusService = {
    getAll: () => api.get<MenuDefinition[]>('/menus'),
}

