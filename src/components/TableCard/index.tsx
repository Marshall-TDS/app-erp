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
  Divider,
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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Add, DeleteOutline, MoreVert } from '@mui/icons-material'
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { query, selectedFilter } = useSearch()
  const [selectedIds, setSelectedIds] = useState<Array<T['id']>>([])
  const [dialog, setDialog] = useState<DialogState<T>>({
    mode: null,
    open: false,
  })
  const [formValues, setFormValues] = useState<Partial<T>>({})
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<T | null>(null)

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
        </Stack>


        {!isMobile ? (
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
                    className="table-card__row"
                    onClick={() => openDialog('edit', row)}
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
                      >
                        <MoreVert />
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
        ) : (
          <Stack spacing={1.5}>
            {filteredRows.map((row) => (
              <Box
                key={row.id}
                className="table-card__mobile-card"
                onClick={() => openDialog('edit', row)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1} flex={1}>
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleToggleSelectRow(row.id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    {primaryColumn && (
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {renderCell(row, primaryColumn)}
                      </Typography>
                    )}
                  </Stack>
                  {selectedIds.includes(row.id) && (
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation()
                        handleOpenMenu(event, row)
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  {secondaryColumns.map((column) => (
                    <Box key={String(column.key)} className="table-card__mobile-field">
                      <Typography variant="caption" color="text.secondary">
                        {column.label}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {renderCell(row, column)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
            {filteredRows.length === 0 && (
              <Typography align="center" color="text.secondary">
                Nenhum registro encontrado.
              </Typography>
            )}
          </Stack>
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
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<DeleteOutline />}
                  onClick={handleBulkDelete}
                  disabled={!onBulkDelete}
                >
                  Excluir selecionados
                </Button>
              </Stack>
            </Stack>
          </Box>,
          document.body,
        )}
    </Box>
  )
}

export default TableCard

