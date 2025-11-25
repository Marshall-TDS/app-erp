import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Collapse,
  Menu,
  MenuItem,
  Avatar,
  Typography,
} from '@mui/material'
import {
  Menu as MenuIcon,
  MenuOpen,
  NotificationsNone,
  Search,
  Close,
  Logout,
  AccountCircle,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import './style.css'

type TopbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

const Topbar = ({ sidebarOpen, onToggleSidebar }: TopbarProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    filters,
    selectedFilter,
    selectFilter,
    query,
    setQuery,
    placeholder,
    searchOpen,
    setSearchOpen,
  } = useSearch()
  const showSearch = filters.length > 0
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleLogout = async () => {
    handleUserMenuClose()
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      // Se houver erro, ainda assim redireciona para login
      console.error('Erro ao fazer logout:', error)
      navigate('/', { replace: true })
    }
  }

  useEffect(() => {
    if (showSearch) {
      setSearchOpen(true)
    }
  }, [showSearch, setSearchOpen])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleCloseSearch = () => {
    setQuery('')
  }

  const handleInputFocus = () => {
    setFiltersVisible(true)
  }

  const handleInputBlur = () => {
    setFiltersVisible(false)
  }

  return (
    <header className="topbar">
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1.5} 
        className="topbar__content"
        sx={{ width: '100%' }}
      >
        <IconButton
          aria-label={sidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
          onClick={onToggleSidebar}
          className="topbar__toggle"
        >
          {sidebarOpen ? <MenuOpen /> : <MenuIcon />}
        </IconButton>

        {showSearch && (
          <Box className="topbar__search-container topbar__search-container--open">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
              {query && (
                <IconButton
                  size="small"
                  onClick={handleCloseSearch}
                  className="topbar__search-close"
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
              <TextField
                inputRef={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                fullWidth
                size="small"
                className="topbar__search-input"
                InputProps={{
                  startAdornment: (
                    <Search fontSize="small" className="topbar__search-icon" />
                  ),
                }}
              />
            </Stack>
          </Box>
        )}

        {!showSearch && (
          <Box sx={{ flex: 1 }} />
        )}

        <Stack direction="row" alignItems="center" spacing={1} className="topbar__right">
          <Tooltip title="Notificações">
            <IconButton aria-label="Notificações" className="topbar__notif">
              <NotificationsNone />
            </IconButton>
          </Tooltip>
          
          {user && (
            <>
              <Tooltip title="Menu do usuário">
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{ p: 0.5 }}
                  aria-label="Menu do usuário"
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {user.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                      {user.fullName}
                    </Typography>
                  </Stack>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <AccountCircle sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Sair
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>
      </Stack>

      {showSearch && (
        <Collapse in={filtersVisible}>
          <Box className="topbar__search-filters">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {filters.map((filter) => (
                <Chip
                  key={filter.id}
                  label={filter.label}
                  size="small"
                  onClick={() => selectFilter(filter.id)}
                  className={`topbar__filter-chip ${
                    selectedFilter?.id === filter.id ? 'topbar__filter-chip--active' : ''
                  }`}
                />
              ))}
            </Stack>
          </Box>
        </Collapse>
      )}
    </header>
  )
}

export default Topbar
