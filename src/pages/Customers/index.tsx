import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import TableCard, {
  type TableCardColumn,
  type TableCardRow,
} from '../../components/TableCard'
import { useSearch } from '../../context/SearchContext'
import './style.css'

type CustomerStatus = 'Ativo' | 'Inativo' | 'Banido'

type CustomerRow = TableCardRow & {
  name: string
  email: string
  document: string
  status: CustomerStatus
  createdAt: string
}

const customerColumns: TableCardColumn<CustomerRow>[] = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'document', label: 'Documento' },
  { key: 'status', label: 'Status', dataType: 'status' },
  { key: 'createdAt', label: 'Cadastro', dataType: 'date' },
]

const initialCustomers: CustomerRow[] = [
  {
    id: '1',
    name: 'Felipe Quintino Torres',
    email: 'felipe.torres@example.com',
    document: '5511993815132',
    status: 'Ativo',
    createdAt: '2025-11-14',
  },
  {
    id: '2',
    name: 'Bianca Carvalho',
    email: 'bianca.carvalho@example.com',
    document: '84851236000190',
    status: 'Ativo',
    createdAt: '2025-10-02',
  },
  {
    id: '3',
    name: 'Marcelo Azevedo',
    email: 'marcelo.azevedo@example.com',
    document: '07469382000152',
    status: 'Inativo',
    createdAt: '2025-09-21',
  },
]

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now())

const CustomersPage = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers)
  const { setFilters, setPlaceholder, setQuery } = useSearch()

  useEffect(() => {
    setPlaceholder('Pesquisar cliente, documento ou e-mail')
    const filters = [
      { id: 'name', label: 'Nome', field: 'name', type: 'text' as const, page: 'customers' },
      { id: 'email', label: 'E-mail', field: 'email', type: 'text' as const, page: 'customers' },
      { id: 'document', label: 'Documento', field: 'document', type: 'text' as const, page: 'customers' },
    ]
    setFilters(filters, 'name')
    return () => {
      setFilters([])
      setPlaceholder('Pesquisar')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const handleAddCustomer = (data: Partial<CustomerRow>) => {
    const newCustomer: CustomerRow = {
      id: generateId(),
      name: (data.name as string) ?? 'Novo cliente',
      email: (data.email as string) ?? 'email@empresa.com',
      document: (data.document as string) ?? '00000000000',
      status: (data.status as CustomerStatus) ?? 'Ativo',
      createdAt: data.createdAt ?? new Date().toISOString(),
    }
    setCustomers((prev) => [...prev, newCustomer])
  }

  const handleEditCustomer = (id: CustomerRow['id'], data: Partial<CustomerRow>) => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === id ? { ...customer, ...data } : customer)),
    )
  }

  const handleDeleteCustomer = (id: CustomerRow['id']) => {
    setCustomers((prev) => prev.filter((customer) => customer.id !== id))
  }

  const handleBulkDelete = (ids: CustomerRow['id'][]) => {
    setCustomers((prev) => prev.filter((customer) => !ids.includes(customer.id)))
  }

  return (
    <Box className="customers-page">
      <TableCard
        title="Clientes"
        columns={customerColumns}
        rows={customers}
        onAdd={handleAddCustomer}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onBulkDelete={handleBulkDelete}
      />
    </Box>
  )
}

export default CustomersPage

