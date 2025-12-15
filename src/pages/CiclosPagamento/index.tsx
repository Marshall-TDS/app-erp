import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material'
import TableCard, {
  type TableCardColumn,
  type TableCardFormField,
  type TableCardRow,
} from '../../components/TableCard'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import TextPicker from '../../components/TextPicker'
import NumberPicker from '../../components/NumberPicker'
import { cicloPagamentoService, type CicloPagamentoDTO } from '../../services/ciclosPagamento'
import './style.css'

type CicloPagamentoRow = TableCardRow & {
  id: string
  descricao: string
  diaInicioCiclo: number
  diaFimCiclo: number
  diaPagamentoCiclo: number
  createdAt: string
  createdBy: string
  updatedAt?: string | null
  updatedBy?: string | null
}

const DEFAULT_USER = 'admin'

const CiclosPagamentoPage = () => {
  const [ciclos, setCiclos] = useState<CicloPagamentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })
  const [error, setError] = useState<string | null>(null)

  const { setFilters, setPlaceholder, setQuery } = useSearch()
  const { permissions, user: currentUser } = useAuth()

  const hasPermission = useCallback(
    (permission: string) => {
      return permissions.includes(permission)
    },
    [permissions],
  )

  useEffect(() => {
    setPlaceholder('')
    const filters = [
      { id: 'descricao', label: 'Descrição', field: 'descricao', type: 'text' as const, page: 'ciclos-pagamento' },
    ]
    setFilters(filters, 'descricao')
    return () => {
      setFilters([])
      setPlaceholder('')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const mapCicloToRow = useCallback(
    (ciclo: CicloPagamentoDTO): CicloPagamentoRow => ({
      ...ciclo,
    }),
    [],
  )

  const loadCiclos = async () => {
    try {
      setLoading(true)
      const data = await cicloPagamentoService.list()
      setCiclos(data.map(mapCicloToRow))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar ciclos de pagamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission('contratos:ciclos-pagamento:listar')) {
      loadCiclos()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions])

  const handleAddCiclo = async (data: Partial<CicloPagamentoRow>) => {
    try {
      const payload = {
        descricao: (data.descricao as string) ?? '',
        diaInicioCiclo: (data.diaInicioCiclo as number) ?? 1,
        diaFimCiclo: (data.diaFimCiclo as number) ?? 1,
        diaPagamentoCiclo: (data.diaPagamentoCiclo as number) ?? 1,
        createdBy: currentUser?.login ?? DEFAULT_USER,
      }
      await cicloPagamentoService.create(payload)
      await loadCiclos()
      setToast({ open: true, message: 'Ciclo de pagamento criado com sucesso' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar ciclo de pagamento' })
    }
  }

  const handleEditCiclo = async (id: CicloPagamentoRow['id'], data: Partial<CicloPagamentoRow>) => {
    try {
      const payload = {
        descricao: data.descricao as string | undefined,
        diaInicioCiclo: data.diaInicioCiclo as number | undefined,
        diaFimCiclo: data.diaFimCiclo as number | undefined,
        diaPagamentoCiclo: data.diaPagamentoCiclo as number | undefined,
        updatedBy: currentUser?.login ?? DEFAULT_USER,
      }
      await cicloPagamentoService.update(id as string, payload)
      await loadCiclos()
      setToast({ open: true, message: 'Ciclo de pagamento atualizado com sucesso' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar ciclo de pagamento' })
    }
  }

  const handleDeleteCiclo = async (id: CicloPagamentoRow['id']) => {
    try {
      await cicloPagamentoService.remove(id as string)
      setCiclos((prev) => prev.filter((ciclo) => ciclo.id !== id))
      setToast({ open: true, message: 'Ciclo de pagamento removido' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleBulkDelete = async (ids: CicloPagamentoRow['id'][]) => {
    try {
      await Promise.all(ids.map((id) => cicloPagamentoService.remove(id as string)))
      setCiclos((prev) => prev.filter((ciclo) => !ids.includes(ciclo.id)))
      setToast({ open: true, message: 'Ciclos de pagamento removidos' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const cicloFormFields: TableCardFormField<CicloPagamentoRow>[] = useMemo(
    () => [
      {
        key: 'descricao',
        label: 'Descrição',
        required: true,
        renderInput: ({ value, onChange, field, disabled }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Descrição do ciclo"
            required={field.required}
            disabled={disabled}
          />
        ),
      },
      {
        key: 'diaInicioCiclo',
        label: 'Dia Início do Ciclo',
        required: true,
        inputType: 'number',
        renderInput: ({ value, onChange, field, disabled }) => (
          <NumberPicker
            label={field.label}
            value={typeof value === 'number' && value > 0 ? value : 1}
            onChange={(num) => onChange(num)}
            format="integer"
            fullWidth
            placeholder="Dia início (1-28)"
            required={field.required}
            disabled={disabled}
            min={1}
            max={28}
          />
        ),
      },
      {
        key: 'diaFimCiclo',
        label: 'Dia Fim do Ciclo',
        required: true,
        inputType: 'number',
        renderInput: ({ value, onChange, field, disabled }) => (
          <NumberPicker
            label={field.label}
            value={typeof value === 'number' && value > 0 ? value : 1}
            onChange={(num) => onChange(num)}
            format="integer"
            fullWidth
            placeholder="Dia fim (1-28)"
            required={field.required}
            disabled={disabled}
            min={1}
            max={28}
          />
        ),
      },
      {
        key: 'diaPagamentoCiclo',
        label: 'Dia Pagamento do Ciclo',
        required: true,
        inputType: 'number',
        renderInput: ({ value, onChange, field, disabled }) => (
          <NumberPicker
            label={field.label}
            value={typeof value === 'number' && value > 0 ? value : 1}
            onChange={(num) => onChange(num)}
            format="integer"
            fullWidth
            placeholder="Dia pagamento (1-28)"
            required={field.required}
            disabled={disabled}
            min={1}
            max={28}
          />
        ),
      },
    ],
    [],
  )

  const tableColumns = useMemo<TableCardColumn<CicloPagamentoRow>[]>(() => [
    { key: 'descricao', label: 'Descrição' },
    { key: 'diaInicioCiclo', label: 'Dia Início', dataType: 'number' },
    { key: 'diaFimCiclo', label: 'Dia Fim', dataType: 'number' },
    { key: 'diaPagamentoCiclo', label: 'Dia Pagamento', dataType: 'number' },
    { key: 'createdAt', label: 'Cadastro', dataType: 'date' },
  ], [])

  if (!loading && !hasPermission('contratos:ciclos-pagamento:listar')) {
    return (
      <Box className="ciclos-pagamento-page">
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Você não tem permissão para listar ciclos de pagamento
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="ciclos-pagamento-page">
      {loading ? (
        <Box className="ciclos-pagamento-page__loading">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Carregando ciclos de pagamento...
          </Typography>
        </Box>
      ) : (
        <TableCard
          title="Ciclos de Pagamento"
          columns={tableColumns}
          rows={ciclos}
          onAdd={hasPermission('contratos:ciclos-pagamento:criar') ? handleAddCiclo : undefined}
          onEdit={hasPermission('contratos:ciclos-pagamento:editar') ? handleEditCiclo : undefined}
          onDelete={handleDeleteCiclo}
          onBulkDelete={hasPermission('contratos:ciclos-pagamento:excluir') ? handleBulkDelete : undefined}
          formFields={cicloFormFields}
          disableDelete={!hasPermission('contratos:ciclos-pagamento:excluir')}
          disableEdit={!hasPermission('contratos:ciclos-pagamento:editar')}
          disableView={!hasPermission('contratos:ciclos-pagamento:visualizar')}
        />
      )}

      <Snackbar
        open={toast.open || Boolean(error)}
        autoHideDuration={4000}
        onClose={() => {
          setToast({ open: false, message: '' })
          setError(null)
        }}
        message={toast.open ? toast.message : error ?? ''}
      />
    </Box>
  )
}

export default CiclosPagamentoPage

