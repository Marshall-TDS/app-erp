import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Collapse,
} from '@mui/material'
import {
  Menu as MenuIcon,
  MenuOpen,
  NotificationsNone,
  Search,
  Close,
} from '@mui/icons-material'
import { useSearch } from '../../context/SearchContext'
import './style.css'

type TopbarProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

const Topbar = ({ sidebarOpen, onToggleSidebar }: TopbarProps) => {
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

        <Stack direction="row" alignItems="center" spacing={0.5} className="topbar__right">
          <Tooltip title="Notificações">
            <IconButton aria-label="Notificações" className="topbar__notif">
              <NotificationsNone />
            </IconButton>
          </Tooltip>
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
