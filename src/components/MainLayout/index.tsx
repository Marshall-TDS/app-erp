import { useEffect, useState, type ReactNode } from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { SearchProvider } from '../../context/SearchContext'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
import './style.css'

type MainLayoutProps = {
  children?: ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = window.localStorage.getItem('marshall-theme-mode') as 'light' | 'dark' | null
    return stored ?? (prefersDark ? 'dark' : 'light')
  })

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (themeMode === 'dark') {
      root.classList.add('theme-dark')
    } else {
      root.classList.remove('theme-dark')
    }
    window.localStorage.setItem('marshall-theme-mode', themeMode)
  }, [themeMode])

  return (
    <SearchProvider>
      <Box className="main-layout">
        <Sidebar 
          open={sidebarOpen} 
          onToggle={() => setSidebarOpen((prev) => !prev)}
          themeMode={themeMode}
          onChangeTheme={setThemeMode}
        />
        <Box component="section" className="main-layout__content">
          <Topbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
          <Box component="main" className="main-layout__page">
            {children ?? <Outlet />}
          </Box>
        </Box>
      </Box>
    </SearchProvider>
  )
}

export default MainLayout
