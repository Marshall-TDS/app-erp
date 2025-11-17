import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Stack,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import './style.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({ email: '', password: '' })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <Box className="login-page">
      <Box className="login-hero">
        <Typography variant="h3" component="h1">
          Bem-vindo de volta
        </Typography>
        <Typography variant="body1" className="login-hero__text">
          Acompanhe indicadores em tempo real, organize processos e mantenha o
          controle total do seu ERP em um só lugar.
        </Typography>
        <Box className="login-highlight" />
      </Box>

      <Paper elevation={12} className="login-panel">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              Acessar conta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Informe suas credenciais para continuar
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} className="login-form">
            <TextField
              label="E-mail corporativo"
              type="email"
              value={credentials.email}
              onChange={(event) =>
                setCredentials((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              fullWidth
              required
            />

            <TextField
              label="Senha"
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
              >
                Entrar
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
  )
}

export default LoginPage

