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
import NumberPicker from '../../components/NumberPicker'
import SelectPicker from '../../components/SelectPicker'
import { modalidadeRentabilidadeService, type ModalidadeRentabilidadeDTO } from '../../services/modalidadesRentabilidade'
import { cicloPagamentoService } from '../../services/ciclosPagamento'
import './style.css'

type ModalidadeRentabilidadeRow = TableCardRow & {
  id: string
  seqId?: number | null
  rentabilidadePercentual: number
  prazoMeses: number
  cicloPagamentoId: string
  frequenciaPagamento: number
  createdAt: string
  createdBy: string
  updatedAt?: string | null
  updatedBy?: string | null
}

const DEFAULT_USER = 'admin'

const ModalidadesRentabilidadePage = () => {
  const [modalidades, setModalidades] = useState<ModalidadeRentabilidadeRow[]>([])
  const [ciclos, setCiclos] = useState<Array<{ id: string; descricao: string }>>([])
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
      { id: 'rentabilidadePercentual', label: 'Rentabilidade %', field: 'rentabilidadePercentual', type: 'text' as const, page: 'modalidades-rentabilidade' },
    ]
    setFilters(filters, 'rentabilidadePercentual')
    return () => {
      setFilters([])
      setPlaceholder('')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const loadCiclos = async () => {
    try {
      const data = await cicloPagamentoService.list()
      setCiclos(data.map(c => ({ id: c.id, descricao: c.descricao })))
    } catch (err) {
      console.error('Erro ao carregar ciclos:', err)
    }
  }

  const mapModalidadeToRow = useCallback(
    (modalidade: ModalidadeRentabilidadeDTO): ModalidadeRentabilidadeRow => ({
      ...modalidade,
    }),
    [],
  )

  const loadModalidades = async () => {
    try {
      setLoading(true)
      const data = await modalidadeRentabilidadeService.list()
      setModalidades(data.map(mapModalidadeToRow))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar modalidades de rentabilidade')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission('contratos:modalidades-rentabilidade:listar')) {
      loadCiclos()
      loadModalidades()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions])

  const handleAddModalidade = async (data: Partial<ModalidadeRentabilidadeRow>) => {
    try {
      const payload = {
        rentabilidadePercentual: (data.rentabilidadePercentual as number) ?? 0,
        prazoMeses: (data.prazoMeses as number) ?? 1,
        cicloPagamentoId: (data.cicloPagamentoId as string) ?? '',
        frequenciaPagamento: (data.frequenciaPagamento as number) ?? 1,
        createdBy: currentUser?.login ?? DEFAULT_USER,
      }
      await modalidadeRentabilidadeService.create(payload)
      await loadModalidades()
      setToast({ open: true, message: 'Modalidade de rentabilidade criada com sucesso' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar modalidade de rentabilidade' })
    }
  }

  const handleEditModalidade = async (id: ModalidadeRentabilidadeRow['id'], data: Partial<ModalidadeRentabilidadeRow>) => {
    try {
      const payload = {
        rentabilidadePercentual: data.rentabilidadePercentual as number | undefined,
        prazoMeses: data.prazoMeses as number | undefined,
        cicloPagamentoId: data.cicloPagamentoId as string | undefined,
        frequenciaPagamento: data.frequenciaPagamento as number | undefined,
        updatedBy: currentUser?.login ?? DEFAULT_USER,
      }
      await modalidadeRentabilidadeService.update(id as string, payload)
      await loadModalidades()
      setToast({ open: true, message: 'Modalidade de rentabilidade atualizada com sucesso' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar modalidade de rentabilidade' })
    }
  }

  const handleDeleteModalidade = async (id: ModalidadeRentabilidadeRow['id']) => {
    try {
      await modalidadeRentabilidadeService.remove(id as string)
      setModalidades((prev) => prev.filter((modalidade) => modalidade.id !== id))
      setToast({ open: true, message: 'Modalidade de rentabilidade removida' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleBulkDelete = async (ids: ModalidadeRentabilidadeRow['id'][]) => {
    try {
      await Promise.all(ids.map((id) => modalidadeRentabilidadeService.remove(id as string)))
      setModalidades((prev) => prev.filter((modalidade) => !ids.includes(modalidade.id)))
      setToast({ open: true, message: 'Modalidades de rentabilidade removidas' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const getCicloDescricao = (cicloId: string) => {
    const ciclo = ciclos.find(c => c.id === cicloId)
    return ciclo ? ciclo.descricao : cicloId
  }

  const modalidadeFormFields: TableCardFormField<ModalidadeRentabilidadeRow>[] = useMemo(
    () => [
      {
        key: 'rentabilidadePercentual',
        label: 'Rentabilidade Percentual',
        required: true,
        inputType: 'number',
        renderInput: ({ value, onChange, field, disabled }) => (
          <NumberPicker
            label={field.label}
            value={typeof value === 'number' ? value : undefined}
            onChange={(num) => onChange(num)}
            format="percent"
            decimalScale={1}
            fullWidth
            placeholder="Rentabilidade percentual"
            required={field.required}
            disabled={disabled}
            min={0}
            max={10}
          />
        ),
      },
      {
        key: 'prazoMeses',
        label: 'Prazo (meses)',
        required: true,
        inputType: 'number',
        renderInput: ({ value, onChange, field, disabled }) => (
          <NumberPicker
            label={field.label}
            value={typeof value === 'number' ? value : undefined}
            onChange={(num) => onChange(num)}
            format="integer"
            fullWidth
            placeholder="Prazo em meses"
            required={field.required}
            disabled={disabled}
            min={1}
            max={60}
          />
        ),
      },
      {
        key: 'frequenciaPagamento',
        label: 'Frequência de pagamento em meses',
        required: true,
        inputType: 'number',
        renderInput: ({ value, onChange, field, disabled }) => (
          <NumberPicker
            label={field.label}
            value={typeof value === 'number' ? value : undefined}
            onChange={(num) => onChange(num)}
            format="integer"
            fullWidth
            placeholder="Frequência de pagamento em meses"
            required={field.required}
            disabled={disabled}
            min={0}
            max={60}
            showClearButton={false}
          />
        ),
      },
      {
        key: 'cicloPagamentoId',
        label: 'Ciclo de Pagamento',
        required: true,
        inputType: 'select',
        options: ciclos.map(c => ({ label: c.descricao, value: c.id })),
        renderInput: ({ value, onChange, field, disabled }) => (
          <SelectPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => onChange(val as string)}
            fullWidth
            placeholder="Selecione o ciclo de pagamento"
            required={field.required}
            disabled={disabled}
            options={field.options || []}
          />
        ),
      },
    ],
    [ciclos],
  )

  const tableColumns = useMemo<TableCardColumn<ModalidadeRentabilidadeRow>[]>(() => [
    { key: 'rentabilidadePercentual', label: 'Rentabilidade %', dataType: 'number', render: (value) => `${value}%` },
    { key: 'prazoMeses', label: 'Prazo (meses)', dataType: 'number' },
    { key: 'cicloPagamentoId', label: 'Ciclo de Pagamento', render: (value) => getCicloDescricao(value as string) },
    { 
      key: 'frequenciaPagamento', 
      label: 'Frequência', 
      dataType: 'number',
      render: (value) => {
        const num = typeof value === 'number' ? value : 0
        return `${num} ${num === 1 ? 'mês' : 'meses'}`
      }
    },
    { key: 'createdAt', label: 'Cadastro', dataType: 'date' },
  ], [ciclos])

  if (!loading && !hasPermission('contratos:modalidades-rentabilidade:listar')) {
    return (
      <Box className="modalidades-rentabilidade-page">
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Você não tem permissão para listar modalidades de rentabilidade
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="modalidades-rentabilidade-page">
      {loading ? (
        <Box className="modalidades-rentabilidade-page__loading">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Carregando modalidades de rentabilidade...
          </Typography>
        </Box>
      ) : (
        <TableCard
          title="Modalidades de Rentabilidade"
          columns={tableColumns}
          rows={modalidades}
          onAdd={hasPermission('contratos:modalidades-rentabilidade:criar') ? handleAddModalidade : undefined}
          onEdit={hasPermission('contratos:modalidades-rentabilidade:editar') ? handleEditModalidade : undefined}
          onDelete={handleDeleteModalidade}
          onBulkDelete={hasPermission('contratos:modalidades-rentabilidade:excluir') ? handleBulkDelete : undefined}
          formFields={modalidadeFormFields}
          disableDelete={!hasPermission('contratos:modalidades-rentabilidade:excluir')}
          disableEdit={!hasPermission('contratos:modalidades-rentabilidade:editar')}
          disableView={!hasPermission('contratos:modalidades-rentabilidade:visualizar')}
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

export default ModalidadesRentabilidadePage

