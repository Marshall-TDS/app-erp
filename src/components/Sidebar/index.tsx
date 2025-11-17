import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  DashboardOutlined,
  Inventory2Outlined,
  PeopleAltOutlined,
  SettingsOutlined,
  BarChartOutlined,
  ChevronLeft,
} from '@mui/icons-material'
import { NavLink, useLocation } from 'react-router-dom'
import logoMarshall from '../../assets/images/logo-marshall.svg'
import './style.css'

const menuStructure = [
  {
    title: 'Operações',
    items: [
      { label: 'Dashboard', icon: <DashboardOutlined />, path: '/dashboard' },
      { label: 'Estoque', icon: <Inventory2Outlined />, path: '/inventory' },
    ],
  },
  {
    title: 'Pessoas',
    items: [
      { label: 'Clientes', icon: <PeopleAltOutlined />, path: '/customers' },
      { label: 'Equipe', icon: <BarChartOutlined />, path: '/team' },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { label: 'Preferências', icon: <SettingsOutlined />, path: '/settings' },
    ],
  },
]

type SidebarProps = {
  open: boolean
  onToggle: () => void
}

const Sidebar = ({ open, onToggle }: SidebarProps) => {
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const withState = (base: string, closedModifier: string) =>
    open ? base : `${base} ${closedModifier}`

  const drawerContent = (
    <>
      <div className="sidebar-header">
        <img
          src={logoMarshall}
          alt="Logo Marshall ERP"
          className={withState('sidebar-logo', 'sidebar-logo--compact')}
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
                  className={`sidebar-link ${
                    location.pathname.startsWith(item.path) ? 'active' : ''
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
    </>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
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

