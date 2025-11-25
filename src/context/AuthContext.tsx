import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authService, type AuthUser } from '../services/auth'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  permissions: string[]
  login: (credentials: { loginOrEmail: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    const loadAuth = () => {
      const storedUser = authService.getUser()
      const storedPermissions = authService.getPermissions()
      
      if (storedUser && authService.isAuthenticated() && !authService.isTokenExpired()) {
        setUser(storedUser)
        setPermissions(storedPermissions)
      } else {
        // Token expirado ou inválido, limpar dados
        authService.logout()
        setUser(null)
        setPermissions([])
      }
      
      setLoading(false)
    }

    loadAuth()
  }, [])

  const login = async (credentials: { loginOrEmail: string; password: string }) => {
    setLoading(true)
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      setPermissions(authService.getPermissions())
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setPermissions([])
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && authService.isAuthenticated() && !authService.isTokenExpired(),
        permissions,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

