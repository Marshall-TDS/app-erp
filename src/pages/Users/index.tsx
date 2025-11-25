import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { PasswordOutlined, VisibilityOutlined, Groups2Outlined, SecurityOutlined } from '@mui/icons-material'
import TableCard, {
  type TableCardColumn,
  type TableCardFormField,
  type TableCardRow,
  type TableCardRowAction,
  type TableCardBulkAction,
} from '../../components/TableCard'
import { useSearch } from '../../context/SearchContext'
import TextPicker from '../../components/TextPicker'
import MultiSelectPicker from '../../components/MultiSelectPicker'
import MailPicker from '../../components/MailPicker'
import { userGroupService } from '../../services/userGroups'
import { userService, type UserDTO } from '../../services/users'
import './style.css'

type UserRow = TableCardRow & {
  id: string
  fullName: string
  login: string
  email: string
  groupIds: string[]
  groupNames: string[]
  allowFeatures: string[]
  deniedFeatures: string[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

const DEFAULT_USER = 'admin'
type GroupDictionary = Record<string, { name: string; features: string[] }>

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([])
  const [groupOptions, setGroupOptions] = useState<Array<{ label: string; value: string }>>([])
  const [groupDictionary, setGroupDictionary] = useState<GroupDictionary>({})
  const [featureOptions, setFeatureOptions] = useState<Array<{ label: string; value: string }>>([])
  const [featureDictionary, setFeatureDictionary] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [detailUser, setDetailUser] = useState<UserRow | null>(null)
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })
  const [error, setError] = useState<string | null>(null)
  const [manageGroupsDialog, setManageGroupsDialog] = useState<{
    open: boolean
    userId: string | null
    groupIds: string[]
    allowFeatures: string[]
  }>({ open: false, userId: null, groupIds: [], allowFeatures: [] })
  const [manageAccessDialog, setManageAccessDialog] = useState<{
    open: boolean
    userId: string | null
    allowFeatures: string[]
    deniedFeatures: string[]
  }>({ open: false, userId: null, allowFeatures: [], deniedFeatures: [] })
  const { setFilters, setPlaceholder, setQuery } = useSearch()

  useEffect(() => {
    setPlaceholder('Pesquisar usuário, login ou e-mail')
    const filters = [
      { id: 'fullName', label: 'Nome', field: 'fullName', type: 'text' as const, page: 'users' },
      { id: 'login', label: 'Login', field: 'login', type: 'text' as const, page: 'users' },
      { id: 'email', label: 'E-mail', field: 'email', type: 'text' as const, page: 'users' },
    ]
    setFilters(filters, 'fullName')
    return () => {
      setFilters([])
      setPlaceholder('Pesquisar')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const mapUserToRow = useCallback(
    (user: UserDTO, dictionary: GroupDictionary = groupDictionary): UserRow => ({
      ...user,
      groupNames: user.groupIds.map((groupId) => dictionary[groupId]?.name ?? groupId),
    }),
    [groupDictionary],
  )

  const loadFeatures = async () => {
    const list = await userGroupService.listFeatures()
    setFeatureOptions(list.map((feature) => ({ label: feature.name, value: feature.key })))
    setFeatureDictionary(
      list.reduce<Record<string, string>>((acc, feature) => {
        acc[feature.key] = feature.name
        return acc
      }, {}),
    )
  }

  const loadGroups = async (): Promise<GroupDictionary> => {
    const list = await userGroupService.list()
    setGroupOptions(list.map((group) => ({ label: group.name, value: group.id })))
    const dictionary = list.reduce<GroupDictionary>((acc, group) => {
      acc[group.id] = { name: group.name, features: group.features }
      return acc
    }, {})
    setGroupDictionary(dictionary)
    return dictionary
  }

  const loadUsers = async (dictionary: GroupDictionary = groupDictionary) => {
    const data = await userService.list()
    setUsers(data.map((user) => mapUserToRow(user, dictionary)))
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        await loadFeatures()
        const dictionary = await loadGroups()
        await loadUsers(dictionary)
      } catch (err) {
        console.error(err)
        setError('Não foi possível carregar usuários')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mergeGroupFeatures = useCallback(
    (selectedGroupIds: string[], currentAllow: string[] = []) => {
      const featureSet = new Set(currentAllow)
      selectedGroupIds.forEach((groupId) => {
        const features = groupDictionary[groupId]?.features ?? []
        features.forEach((feature) => featureSet.add(feature))
      })
      return Array.from(featureSet)
    },
    [groupDictionary],
  )



  const handleManageGroups = useCallback((selectedIds: UserRow['id'][]) => {
    if (selectedIds.length !== 1) return
    const userId = selectedIds[0] as string
    const user = users.find((u) => u.id === userId)
    if (!user) return

    setManageGroupsDialog({
      open: true,
      userId,
      groupIds: user.groupIds,
      allowFeatures: mergeGroupFeatures(user.groupIds, []),
    })
  }, [users, mergeGroupFeatures])

  const handleSaveGroups = async () => {
    if (!manageGroupsDialog.userId) return
    try {
      const payload = {
        groupIds: manageGroupsDialog.groupIds,
        updatedBy: DEFAULT_USER,
      }
      const updated = await userService.update(manageGroupsDialog.userId, payload)
      setUsers((prev) => prev.map((user) => (user.id === manageGroupsDialog.userId ? mapUserToRow(updated) : user)))
      setToast({ open: true, message: 'Grupos atualizados com sucesso' })
      setManageGroupsDialog((prev) => ({ ...prev, open: false }))
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar grupos' })
    }
  }

  const handleManageAccess = useCallback((selectedIds: UserRow['id'][]) => {
    if (selectedIds.length !== 1) return
    const userId = selectedIds[0] as string
    const user = users.find((u) => u.id === userId)
    if (!user) return

    setManageAccessDialog({
      open: true,
      userId,
      allowFeatures: user.allowFeatures,
      deniedFeatures: user.deniedFeatures,
    })
  }, [users])

  const handleSaveAccess = async () => {
    if (!manageAccessDialog.userId) return
    try {
      const payload = {
        allowFeatures: manageAccessDialog.allowFeatures,
        deniedFeatures: manageAccessDialog.deniedFeatures,
        updatedBy: DEFAULT_USER,
      }
      const updated = await userService.update(manageAccessDialog.userId, payload)
      setUsers((prev) => prev.map((user) => (user.id === manageAccessDialog.userId ? mapUserToRow(updated) : user)))
      setToast({ open: true, message: 'Acessos atualizados com sucesso' })
      setManageAccessDialog((prev) => ({ ...prev, open: false }))
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar acessos' })
    }
  }

  const handleAddUser = async (data: Partial<UserRow>) => {
    try {
      const payload = {
        fullName: (data.fullName as string) ?? '',
        login: (data.login as string) ?? '',
        email: (data.email as string) ?? '',
        groupIds: Array.isArray(data.groupIds) ? (data.groupIds as string[]) : [],
        allowFeatures: Array.isArray(data.allowFeatures) ? (data.allowFeatures as string[]) : [],
        deniedFeatures: Array.isArray(data.deniedFeatures) ? (data.deniedFeatures as string[]) : [],
        createdBy: DEFAULT_USER,
      }
      const created = await userService.create(payload)
      setUsers((prev) => [...prev, mapUserToRow(created)])
      setToast({ open: true, message: 'Usuário criado com sucesso' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar usuário' })
    }
  }

  const handleEditUser = async (id: UserRow['id'], data: Partial<UserRow>) => {
    try {
      const payload = {
        fullName: data.fullName as string | undefined,
        login: data.login as string | undefined,
        email: data.email as string | undefined,
        groupIds: Array.isArray(data.groupIds) ? (data.groupIds as string[]) : undefined,
        allowFeatures: Array.isArray(data.allowFeatures) ? (data.allowFeatures as string[]) : undefined,
        deniedFeatures: Array.isArray(data.deniedFeatures)
          ? (data.deniedFeatures as string[])
          : undefined,
        updatedBy: DEFAULT_USER,
      }
      const updated = await userService.update(id as string, payload)
      setUsers((prev) => prev.map((user) => (user.id === id ? mapUserToRow(updated) : user)))
      setToast({ open: true, message: 'Usuário atualizado' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar' })
    }
  }

  const handleDeleteUser = async (id: UserRow['id']) => {
    try {
      await userService.remove(id as string)
      setUsers((prev) => prev.filter((user) => user.id !== id))
      setToast({ open: true, message: 'Usuário removido' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleBulkDelete = async (ids: UserRow['id'][]) => {
    try {
      await Promise.all(ids.map((id) => userService.remove(id as string)))
      setUsers((prev) => prev.filter((user) => !ids.includes(user.id)))
      setToast({ open: true, message: 'Usuários removidos' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleViewUser = (user: UserRow) => {
    setDetailUser(user)
  }

  const handleSendPasswordUpdate = (user: UserRow) => {
    setToast({
      open: true,
      message: `Solicitação de alteração de senha enviada para ${user.email}`,
    })
  }

  const handleBulkSendPasswordUpdate = (ids: UserRow['id'][]) => {
    setToast({
      open: true,
      message: `Solicitação de alteração de senha enviada para ${ids.length} usuários`,
    })
  }

  const featureChips = useCallback(
    (keys: string[]) => {
      if (!Array.isArray(keys) || keys.length === 0) {
        return <Typography color="text.secondary" className="users-page__empty-text">Nenhuma funcionalidade</Typography>
      }
      return (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {keys.map((key) => (
            <Chip key={key} label={featureDictionary[key] ?? key} size="small" />
          ))}
        </Stack>
      )
    },
    [featureDictionary],
  )

  const userFormFields: TableCardFormField<UserRow>[] = useMemo(
    () => [
      {
        key: 'fullName',
        label: 'Nome completo',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Informe o nome completo"
            required
          />
        ),
      },
      {
        key: 'login',
        label: 'Login',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Defina um login único"
            required
          />
        ),
      },
      {
        key: 'email',
        label: 'E-mail',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <MailPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="usuario@empresa.com"
          />
        ),
      },
    ],
    [],
  )

  const rowActions: TableCardRowAction<UserRow>[] = useMemo(() => [
    {
      label: 'Ver',
      icon: <VisibilityOutlined fontSize="small" />,
      onClick: handleViewUser,
    },
    {
      label: 'Gerenciar grupos de acessos',
      icon: <Groups2Outlined fontSize="small" />,
      onClick: (row) => handleManageGroups([row.id]),
    },
    {
      label: 'Gerenciar acessos particulares',
      icon: <SecurityOutlined fontSize="small" />,
      onClick: (row) => handleManageAccess([row.id]),
    },
    {
      label: 'Enviar alteração de senha',
      icon: <PasswordOutlined fontSize="small" />,
      onClick: handleSendPasswordUpdate,
    },
  ], [handleManageGroups, handleManageAccess])

  const bulkActions: TableCardBulkAction<UserRow>[] = useMemo(() => [
    {
      label: 'Ver',
      icon: <VisibilityOutlined />,
      onClick: (ids) => {
        const user = users.find((u) => u.id === ids[0])
        if (user) handleViewUser(user)
      },
      disabled: (ids) => ids.length !== 1,
    },
    {
      label: 'Gerenciar grupos de acessos',
      icon: <Groups2Outlined />,
      onClick: handleManageGroups,
      disabled: (ids) => ids.length !== 1,
    },
    {
      label: 'Gerenciar acessos particulares',
      icon: <SecurityOutlined />,
      onClick: handleManageAccess,
      disabled: (ids) => ids.length !== 1,
    },
    {
      label: 'Enviar alteração de senha',
      icon: <PasswordOutlined />,
      onClick: handleBulkSendPasswordUpdate,
    }
  ], [handleManageGroups, handleManageAccess, users])

  const tableColumns = useMemo<TableCardColumn<UserRow>[]>(() => [
    { key: 'fullName', label: 'Nome completo' },
    { key: 'login', label: 'Login' },
    {
      key: 'groupNames',
      label: 'Grupos',
      render: (value: UserRow['groupNames']) =>
        Array.isArray(value) && value.length > 0 ? value.join(', ') : 'Nenhum grupo',
    },
    {
      key: 'allowFeatures',
      label: 'Funcionalidades permitidas',
      render: (value: UserRow['allowFeatures']) => featureChips(value),
    },
    {
      key: 'deniedFeatures',
      label: 'Funcionalidades negadas',
      render: (value: UserRow['deniedFeatures']) => featureChips(value),
    },
    { key: 'createdAt', label: 'Criado em', dataType: 'date' },
  ], [featureChips])

  return (
    <Box className="users-page">
      {loading ? (
        <Box className="users-page__loading">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Carregando usuários...
          </Typography>
        </Box>
      ) : (
        <TableCard
          title="Usuários"
          columns={tableColumns}
          rows={users}
          onAdd={handleAddUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onBulkDelete={handleBulkDelete}
          formFields={userFormFields}
          rowActions={rowActions}
          bulkActions={bulkActions}
        />
      )}

      <Dialog open={Boolean(detailUser)} onClose={() => setDetailUser(null)} fullWidth maxWidth="sm">
        <DialogTitle>Detalhes do usuário</DialogTitle>
        <DialogContent dividers>
          {detailUser && (
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Nome completo
                </Typography>
                <Typography>{detailUser.fullName}</Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Login
                </Typography>
                <Typography>{detailUser.login}</Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  E-mail
                </Typography>
                <Typography>{detailUser.email}</Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Grupos
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {detailUser.groupNames.length === 0 && (
                    <Typography color="text.secondary">Nenhum grupo selecionado</Typography>
                  )}
                  {detailUser.groupNames.map((group) => (
                    <Chip key={group} label={group} size="small" />
                  ))}
                </Stack>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Funcionalidades permitidas
                </Typography>
                {featureChips(detailUser.allowFeatures)}
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Funcionalidades negadas
                </Typography>
                {featureChips(detailUser.deniedFeatures)}
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Criado por
                </Typography>
                <Typography>
                  {detailUser.createdBy} em {new Date(detailUser.createdAt).toLocaleString()}
                </Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Última atualização
                </Typography>
                <Typography>
                  {detailUser.updatedBy} em {new Date(detailUser.updatedAt).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailUser(null)}>Fechar</Button>
          {detailUser && (
            <Button
              variant="outlined"
              startIcon={<PasswordOutlined fontSize="small" />}
              onClick={() => handleSendPasswordUpdate(detailUser)}
            >
              Enviar alteração de senha
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={manageGroupsDialog.open}
        onClose={() => setManageGroupsDialog(prev => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Gerenciar grupos de acessos</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <MultiSelectPicker
              label="Grupos de usuário"
              value={manageGroupsDialog.groupIds}
              onChange={(selected) => {
                const newGroups = selected as string[]
                const newFeatures = mergeGroupFeatures(newGroups, [])
                setManageGroupsDialog(prev => ({
                  ...prev,
                  groupIds: newGroups,
                  allowFeatures: newFeatures
                }))
              }}
              options={groupOptions}
              fullWidth
              placeholder="Selecione um ou mais grupos"
              showSelectAll
              chipDisplay="block"
            />
            <MultiSelectPicker
              label="Funcionalidades permitidas"
              value={manageGroupsDialog.allowFeatures}
              onChange={() => { }}
              options={featureOptions}
              fullWidth
              placeholder="Funcionalidades carregadas automaticamente"
              chipDisplay="block"
              disabled
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageGroupsDialog(prev => ({ ...prev, open: false }))}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveGroups}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={manageAccessDialog.open}
        onClose={() => setManageAccessDialog(prev => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Gerenciar acessos particulares</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <MultiSelectPicker
              label="Funcionalidades permitidas"
              value={manageAccessDialog.allowFeatures}
              onChange={(selected) => {
                setManageAccessDialog(prev => ({
                  ...prev,
                  allowFeatures: selected as string[]
                }))
              }}
              options={featureOptions}
              fullWidth
              placeholder="Selecione as funcionalidades permitidas"
              showSelectAll
              chipDisplay="block"
            />
            <MultiSelectPicker
              label="Funcionalidades negadas"
              value={manageAccessDialog.deniedFeatures}
              onChange={(selected) => {
                setManageAccessDialog(prev => ({
                  ...prev,
                  deniedFeatures: selected as string[]
                }))
              }}
              options={featureOptions}
              fullWidth
              placeholder="Selecione as funcionalidades negadas"
              showSelectAll
              chipDisplay="block"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageAccessDialog(prev => ({ ...prev, open: false }))}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveAccess}>Salvar</Button>
        </DialogActions>
      </Dialog>

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

export default UsersPage

