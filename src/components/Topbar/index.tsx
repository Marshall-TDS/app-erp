import { useState, type MouseEvent } from 'react'
import {
  Avatar,
  Box,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { DarkMode, Menu as MenuIcon, MenuOpen, NotificationsNone } from '@mui/icons-material'
import './style.css'

type TopbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  themeMode: 'light' | 'dark'
  onChangeTheme: (mode: 'light' | 'dark') => void
}

const Topbar = ({ sidebarOpen, onToggleSidebar, themeMode, onChangeTheme }: TopbarProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null)

  const handleOpenProfileMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setProfileAnchor(event.currentTarget)
  }

  const handleCloseProfileMenu = () => setProfileAnchor(null)

  const profileMenu = (
    <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={handleCloseProfileMenu}>
      <MenuItem className="topbar__theme-item" disableRipple>
        <Stack direction="row" alignItems="center" spacing={1.5} width="100%">
          <DarkMode fontSize="small" />
          <Typography variant="body2" flex={1}>
            Modo escuro
          </Typography>
          <Switch
            size="small"
            checked={themeMode === 'dark'}
            onChange={(event) => onChangeTheme(event.target.checked ? 'dark' : 'light')}
          />
        </Stack>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleCloseProfileMenu}>Meu perfil</MenuItem>
      <MenuItem onClick={handleCloseProfileMenu}>Configurações</MenuItem>
      <MenuItem onClick={handleCloseProfileMenu}>Sair</MenuItem>
    </Menu>
  )

  return (
    <header className="topbar">
      {isMobile ? (
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className="topbar__mobile-row"
          >
            <IconButton
              aria-label={sidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
              onClick={onToggleSidebar}
              className="topbar__toggle"
            >
              {sidebarOpen ? <MenuOpen /> : <MenuIcon />}
            </IconButton>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Notificações">
                <IconButton aria-label="Notificações" className="topbar__notif">
                  <NotificationsNone />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleOpenProfileMenu} className="topbar__avatar-btn">
                <Avatar
                  sx={{ bgcolor: 'var(--color-secondary)', color: 'var(--color-on-primary)' }}
                >
                  TL
                </Avatar>
              </IconButton>
            </Stack>
          </Stack>
        </>
      ) : (
        <>
          <Stack direction="row" alignItems="center" spacing={2} className="topbar__left">
            <IconButton
              aria-label={sidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
              onClick={onToggleSidebar}
              className="topbar__toggle"
            >
              {sidebarOpen ? <MenuOpen /> : <MenuIcon />}
            </IconButton>
            <Box>
              <Typography variant="subtitle2" className="topbar__welcome">
                Bem-vindo(a), Thiago Lamberti
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema Marshall de Gestão
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5} className="topbar__right">
            <Tooltip title="Notificações">
              <IconButton aria-label="Notificações">
                <NotificationsNone />
              </IconButton>
            </Tooltip>
            <Stack direction="row" alignItems="center" spacing={1.5} className="topbar__profile">
              <IconButton onClick={handleOpenProfileMenu} className="topbar__avatar-btn">
                <Avatar
                  sx={{ bgcolor: 'var(--color-secondary)', color: 'var(--color-on-primary)' }}
                >
                  TL
                </Avatar>
              </IconButton>
              <Box className="topbar__profile-info">
                <Typography variant="body2" fontWeight={600}>
                  thiago.lamberti
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrador
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </>
      )}
      {profileMenu}
    </header>
  )
}

export default Topbar

