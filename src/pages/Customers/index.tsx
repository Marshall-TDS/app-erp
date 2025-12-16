import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material'
import { VisibilityOutlined } from '@mui/icons-material'
import TableCard, {
  type TableCardColumn,
  type TableCardFormField,
  type TableCardRow,
  type TableCardRowAction,
  type TableCardBulkAction,
} from '../../components/TableCard'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import CPFCNPJPicker from '../../components/CPFCNPJPicker'
import TextPicker from '../../components/TextPicker'

import { customerService, type CustomerDTO } from '../../services/customers'
import CustomerDashboard from './CustomerDashboard'
import CustomerFormDialog from './components/CustomerFormDialog'
import './style.css'

type CustomerRow = TableCardRow & {
  id: string
  name: string
  lastName: string
  cpfCnpj: string
  birthDate?: string | null
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

const DEFAULT_USER = 'admin'

const CustomersPage = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [dashboardCustomerId, setDashboardCustomerId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

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
      { id: 'name', label: 'Nome', field: 'name', type: 'text' as const, page: 'customers' },
      { id: 'cpfCnpj', label: 'CPF/CNPJ', field: 'cpfCnpj', type: 'text' as const, page: 'customers' },
    ]
    setFilters(filters, 'name')
    return () => {
      setFilters([])
      setPlaceholder('')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const mapCustomerToRow = useCallback(
    (customer: CustomerDTO): CustomerRow => ({
      ...customer,
    }),
    [],
  )

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.list()
      setCustomers(data.map(mapCustomerToRow))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission('comercial:clientes:listar')) {
      loadCustomers()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions])

  // Sync Dashboard state with URL Query Params
  useEffect(() => {
    const customerIdParam = searchParams.get('customerId')
    const canView = hasPermission('comercial:clientes:visualizar')

    if (customerIdParam && canView) {
      if (dashboardCustomerId !== customerIdParam || !dashboardOpen) {
        setDashboardCustomerId(customerIdParam)
        setDashboardOpen(true)
      }
    } else {
      if (dashboardOpen) {
        setDashboardOpen(false)
        setDashboardCustomerId(null)
      }
    }
  }, [searchParams, hasPermission, dashboardCustomerId, dashboardOpen])

  const handleAddCustomer = async (data: { name: string; lastName: string; cpfCnpj: string }) => {
    try {
      setCreating(true)
      const payload = {
        name: data.name,
        lastName: data.lastName,
        cpfCnpj: data.cpfCnpj,
        birthDate: null,
        createdBy: currentUser?.login ?? DEFAULT_USER,
      }
      await customerService.create(payload)
      await loadCustomers()
      setToast({ open: true, message: 'Cliente criado com sucesso' })
      setCreateModalOpen(false)
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar cliente' })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCustomer = async (id: CustomerRow['id']) => {
    try {
      await customerService.remove(id as string)
      setCustomers((prev) => prev.filter((customer) => customer.id !== id))
      setToast({ open: true, message: 'Cliente removido' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleBulkDelete = async (ids: CustomerRow['id'][]) => {
    try {
      await Promise.all(ids.map((id) => customerService.remove(id as string)))
      setCustomers((prev) => prev.filter((customer) => !ids.includes(customer.id)))
      setToast({ open: true, message: 'Clientes removidos' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleOpenDashboard = (customer: CustomerRow) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('customerId', customer.id as string)
      return newParams
    })
  }

  const handleCloseDashboard = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.delete('customerId')
      return newParams
    })
  }

  const customerFormFields: TableCardFormField<CustomerRow>[] = useMemo(
    () => [
      {
        key: 'cpfCnpj',
        label: 'CPF/CNPJ',
        required: true,
        renderInput: ({ value, onChange, field, disabled }) => (
          <CPFCNPJPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Informe CPF ou CNPJ"
            required={field.required}
            disabled={disabled}
          />
        ),
      },
      {
        key: 'name',
        label: 'Nome',
        required: true,
        renderInput: ({ value, onChange, field, disabled }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Nome do cliente"
            required={field.required}
            disabled={disabled}
          />
        ),
      },
      {
        key: 'lastName',
        label: 'Sobrenome',
        required: true,
        renderInput: ({ value, onChange, field, disabled }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Sobrenome do cliente"
            required={field.required}
            disabled={disabled}
          />
        ),
      },
    ],
    [],
  )

  const rowActions: TableCardRowAction<CustomerRow>[] = useMemo(() => [
    {
      label: 'Ver',
      icon: <VisibilityOutlined fontSize="small" />,
      onClick: handleOpenDashboard,
      disabled: !hasPermission('comercial:clientes:visualizar'),
    },
  ], [hasPermission])

  const bulkActions: TableCardBulkAction<CustomerRow>[] = useMemo(() => [
    {
      label: 'Ver',
      icon: <VisibilityOutlined />,
      onClick: (ids) => {
        const customer = customers.find((c) => c.id === ids[0])
        if (customer) handleOpenDashboard(customer)
      },
      disabled: (ids) => ids.length !== 1 || !hasPermission('comercial:clientes:visualizar'),
    },
  ], [customers, hasPermission])

  const tableColumns = useMemo<TableCardColumn<CustomerRow>[]>(() => [
    { key: 'name', label: 'Nome' },
    { key: 'lastName', label: 'Sobrenome' },
    { key: 'cpfCnpj', label: 'CPF/CNPJ' },
    { key: 'createdAt', label: 'Cadastro', dataType: 'date' },
  ], [])

  if (!loading && !hasPermission('comercial:clientes:listar')) {
    return (
      <Box className="customers-page">
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Você não tem permissão para listar clientes
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="customers-page">
      {loading ? (
        <Box className="customers-page__loading">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Carregando clientes...
          </Typography>
        </Box>
      ) : (
        <TableCard
          title="Clientes"
          columns={tableColumns}
          rows={customers}
          onAddClick={hasPermission('comercial:clientes:criar') ? () => setCreateModalOpen(true) : undefined}
          onDelete={handleDeleteCustomer}
          onBulkDelete={hasPermission('comercial:clientes:excluir') ? handleBulkDelete : undefined}
          rowActions={rowActions}
          bulkActions={bulkActions}
          onRowClick={(row) => {
            if (hasPermission('comercial:clientes:visualizar')) {
              handleOpenDashboard(row)
            }
          }}
          disableDelete={!hasPermission('comercial:clientes:excluir')}
          disableEdit={!hasPermission('comercial:clientes:editar')}
          disableView={!hasPermission('comercial:clientes:visualizar')}
        />
      )}

      {/* Add Customer Modal */}
      <CustomerFormDialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleAddCustomer}
        title="Adicionar Cliente"
        saving={creating}
      />

      <CustomerDashboard
        customerId={dashboardCustomerId}
        open={dashboardOpen}
        onClose={handleCloseDashboard}
        onUpdate={loadCustomers}
      />

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

export default CustomersPage
