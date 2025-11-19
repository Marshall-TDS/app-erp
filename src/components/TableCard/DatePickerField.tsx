import { useState, useEffect } from 'react'
import {
  TextField,
  Popover,
  Box,
  IconButton,
  Typography,
  Button,
  Stack,
} from '@mui/material'
import { CalendarToday } from '@mui/icons-material'
import './DatePickerField.css'

type DatePickerFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  fullWidth?: boolean
}

// Normalizar o valor da data para formato YYYY-MM-DD
const normalizeDate = (dateValue: string): string => {
  if (!dateValue) return ''
  // Se já está no formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue
  }
  // Tenta converter de outros formatos
  try {
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch {
    // Se falhar, retorna vazio
  }
  return ''
}

const DatePickerField = ({
  label,
  value,
  onChange,
  fullWidth = false,
}: DatePickerFieldProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  
  const normalizedValue = normalizeDate(value || '')
  const [tempDate, setTempDate] = useState(normalizedValue)

  // Atualizar tempDate quando o valor externo mudar (apenas se for diferente do atual)
  useEffect(() => {
    const newNormalized = normalizeDate(value || '')
    // Só atualiza se o valor normalizado for diferente
    // Compara com o valor atual do estado tempDate
    setTempDate((currentTempDate) => {
      if (newNormalized !== currentTempDate) {
        return newNormalized
      }
      return currentTempDate
    })
  }, [value])

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    const currentValue = tempDate || normalizedValue || ''
    setTempDate(currentValue)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]
    setTempDate(formattedDate)
    onChange(formattedDate)
    handleClose()
  }

  const handleTodayClick = () => {
    const today = new Date()
    handleDateSelect(today)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    
    // Atualizar o estado local imediatamente
    setTempDate(newValue)
    
    // Passar o valor diretamente para o onChange
    // O input type="date" já valida o formato YYYY-MM-DD
    onChange(newValue)
  }

  // Handler para quando o campo perder o foco
  const handleBlur = () => {
    // Normalizar a data quando o campo perde o foco
    if (tempDate) {
      const normalized = normalizeDate(tempDate)
      if (normalized && normalized !== tempDate) {
        setTempDate(normalized)
        onChange(normalized)
      }
    }
  }

  // Gerar dias do calendário
  const getCalendarDays = () => {
    const currentDate = tempDate ? new Date(tempDate + 'T00:00:00') : new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Dias vazios do início do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const calendarDays = getCalendarDays()
  const currentDate = tempDate ? new Date(tempDate + 'T00:00:00') : new Date()
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    const formattedDate = newDate.toISOString().split('T')[0]
    setTempDate(formattedDate)
  }

  return (
    <>
      <TextField
        label={label}
        value={tempDate || normalizedValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        fullWidth={fullWidth}
        type="date"
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={handleClick}
              edge="end"
              size="small"
              aria-label="Abrir calendário"
              sx={{ mr: -1 }}
            >
              <CalendarToday fontSize="small" />
            </IconButton>
          ),
        }}
        className="date-picker-field"
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className="date-picker-popover"
      >
        <Box className="date-picker-calendar">
          {/* Cabeçalho do calendário */}
          <Box className="date-picker-header">
            <IconButton
              size="small"
              onClick={() => navigateMonth('prev')}
              className="date-picker-nav-btn"
            >
              ←
            </IconButton>
            <Typography variant="subtitle1" fontWeight={600}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Typography>
            <IconButton
              size="small"
              onClick={() => navigateMonth('next')}
              className="date-picker-nav-btn"
            >
              →
            </IconButton>
          </Box>

          {/* Dias da semana */}
          <Box className="date-picker-weekdays">
            {weekDays.map((day) => (
              <Typography
                key={day}
                variant="caption"
                className="date-picker-weekday"
              >
                {day}
              </Typography>
            ))}
          </Box>

          {/* Grid de dias */}
          <Box className="date-picker-days">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <Box key={index} className="date-picker-day-empty" />
              }

              const dayDate = new Date(day)
              dayDate.setHours(0, 0, 0, 0)
              const isToday = dayDate.getTime() === today.getTime()
              const isSelected =
                tempDate &&
                dayDate.toISOString().split('T')[0] ===
                  new Date(tempDate + 'T00:00:00').toISOString().split('T')[0]

              return (
                <Button
                  key={index}
                  className={`date-picker-day ${
                    isToday ? 'date-picker-day--today' : ''
                  } ${isSelected ? 'date-picker-day--selected' : ''}`}
                  onClick={() => handleDateSelect(day)}
                >
                  {day.getDate()}
                </Button>
              )
            })}
          </Box>

          {/* Botão Hoje */}
          <Box className="date-picker-footer">
            <Button
              variant="text"
              size="small"
              onClick={handleTodayClick}
              className="date-picker-today-btn"
            >
              Hoje
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default DatePickerField

