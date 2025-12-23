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
  type TableCardRow,
  type TableCardRowAction,
  type TableCardBulkAction,
} from '../../components/TableCard'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import { getAccessMode, isHidden, canVisualizeItem } from '../../utils/accessControl'

import { peopleService, type PeopleDTO } from '../../services/people'
import PeopleDashboard from './PeopleDashboard'
import PeopleFormDialog from './components/PeopleFormDialog'
import './style.css'

type PeopleRow = TableCardRow & {
  id: string
  name: string
  cpfCnpj: string
  birthDate?: string | null
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

const DEFAULT_USER = 'admin'

const PeoplePage = () => {
  const [people, setPeople] = useState<PeopleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [dashboardPeopleId, setDashboardPeopleId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })
  const [error, setError] = useState<string | null>(null)

  const { setFilters, setPlaceholder, setQuery } = useSearch()
  const { permissions, user: currentUser } = useAuth()

  const peopleAccessMode = useMemo(() => getAccessMode(permissions, 'cadastro:pessoas'), [permissions])


  useEffect(() => {
    setPlaceholder('')
    const filters = [
      { id: 'name', label: 'Nome', field: 'name', type: 'text' as const, page: 'people' },
      { id: 'cpfCnpj', label: 'CPF/CNPJ', field: 'cpfCnpj', type: 'text' as const, page: 'people' },
    ]
    setFilters(filters, 'name')
    return () => {
      setFilters([])
      setPlaceholder('')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const mapPeopleToRow = useCallback(
    (people: PeopleDTO): PeopleRow => ({
      ...people,
    }),
    [],
  )

  const loadPeople = async () => {
    try {
      setLoading(true)
      const data = await peopleService.list()
      setPeople(data.map(mapPeopleToRow))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar pessoas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isHidden(peopleAccessMode)) {
      loadPeople()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, peopleAccessMode])

  // Sync Dashboard state with URL Query Params
  useEffect(() => {
    const peopleIdParam = searchParams.get('peopleId')
    const canView = canVisualizeItem(peopleAccessMode)

    if (peopleIdParam && canView) {
      if (dashboardPeopleId !== peopleIdParam || !dashboardOpen) {
        setDashboardPeopleId(peopleIdParam)
        setDashboardOpen(true)
      }
    } else {
      if (dashboardOpen) {
        setDashboardOpen(false)
        setDashboardPeopleId(null)
      }
    }
  }, [searchParams, peopleAccessMode, dashboardPeopleId, dashboardOpen])

  const handleAddPeople = async (data: { name: string; cpfCnpj: string }) => {
    try {
      setCreating(true)
      const payload = {
        name: data.name,
        cpfCnpj: data.cpfCnpj,
        birthDate: null,
        createdBy: currentUser?.login ?? DEFAULT_USER,
      }
      await peopleService.create(payload)
      await loadPeople()
      setToast({ open: true, message: 'Pessoa criada com sucesso' })
      setCreateModalOpen(false)
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar pessoa' })
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePeople = async (id: PeopleRow['id']) => {
    try {
      await peopleService.remove(id as string)
      setPeople((prev) => prev.filter((people) => people.id !== id))
      setToast({ open: true, message: 'Pessoa removida' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleBulkDelete = async (ids: PeopleRow['id'][]) => {
    try {
      await Promise.all(ids.map((id) => peopleService.remove(id as string)))
      setPeople((prev) => prev.filter((people) => !ids.includes(people.id)))
      setToast({ open: true, message: 'Pessoas removidas' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleOpenDashboard = (people: PeopleRow) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('peopleId', people.id as string)
      return newParams
    })
  }

  const handleCloseDashboard = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.delete('peopleId')
      return newParams
    })
  }

  const rowActions: TableCardRowAction<PeopleRow>[] = useMemo(() => [
    {
      label: 'Ver',
      icon: <VisibilityOutlined fontSize="small" />,
      onClick: handleOpenDashboard,
    },
  ], [handleOpenDashboard])

  const bulkActions: TableCardBulkAction<PeopleRow>[] = useMemo(() => [
    {
      label: 'Ver',
      icon: <VisibilityOutlined />,
      onClick: (ids) => {
        const person = people.find((c) => c.id === ids[0])
        if (person) handleOpenDashboard(person)
      },
      disabled: (ids) => ids.length !== 1,
    },
  ], [people, handleOpenDashboard])

  const tableColumns = useMemo<TableCardColumn<PeopleRow>[]>(() => [
    { key: 'name', label: 'Nome' },
    { key: 'cpfCnpj', label: 'CPF/CNPJ' },
    { key: 'createdAt', label: 'Cadastro', dataType: 'date' },
  ], [])


  return (
    <Box className="people-page">
      {loading ? (
        <Box className="people-page__loading">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Carreganda pessoas...
          </Typography>
        </Box>
      ) : (
        <TableCard
          title="Pessoas"
          columns={tableColumns}
          rows={people}
          onAddClick={() => setCreateModalOpen(true)}
          onDelete={handleDeletePeople}
          onBulkDelete={handleBulkDelete}
          rowActions={rowActions}
          bulkActions={bulkActions}
          onRowClick={handleOpenDashboard}
          accessMode={peopleAccessMode}
        />
      )}

      {/* Add People Modal */}
      <PeopleFormDialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleAddPeople}
        title="Adicionar Pessoa"
        saving={creating}
      />

      <PeopleDashboard
        peopleId={dashboardPeopleId}
        open={dashboardOpen}
        onClose={handleCloseDashboard}
        onUpdate={loadPeople}
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

export default PeoplePage
