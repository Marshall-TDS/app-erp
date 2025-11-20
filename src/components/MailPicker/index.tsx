import { useState, useEffect, useMemo } from 'react'
import {
  TextField,
  Popover,
  Box,
  Typography,
  MenuItem,
  IconButton,
} from '@mui/material'
import { Email, CheckCircle } from '@mui/icons-material'
import './style.css'

type MailPickerProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  fullWidth?: boolean
  placeholder?: string
  disabled?: boolean
  error?: boolean
  helperText?: string
}

type EmailDomain = {
  domain: string
  name: string
  icon?: string
}

// Domínios de email populares
const EMAIL_DOMAINS: EmailDomain[] = [
  { domain: 'gmail.com', name: 'Gmail' },
  { domain: 'outlook.com', name: 'Outlook' },
  { domain: 'hotmail.com', name: 'Hotmail' },
  { domain: 'yahoo.com', name: 'Yahoo' },
  { domain: 'icloud.com', name: 'iCloud' },
  { domain: 'protonmail.com', name: 'ProtonMail' },
  { domain: 'yandex.com', name: 'Yandex' },
  { domain: 'mail.com', name: 'Mail.com' },
  { domain: 'aol.com', name: 'AOL' },
  { domain: 'zoho.com', name: 'Zoho' },
  { domain: 'gmx.com', name: 'GMX' },
  { domain: 'live.com', name: 'Live' },
  { domain: 'msn.com', name: 'MSN' },
  { domain: 'terra.com.br', name: 'Terra' },
  { domain: 'uol.com.br', name: 'UOL' },
  { domain: 'bol.com.br', name: 'BOL' },
  { domain: 'globo.com', name: 'Globo' },
  { domain: 'ig.com.br', name: 'IG' },
]

// Validar email
const isValidEmail = (email: string): boolean => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Parsear email para extrair parte local e domínio
const parseEmail = (value: string): { localPart: string; domain: string; suggestions: EmailDomain[] } => {
  if (!value) {
    return { localPart: '', domain: '', suggestions: EMAIL_DOMAINS.slice(0, 8) }
  }

  // Se contém @, separar
  if (value.includes('@')) {
    const [localPart, domain] = value.split('@')
    const domainLower = domain.toLowerCase()
    
    // Filtrar sugestões baseado no que foi digitado
    const suggestions = EMAIL_DOMAINS.filter((item) =>
      item.domain.toLowerCase().includes(domainLower)
    ).slice(0, 8)

    return { localPart, domain: domainLower, suggestions: suggestions.length > 0 ? suggestions : EMAIL_DOMAINS.slice(0, 8) }
  }

  // Se não tem @ ainda, mostrar todos os domínios
  return { localPart: value, domain: '', suggestions: EMAIL_DOMAINS.slice(0, 8) }
}

const MailPicker = ({
  label,
  value,
  onChange,
  fullWidth = false,
  placeholder = 'digite@email.com',
  disabled = false,
  error = false,
  helperText,
}: MailPickerProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState(value || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const { localPart, suggestions } = useMemo(() => parseEmail(inputValue), [inputValue])

  // Atualizar quando o valor externo mudar
  useEffect(() => {
    setInputValue(value || '')
  }, [value])


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const newValue = event.target.value
    setInputValue(newValue)
    onChange(newValue)
    setSelectedIndex(-1)

    // Mostrar sugestões se tem @ e está digitando o domínio
    if (newValue.includes('@')) {
      setShowSuggestions(true)
      setAnchorEl(event.currentTarget)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleDomainSelect = (selectedDomain: string) => {
    const fullEmail = `${localPart}@${selectedDomain}`
    setInputValue(fullEmail)
    onChange(fullEmail)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setAnchorEl(null)
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (inputValue.includes('@') && !inputValue.endsWith('@')) {
      setShowSuggestions(true)
      setAnchorEl(event.currentTarget)
    }
  }

  const handleBlur = () => {
    // Delay para permitir clicar na sugestão
    setTimeout(() => {
      setShowSuggestions(false)
      setAnchorEl(null)
    }, 200)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault()
      handleDomainSelect(suggestions[selectedIndex].domain)
    } else if (event.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const handleSuggestionClick = (selectedDomain: string) => {
    handleDomainSelect(selectedDomain)
  }

  const emailError = error || (inputValue ? !isValidEmail(inputValue) : false)

  return (
    <>
      <TextField
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        fullWidth={fullWidth}
        placeholder={placeholder}
        disabled={disabled}
        error={emailError}
        helperText={helperText || (inputValue && !isValidEmail(inputValue) ? 'Email inválido' : '')}
        type="email"
        InputProps={{
          endAdornment: (
            <IconButton
              edge="end"
              size="small"
              disabled={disabled}
              className="mail-picker__icon-btn"
              sx={{ mr: -1 }}
            >
              {inputValue && isValidEmail(inputValue) ? (
                <CheckCircle className="mail-picker__valid-icon" fontSize="small" />
              ) : (
                <Email className="mail-picker__email-icon" fontSize="small" />
              )}
            </IconButton>
          ),
        }}
        className="mail-picker"
      />
      {showSuggestions && suggestions.length > 0 && (
        <Popover
          open={showSuggestions}
          anchorEl={anchorEl}
          onClose={() => setShowSuggestions(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          className="mail-picker-popover"
          disableRestoreFocus
        >
          <Box className="mail-picker__suggestions">
            <Typography variant="caption" className="mail-picker__suggestions-title">
              Domínios sugeridos
            </Typography>
            {suggestions.map((item, index) => (
              <MenuItem
                key={item.domain}
                onClick={() => handleSuggestionClick(item.domain)}
                selected={selectedIndex === index}
                className="mail-picker__suggestion-item"
              >
                <Box className="mail-picker__suggestion-content">
                  <Typography variant="body2" className="mail-picker__suggestion-name">
                    {item.name}
                  </Typography>
                  <Typography variant="caption" className="mail-picker__suggestion-domain">
                    @{item.domain}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        </Popover>
      )}
    </>
  )
}

export default MailPicker

