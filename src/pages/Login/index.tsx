import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Link,
  Stack,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import videoLogin from '../../assets/videos/video-login.mp4'
import logoMarshall from '../../assets/images/logo-marshall.svg'
import './style.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ loginOrEmail: '', password: '' })

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  // Não renderizar enquanto verifica autenticação
  if (authLoading || isAuthenticated) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(credentials)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="login-page">
      {/* Vídeo de fundo em tela cheia */}
      <Box className="login-video-container">
        <video
          className="login-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoLogin} type="video/mp4" />
        </video>
        {/* Overlay preto com opacidade */}
        <Box className="login-video-overlay" />
      </Box>

      {/* Paper centralizado com logo e formulário */}
      <Box className="login-content-wrapper">
        <Paper 
          elevation={24} 
          className="login-panel"
          sx={{
            backgroundColor: 'transparent',
            backgroundImage: 'none',
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Logo */}
            <Box className="login-logo-wrapper">
              <img src={logoMarshall} alt="Marshall ERP" className="login-logo" />
            </Box>

            {/* Formulário */}
            <Box component="form" onSubmit={handleSubmit} className="login-form" sx={{ width: '100%' }}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                placeholder="Digite seu login ou e-mail"
                type="text"
                value={credentials.loginOrEmail}
                onChange={(event) =>
                  setCredentials((prev) => ({
                    ...prev,
                    loginOrEmail: event.target.value,
                  }))
                }
                fullWidth
                required
                disabled={loading}
                autoComplete="username"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.4)',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(0, 0, 0, 0.4)',
                    opacity: 1,
                  },
                }}
              />

              <TextField
                placeholder="Digite sua senha"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                fullWidth
                required
                disabled={loading}
                autoComplete="current-password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.4)',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(0, 0, 0, 0.4)',
                    opacity: 1,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="mostrar senha"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                <Link
                  component="button"
                  type="button"
                  className="forgot-password"
                  underline="none"
                >
                  Esqueci minha senha
                </Link>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}

export default LoginPage

