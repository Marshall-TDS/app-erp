import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Switch,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Inventory2Outlined,
  PeopleAltOutlined,
  AdminPanelSettingsOutlined,
  Groups2Outlined,
  ChevronLeft,
  DarkMode,
  Logout,
} from '@mui/icons-material'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import React, { useEffect, useState, useMemo } from 'react'
import { menusService, type MenuDefinition } from '../../services/menus'
import { useAuth } from '../../context/AuthContext'
import logoMarshall from '../../assets/images/logo-marshall.svg'
import './style.css'

const iconMapping: Record<string, React.ReactElement> = {
  People: <PeopleAltOutlined />,
  Groups: <Groups2Outlined />,
  AdminPanelSettings: <AdminPanelSettingsOutlined />,
  Inventory: <Inventory2Outlined />,
}

const getIcon = (iconName: string) => {
  return iconMapping[iconName] || <Inventory2Outlined />
}

type SidebarProps = {
  open: boolean
  onToggle: () => void
  themeMode: 'light' | 'dark'
  onChangeTheme: (mode: 'light' | 'dark') => void
}

const Sidebar = ({ open, onToggle, themeMode, onChangeTheme }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, permissions } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const withState = (base: string, closedModifier: string) =>
    open ? base : `${base} ${closedModifier}`

  const [allMenus, setAllMenus] = useState<MenuDefinition[]>([])

  useEffect(() => {
    menusService.getAll()
      .then((menus: MenuDefinition[] | null) => {
        if (menus) setAllMenus(menus)
      })
      .catch((error: unknown) => {
        console.error('Failed to load menus:', error)
      })
  }, [])

  const menuStructure = useMemo(() => {
    const filteredMenus = allMenus.filter(menu =>
      permissions.some(p => p.toLowerCase() === menu.key.toLowerCase())
    )

    const groups = filteredMenus.reduce((acc: Record<string, MenuDefinition[]>, menu: MenuDefinition) => {
      if (!acc[menu.category]) {
        acc[menu.category] = []
      }
      acc[menu.category].push(menu)
      return acc
    }, {} as Record<string, MenuDefinition[]>)

    return Object.entries(groups).map(([category, items]) => ({
      title: category,
      items: (items as MenuDefinition[]).map((item: MenuDefinition) => ({
        label: item.name,
        icon: getIcon(item.icon),
        path: item.url.startsWith('/') ? item.url : `/${item.url}`,
      })),
    }))
  }, [allMenus, permissions])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      // Se houver erro, ainda assim redireciona para login
      console.error('Erro ao fazer logout:', error)
      navigate('/', { replace: true })
    }
  }

  const drawerContent = (
    <>
      <div className="sidebar-header">
        <img
          src={logoMarshall}
          alt="Logo Marshall ERP"
          className={withState('sidebar-logo', 'sidebar-logo--compact')}
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        />
        {isMobile && (
          <IconButton onClick={onToggle} size="small" className="sidebar-close">
            <ChevronLeft />
          </IconButton>
        )}
      </div>

      <nav className="sidebar-content">
        {menuStructure.map((section) => (
          <div key={section.title} className="sidebar-section">
            <Collapse in={open || isMobile} orientation="vertical">
              <Typography variant="caption" className="sidebar-section__title">
                {section.title}
              </Typography>
            </Collapse>
            <List disablePadding>
              {section.items.map((item) => (
                <ListItemButton
                  key={item.label}
                  component={NavLink}
                  to={item.path}
                  className={`sidebar-link ${location.pathname.startsWith(item.path) ? 'active' : ''
                    }`}
                  sx={{ gap: 0 }}
                  onClick={() => isMobile && onToggle()}
                >
                  <ListItemIcon className="sidebar-link__icon">{item.icon}</ListItemIcon>
                  {(open || isMobile) && <ListItemText primary={item.label} />}
                </ListItemButton>
              ))}
            </List>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Divider className="sidebar-footer__divider" />
        <Stack spacing={1} className="sidebar-footer__content">
          <ListItemButton
            className="sidebar-footer__item"
            disableRipple
            sx={{ gap: 0 }}
          >
            <ListItemIcon className="sidebar-footer__icon">
              <DarkMode fontSize="small" />
            </ListItemIcon>
            {(open || isMobile) && (
              <>
                <ListItemText
                  primary="Modo escuro"
                  className="sidebar-footer__text"
                />
                <Switch
                  size="small"
                  checked={themeMode === 'dark'}
                  onChange={(event) => onChangeTheme(event.target.checked ? 'dark' : 'light')}
                  className="sidebar-footer__switch"
                />
              </>
            )}
          </ListItemButton>
          <ListItemButton
            className="sidebar-footer__item"
            onClick={handleLogout}
            sx={{ gap: 0 }}
          >
            <ListItemIcon className="sidebar-footer__icon">
              <Logout fontSize="small" />
            </ListItemIcon>
            {(open || isMobile) && (
              <ListItemText
                primary="Sair"
                className="sidebar-footer__text"
              />
            )}
          </ListItemButton>
        </Stack>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        classes={{ paper: 'sidebar-paper sidebar-paper--mobile' }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <div className={withState('sidebar-container', 'sidebar-container--closed')}>
      <Drawer
        variant="permanent"
        open={open}
        className={withState('sidebar', 'sidebar--closed')}
        classes={{ paper: withState('sidebar-paper', 'sidebar-paper--closed') }}
      >
        {drawerContent}
      </Drawer>
    </div>
  )
}

export default Sidebar

