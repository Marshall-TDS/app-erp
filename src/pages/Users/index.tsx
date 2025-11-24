import { useEffect, useState } from 'react'
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, Typography } from '@mui/material'
import { PasswordOutlined, VisibilityOutlined } from '@mui/icons-material'
import TableCard, {
  type TableCardColumn,
  type TableCardFormField,
  type TableCardRow,
  type TableCardRowAction,
} from '../../components/TableCard'
import { useSearch } from '../../context/SearchContext'
import TextPicker from '../../components/TextPicker'
import MultiSelectPicker from '../../components/MultiSelectPicker'
import MailPicker from '../../components/MailPicker'
import './style.css'

type UserRow = TableCardRow & {
  fullName: string
  login: string
  email: string
  userGroup: string[]
  features: string[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

const userColumns: TableCardColumn<UserRow>[] = [
  { key: 'fullName', label: 'Nome completo' },
  { key: 'login', label: 'Login' },
  {
    key: 'userGroup',
    label: 'Grupos',
    render: (value: UserRow['userGroup']) => (Array.isArray(value) ? value.join(', ') : value ?? '--'),
  },
  { key: 'createdAt', label: 'Criado em', dataType: 'date' },
]

const userGroups = [
  { label: 'Administradores', value: 'Administradores' },
  { label: 'Operações', value: 'Operações' },
  { label: 'Financeiro', value: 'Financeiro' },
  { label: 'Comercial', value: 'Comercial' },
  { label: 'RH', value: 'RH' },
  { label: 'Jurídico', value: 'Jurídico' },
  { label: 'Tecnologia', value: 'Tecnologia' },
  { label: 'Expansão', value: 'Expansão' },
  { label: 'Suporte Avançado', value: 'Suporte Avançado' },
]

const featureOptions = [
  { label: 'Dashboard avançado', value: 'dashboard' },
  { label: 'Liberação de crédito', value: 'credito' },
  { label: 'Aprovação de compra', value: 'compras' },
  { label: 'Gestão de estoques críticos', value: 'estoque' },
  { label: 'Análise financeira', value: 'financeiro' },
]

const userFormFields: TableCardFormField<UserRow>[] = [
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
  {
    key: 'userGroup',
    label: 'Grupo de Usuário',
    required: true,
    renderInput: ({ value, onChange, field }) => (
      <MultiSelectPicker
        label={field.label}
        value={Array.isArray(value) ? value : []}
        onChange={(selected) => onChange(selected)}
        options={userGroups}
        fullWidth
        placeholder="Selecione um ou mais grupos"
        showSelectAll
        chipDisplay="block"
        required
      />
    ),
  },
  {
    key: 'features',
    label: 'Funcionalidades extraordinárias',
    renderInput: ({ value, onChange, field }) => (
      <MultiSelectPicker
        label={field.label}
        value={Array.isArray(value) ? value : []}
        onChange={(selected) => onChange(selected)}
        options={featureOptions}
        fullWidth
        placeholder="Selecione as funcionalidades"
        showSelectAll
        chipDisplay="block"
      />
    ),
  },
]

const initialUsers: UserRow[] = [
  {
    id: 'u-1',
    fullName: 'Mariana Lopes',
    login: 'mlopes',
    email: 'mariana.lopes@example.com',
    userGroup: ['Administradores'],
    features: ['dashboard', 'financeiro'],
    createdAt: '2025-10-02T10:45:00Z',
    createdBy: 'sistema@erp.com',
    updatedAt: '2025-11-05T17:30:00Z',
    updatedBy: 'sistema@erp.com',
  },
  {
    id: 'u-2',
    fullName: 'Cláudio Mendes',
    login: 'cmendes',
    email: 'claudio.mendes@example.com',
    userGroup: ['Operações'],
    features: ['estoque'],
    createdAt: '2025-09-12T09:20:00Z',
    createdBy: 'sistema@erp.com',
    updatedAt: '2025-10-15T11:10:00Z',
    updatedBy: 'sistema@erp.com',
  },
  {
    id: 'u-3',
    fullName: 'Simone Andrade',
    login: 'sandrade',
    email: 'simone.andrade@example.com',
    userGroup: ['Financeiro'],
    features: ['financeiro', 'credito'],
    createdAt: '2025-07-25T14:05:00Z',
    createdBy: 'sistema@erp.com',
    updatedAt: '2025-09-01T16:42:00Z',
    updatedBy: 'sistema@erp.com',
  },
]

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())

const currentUser = 'admin@marshall.com'

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [detailUser, setDetailUser] = useState<UserRow | null>(null)
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })
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

  const handleAddUser = (data: Partial<UserRow>) => {
    const timestamp = new Date().toISOString()
    const newUser: UserRow = {
      id: generateId(),
      fullName: (data.fullName as string) ?? 'Novo usuário',
      login: (data.login as string) ?? 'novo.login',
      email: (data.email as string) ?? 'novo.usuario@example.com',
      userGroup: Array.isArray(data.userGroup)
        ? (data.userGroup as string[])
        : data.userGroup
          ? [data.userGroup as string]
          : [userGroups[0].value],
      features: (data.features as string[]) ?? [],
      createdAt: timestamp,
      createdBy: currentUser,
      updatedAt: timestamp,
      updatedBy: currentUser,
    }
    setUsers((prev) => [...prev, newUser])
  }

  const handleEditUser = (id: UserRow['id'], data: Partial<UserRow>) => {
    const timestamp = new Date().toISOString()
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) return user
        const nextUser: UserRow = {
          ...user,
          ...data,
          userGroup: Array.isArray(data.userGroup)
            ? (data.userGroup as string[])
            : data.userGroup
              ? [data.userGroup as string]
              : user.userGroup,
          features: (data.features as string[]) ?? user.features,
          updatedAt: timestamp,
          updatedBy: currentUser,
        }
        return nextUser
      }),
    )
  }

  const handleDeleteUser = (id: UserRow['id']) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const handleBulkDelete = (ids: UserRow['id'][]) => {
    setUsers((prev) => prev.filter((user) => !ids.includes(user.id)))
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

  const rowActions: TableCardRowAction<UserRow>[] = [
    {
      label: 'Ver',
      icon: <VisibilityOutlined fontSize="small" />,
      onClick: handleViewUser,
    },
    {
      label: 'Enviar alteração de senha',
      icon: <PasswordOutlined fontSize="small" />,
      onClick: handleSendPasswordUpdate,
    },
  ]

  return (
    <Box className="users-page">
      <TableCard
        title="Usuários"
        columns={userColumns}
        rows={users}
        onAdd={handleAddUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onBulkDelete={handleBulkDelete}
        formFields={userFormFields}
        rowActions={rowActions}
      />

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
                  {detailUser.userGroup.length === 0 && (
                    <Typography color="text.secondary">Nenhum grupo selecionado</Typography>
                  )}
                  {detailUser.userGroup.map((group) => (
                    <Chip key={group} label={group} size="small" />
                  ))}
                </Stack>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Funcionalidades extraordinárias
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {detailUser.features.length === 0 && (
                    <Typography color="text.secondary">Nenhuma funcionalidade atribuída</Typography>
                  )}
                  {detailUser.features.map((feature) => {
                    const label = featureOptions.find((option) => option.value === feature)?.label ?? feature
                    return <Chip key={feature} label={label} size="small" />
                  })}
                </Stack>
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

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ open: false, message: '' })}
        message={toast.message}
      />
    </Box>
  )
}

export default UsersPage

