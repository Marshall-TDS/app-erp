import { Box, Typography, Button, Stack, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import './style.css'

const DashboardPage = () => {
  const navigate = useNavigate()

  return (
    <Box className="dashboard-page">
      <Paper elevation={8} className="dashboard-card">
        <Typography variant="h3" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Esta é uma visão inicial do seu painel principal. Em breve você verá
          métricas e atalhos essenciais para o ERP.
        </Typography>

        <Stack direction="row" spacing={2} className="dashboard-actions">
          <Button variant="contained" color="primary">
            Nova ação
          </Button>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Voltar ao login
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default DashboardPage

