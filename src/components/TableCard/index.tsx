import { useMemo, useState, type ReactNode } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
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
  Paper,
} from '@mui/material'
import { Add, DeleteOutline, MoreVert, Search } from '@mui/icons-material'
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
  searchPlaceholder?: string
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
  searchPlaceholder = 'Pesquisar',
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
}: TableCardProps<T>) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Array<T['id']>>([])
  const [dialog, setDialog] = useState<DialogState<T>>({
    mode: null,
    open: false,
  })
  const [formValues, setFormValues] = useState<Partial<T>>({})
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRow, setMenuRow] = useState<T | null>(null)

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows
    const lower = searchTerm.toLowerCase()
    return rows.filter((row) =>
      columns.some((column) => {
        const value = row[column.key]
        if (value === undefined || value === null) return false
        return String(value).toLowerCase().includes(lower)
      }),
    )
  }, [rows, columns, searchTerm])

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
    <Paper className="table-card">
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} width="100%">
            <TextField
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={searchPlaceholder}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openDialog('add')}
            >
              Adicionar
            </Button>
          </Stack>
        </Stack>

        {selectedIds.length > 0 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            className="table-card__bulk-actions"
          >
            <Typography variant="body2">
              {selectedIds.length} registro(s) selecionado(s)
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={handleBulkDelete}
                disabled={!onBulkDelete}
              >
                Excluir selecionados
              </Button>
            </Stack>
          </Stack>
        )}

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
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    onChange={() => handleToggleSelectRow(row.id)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation()
                      handleOpenMenu(event, row)
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  {columns.map((column) => (
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
          <Button variant="contained" onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default TableCard

