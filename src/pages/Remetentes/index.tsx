import { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Snackbar, Typography } from '@mui/material'
import TableCard, {
  type TableCardColumn,
  type TableCardFormField,
  type TableCardRow,
} from '../../components/TableCard'
import TextPicker from '../../components/TextPicker'
import MailPicker from '../../components/MailPicker'
import PasswordPicker from '../../components/PasswordPicker'
import SelectPicker from '../../components/SelectPicker'
import { useSearch } from '../../context/SearchContext'
import { remetenteService, type RemetenteDTO } from '../../services/remetentes'
import './style.css'

type RemetenteRow = TableCardRow & RemetenteDTO

const DEFAULT_USER = 'admin'

const RemetentesPage = () => {
  const [remetentes, setRemetentes] = useState<RemetenteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })
  const [error, setError] = useState<string | null>(null)
  const { setFilters, setPlaceholder, setQuery } = useSearch()

  useEffect(() => {
    setPlaceholder('')
    const filters = [
      { id: 'nome', label: 'Nome', field: 'nome', type: 'text' as const, page: 'remetentes' },
      { id: 'email', label: 'E-mail', field: 'email', type: 'text' as const, page: 'remetentes' },
    ]
    setFilters(filters, 'nome')
    return () => {
      setFilters([])
      setPlaceholder('')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const loadRemetentes = async () => {
    try {
      const data = await remetenteService.list()
      setRemetentes(data.map((r) => ({ ...r })))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar remetentes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRemetentes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddRemetente = async (data: Partial<RemetenteRow>) => {
    try {
      if (!data.senha || (data.senha as string).trim() === '') {
        setToast({ open: true, message: 'A senha é obrigatória na criação' })
        return
      }
      const payload = {
        nome: (data.nome as string) ?? '',
        email: (data.email as string) ?? '',
        senha: (data.senha as string) ?? '',
        smtpHost: (data.smtpHost as string) ?? '',
        smtpPort: Number(data.smtpPort) ?? 587,
        smtpSecure: Boolean(data.smtpSecure) ?? false,
        createdBy: DEFAULT_USER,
      }
      const created = await remetenteService.create(payload)
      setRemetentes((prev) => [...prev, { ...created }])
      setToast({ open: true, message: 'Remetente criado com sucesso' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar remetente' })
    }
  }

  const handleEditRemetente = async (id: RemetenteRow['id'], data: Partial<RemetenteRow>) => {
    try {
      const payload = {
        nome: data.nome as string,
        email: data.email as string,
        ...(data.senha ? { senha: data.senha as string } : {}),
        smtpHost: data.smtpHost as string,
        smtpPort: Number(data.smtpPort),
        smtpSecure: Boolean(data.smtpSecure),
        updatedBy: DEFAULT_USER,
      }
      const updated = await remetenteService.update(id as string, payload)
      setRemetentes((prev) => prev.map((r) => (r.id === id ? { ...updated } : r)))
      setToast({ open: true, message: 'Remetente atualizado' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar' })
    }
  }

  const handleDeleteRemetente = async (id: RemetenteRow['id']) => {
    try {
      await remetenteService.remove(id as string)
      setRemetentes((prev) => prev.filter((r) => r.id !== id))
      setToast({ open: true, message: 'Remetente removido' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleBulkDelete = async (ids: RemetenteRow['id'][]) => {
    try {
      await Promise.all(ids.map((id) => remetenteService.remove(id as string)))
      setRemetentes((prev) => prev.filter((r) => !ids.includes(r.id)))
      setToast({ open: true, message: 'Remetentes removidos' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const remetenteFormFields: TableCardFormField<RemetenteRow>[] = useMemo(
    () => [
      {
        key: 'nome',
        label: 'Nome descritivo',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Informe o nome descritivo do remetente"
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
            placeholder="remetente@empresa.com"
            required
          />
        ),
      },
      {
        key: 'senha',
        label: 'Senha',
        required: false,
        renderInput: ({ value, onChange, field }) => (
          <PasswordPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Deixe em branco para manter a senha atual (apenas na edição)"
          />
        ),
      },
      {
        key: 'smtpHost',
        label: 'Servidor SMTP',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="smtp.empresa.com"
            required
          />
        ),
      },
      {
        key: 'smtpPort',
        label: 'Porta SMTP',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            onChange={(text) => onChange(Number(text))}
            fullWidth
            placeholder="587"
            required
            type="number"
          />
        ),
      },
      {
        key: 'smtpSecure',
        label: 'Conexão segura (TLS/SSL)',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <SelectPicker
            label={field.label}
            value={typeof value === 'boolean' ? String(value) : 'false'}
            onChange={(val) => onChange(val === 'true')}
            options={[
              { label: 'Sim', value: 'true' },
              { label: 'Não', value: 'false' },
            ]}
            fullWidth
            required
          />
        ),
      },
    ],
    [],
  )

  const tableColumns = useMemo<TableCardColumn<RemetenteRow>[]>(() => [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'smtpHost', label: 'Servidor SMTP' },
    { key: 'smtpPort', label: 'Porta' },
    {
      key: 'smtpSecure',
      label: 'Seguro',
      render: (value: RemetenteRow['smtpSecure']) => (
        <Typography variant="body2">{value ? 'Sim' : 'Não'}</Typography>
      ),
    },
  ], [])

  return (
    <Box className="remetentes-page">
      {loading ? (
        <Box className="remetentes-page__loading">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Carregando remetentes...
          </Typography>
        </Box>
      ) : (
        <TableCard
          title="Remetentes"
          columns={tableColumns}
          rows={remetentes}
          onAdd={handleAddRemetente}
          onEdit={handleEditRemetente}
          onDelete={handleDeleteRemetente}
          onBulkDelete={handleBulkDelete}
          formFields={remetenteFormFields}
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

export default RemetentesPage

