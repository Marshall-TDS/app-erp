import { useMemo, useState, type ReactNode } from 'react'
import { useSearch } from '../../context/SearchContext'
import { createPortal } from 'react-dom'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { Add, DeleteOutline, MoreVert, ViewModule, TableChart } from '@mui/icons-material'
import './style.css'

export type TableCardColumn<T extends TableCardRow> = {
  key: keyof T
  label: string
  dataType?: 'text' | 'number' | 'date' | 'status'
  render?: (value: any, row: T) => ReactNode
}

export type TableCardRow = {
  id: string | number
  [key: string]: any
}

type TableCardProps<T extends TableCardRow> = {
  title?: string
  columns: TableCardColumn<T>[]
  rows: T[]
  onAdd?: (data: Partial<T>) => void
  onEdit?: (id: T['id'], data: Partial<T>) => void
  onDelete?: (id: T['id']) => void
  onBulkDelete?: (ids: T['id'][]) => void
}

type DialogState<T extends TableCardRow> =
  | { mode: 'add'; open: true; row?: undefined }
  | { mode: 'edit'; open: true; row: T }
  | { mode: null; open: false; row?: undefined }

const TableCard = <T extends TableCardRow>({
  title,
  columns,
  rows,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
}: TableCardProps<T>) => {
  const { query, selectedFilter } = useSearch()
  const [selectedIds, setSelectedIds] = useState<Array<T['id']>>([])
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [dialog, setDialog] = useState<DialogState<T>>({
    mode: null,
    open: false,
  })
  const [formValues, setFormValues] = useState<Partial<T>>({})
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<T | null>(null)

  // Define qual coluna será exibida como título e as demais como preview
  const [primaryColumn, ...secondaryColumns] = columns

  const filteredRows = useMemo(() => {
    if (!query) return rows
    const lower = query.toLowerCase()
    return rows.filter((row) => {
      if (selectedFilter) {
        const value = row[selectedFilter.field as keyof T]
        if (value === undefined || value === null) return false
        return String(value).toLowerCase().includes(lower)
      }
      return columns.some((column) => {
        const value = row[column.key]
        if (value === undefined || value === null) return false
        return String(value).toLowerCase().includes(lower)
      })
    })
  }, [rows, columns, query, selectedFilter])

  const allSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedIds.includes(row.id))

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRows.map((row) => row.id))
    }
  }

  const handleToggleSelectRow = (id: T['id']) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const openDialog = (mode: 'add' | 'edit', row?: T) => {
    if (mode === 'add') {
      setDialog({ mode: 'add', open: true })
      setFormValues({} as Partial<T>)
      return
    }

    if (row) {
      setDialog({ mode: 'edit', open: true, row })
      setFormValues(row)
    }
  }

  const closeDialog = () => {
    setDialog({ mode: null, open: false })
    setFormValues({})
  }

  const handleSubmit = () => {
    if (dialog.mode === 'add') {
      onAdd?.(formValues)
    }
    if (dialog.mode === 'edit' && dialog.row) {
      onEdit?.(dialog.row.id, formValues)
    }
    closeDialog()
  }

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: T,
  ) => {
    setAnchorEl(event.currentTarget)
    setMenuRow(row)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuRow(null)
  }

  const handleDeleteRow = () => {
    if (menuRow) {
      onDelete?.(menuRow.id)
      handleCloseMenu()
    }
  }

  const handleBulkDelete = () => {
    onBulkDelete?.(selectedIds)
    setSelectedIds([])
  }

  const renderCell = (row: T, column: TableCardColumn<T>) => {
    const value = row[column.key]
    if (column.render) return column.render(value, row)
    if (column.dataType === 'date' && value) {
      return new Date(value).toLocaleDateString()
    }
    if (column.dataType === 'status') {
      return (
        <span className={`status-pill status-pill--${String(value).toLowerCase()}`}>
          {value}
        </span>
      )
    }
    return value ?? '--'
  }

  return (
    <Box className="table-card">
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          className="table-card__toolbar"
        >
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
          <Stack direction="row" spacing={0.5} className="table-card__view-toggle">
            <IconButton
              size="small"
              onClick={() => setViewMode('card')}
              className={viewMode === 'card' ? 'table-card__view-toggle--active' : ''}
              aria-label="Visualização em cards"
            >
              <ViewModule fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'table-card__view-toggle--active' : ''}
              aria-label="Visualização em tabela"
            >
              <TableChart fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Visualização em Cards ou Tabela */}
        {viewMode === 'card' ? (
          <Box className="table-card__list-container">
            <Stack spacing={0.5} className="table-card__list">
              {filteredRows.map((row) => {
                const isSelected = selectedIds.includes(row.id)
                
                return (
                  <Box
                    key={row.id}
                    className={`table-card__gmail-card ${isSelected ? 'table-card__gmail-card--selected' : ''}`}
                    onClick={() => {
                      if (!isSelected) {
                        openDialog('edit', row)
                      }
                    }}
                  >
                    <Box className="table-card__gmail-card-content">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(row.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="table-card__checkbox"
                      />
                      
                      <Box className="table-card__gmail-card-main" flex={1}>
                        <Box className="table-card__gmail-card-header">
                          {primaryColumn && (
                            <Typography 
                              variant="subtitle1" 
                              fontWeight={600} 
                              className="table-card__gmail-title"
                              component="div"
                            >
                              {renderCell(row, primaryColumn)}
                            </Typography>
                          )}
                          
                          <IconButton
                            className="table-card__gmail-actions"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleOpenMenu(event, row)
                            }}
                            size="small"
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        {secondaryColumns.length > 0 && (
                          <Box className="table-card__gmail-card-preview">
                            {secondaryColumns.map((column) => (
                              <Typography
                                key={String(column.key)}
                                variant="body2"
                                color="text.secondary"
                                className="table-card__gmail-preview-item"
                              >
                                <span className="table-card__gmail-preview-label">
                                  {column.label}:
                                </span>{' '}
                                {renderCell(row, column)}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )
              })}
              
              {filteredRows.length === 0 && (
                <Box className="table-card__empty-state">
                  <Typography align="center" color="text.secondary" variant="body1">
                    Nenhum registro encontrado.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        ) : (
          <Box className="table-card__table-container">
            <Box className="table-card__table-wrapper">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allSelected}
                        onChange={handleToggleSelectAll}
                        indeterminate={
                          selectedIds.length > 0 && !allSelected && filteredRows.length > 0
                        }
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>{column.label}</TableCell>
                    ))}
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      className={`table-card__row ${selectedIds.includes(row.id) ? 'table-card__row--selected' : ''}`}
                      onClick={() => {
                        if (!selectedIds.includes(row.id)) {
                          openDialog('edit', row)
                        }
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(row.id)}
                          onChange={() => handleToggleSelectRow(row.id)}
                        />
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={String(column.key)}>
                          {renderCell(row, column)}
                        </TableCell>
                      ))}
                      <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation()
                            handleOpenMenu(event, row)
                          }}
                          size="small"
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 2}>
                        <Typography align="center" color="text.secondary">
                          Nenhum registro encontrado.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </Stack>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleDeleteRow} disabled={!onDelete}>
          <DeleteOutline fontSize="small" style={{ marginRight: 8 }} />
          Excluir
        </MenuItem>
      </Menu>

      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialog.mode === 'add' ? 'Adicionar registro' : 'Editar registro'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {columns.map((column) => (
              <TextField
                key={String(column.key)}
                label={column.label}
                value={formValues[column.key] ?? ''}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    [column.key]: event.target.value,
                  }))
                }
                fullWidth
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {createPortal(
        <Fab
          color="primary"
          aria-label="adicionar"
          onClick={() => openDialog('add')}
          className="table-card__fab"
        >
          <Add />
        </Fab>,
        document.body,
      )}

      {selectedIds.length > 0 &&
        createPortal(
          <Box className="table-card__top-actions">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Typography variant="body1" fontWeight={600}>
                {selectedIds.length} registro(s) selecionado(s)
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center"
                sx={{ 
                  alignSelf: { xs: 'flex-end', sm: 'center' },
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                }}
              >
                <IconButton
                  color="primary"
                  onClick={handleBulkDelete}
                  disabled={!onBulkDelete}
                  aria-label="Excluir selecionados"
                >
                  <DeleteOutline />
                </IconButton>
                <Checkbox
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                  indeterminate={
                    selectedIds.length > 0 && !allSelected && filteredRows.length > 0
                  }
                  aria-label="Selecionar todos"
                />
              </Stack>
            </Stack>
          </Box>,
          document.body,
        )}
    </Box>
  )
}

export default TableCard

