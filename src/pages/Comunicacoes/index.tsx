import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Snackbar, Typography, IconButton, Tooltip } from '@mui/material'
import { ContentCopy, Check } from '@mui/icons-material'
import TableCard, {
  type TableCardColumn,
  type TableCardFormField,
  type TableCardRow,
} from '../../components/TableCard'
import TextPicker from '../../components/TextPicker'
import SelectPicker from '../../components/SelectPicker'
import HtmlEditor from '../../components/HtmlEditor'
import KeyPicker from '../../components/KeyPicker'
import { useSearch } from '../../context/SearchContext'
import { comunicacaoService, type ComunicacaoDTO } from '../../services/comunicacoes'
import { remetenteService, type RemetenteDTO } from '../../services/remetentes'
import './style.css'

type ComunicacaoRow = TableCardRow & ComunicacaoDTO

const DEFAULT_USER = 'admin'

const ComunicacoesPage = () => {
  const [comunicacoes, setComunicacoes] = useState<ComunicacaoRow[]>([])
  const [remetentes, setRemetentes] = useState<RemetenteDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })
  const [error, setError] = useState<string | null>(null)
  const { setFilters, setPlaceholder, setQuery } = useSearch()

  useEffect(() => {
    setPlaceholder('')
    const filters = [
      { id: 'descricao', label: 'Descrição', field: 'descricao', type: 'text' as const, page: 'comunicacoes' },
      { id: 'chave', label: 'Chave', field: 'chave', type: 'text' as const, page: 'comunicacoes' },
    ]
    setFilters(filters, 'descricao')
    return () => {
      setFilters([])
      setPlaceholder('')
      setQuery('')
    }
  }, [setFilters, setPlaceholder, setQuery])

  const loadRemetentes = async () => {
    try {
      const data = await remetenteService.list()
      setRemetentes(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadComunicacoes = async () => {
    try {
      const data = await comunicacaoService.list()
      setComunicacoes(data.map((c) => ({ ...c })))
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar comunicações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      await loadRemetentes()
      await loadComunicacoes()
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getRemetenteNome = useCallback((remetenteId: string) => {
    const remetente = remetentes.find((r) => r.id === remetenteId)
    return remetente?.nome ?? remetenteId
  }, [remetentes])

  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopyKey = async (chave: string) => {
    try {
      await navigator.clipboard.writeText(chave)
      setCopiedKey(chave)
      setToast({ open: true, message: 'Chave copiada para a área de transferência' })
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Erro ao copiar chave:', err)
      setToast({ open: true, message: 'Erro ao copiar chave' })
    }
  }

  const handleAddComunicacao = async (data: Partial<ComunicacaoRow>) => {
    try {
      const payload = {
        tipo: 'email' as const,
        descricao: (data.descricao as string) ?? '',
        assunto: (data.assunto as string) ?? '',
        html: (data.html as string) ?? '',
        remetenteId: (data.remetenteId as string) ?? '',
        tipoEnvio: (data.tipoEnvio as 'imediato' | 'agendado') ?? 'imediato',
        chave: data.chave ? (data.chave as string).trim() : undefined,
        createdBy: DEFAULT_USER,
      }
      const created = await comunicacaoService.create(payload)
      setComunicacoes((prev) => [...prev, { ...created }])
      setToast({ open: true, message: 'Comunicação criada com sucesso' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar comunicação' })
    }
  }

  const handleEditComunicacao = async (id: ComunicacaoRow['id'], data: Partial<ComunicacaoRow>) => {
    try {
      // A chave não pode ser alterada após a criação, então não incluímos no payload
      const payload = {
        tipo: data.tipo as 'email' | undefined,
        descricao: data.descricao as string,
        assunto: data.assunto as string,
        html: data.html as string,
        remetenteId: data.remetenteId as string,
        tipoEnvio: data.tipoEnvio as 'imediato' | 'agendado' | undefined,
        updatedBy: DEFAULT_USER,
      }
      const updated = await comunicacaoService.update(id as string, payload)
      setComunicacoes((prev) => prev.map((c) => (c.id === id ? { ...updated } : c)))
      setToast({ open: true, message: 'Comunicação atualizada' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar' })
    }
  }

  const handleDeleteComunicacao = async (id: ComunicacaoRow['id']) => {
    try {
      await comunicacaoService.remove(id as string)
      setComunicacoes((prev) => prev.filter((c) => c.id !== id))
      setToast({ open: true, message: 'Comunicação removida' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const handleBulkDelete = async (ids: ComunicacaoRow['id'][]) => {
    try {
      await Promise.all(ids.map((id) => comunicacaoService.remove(id as string)))
      setComunicacoes((prev) => prev.filter((c) => !ids.includes(c.id)))
      setToast({ open: true, message: 'Comunicações removidas' })
    } catch (err) {
      console.error(err)
      setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
    }
  }

  const remetenteOptions = useMemo(() => 
    remetentes.map((r) => ({ label: r.nome, value: r.id })),
    [remetentes]
  )

  const comunicacaoFormFields: TableCardFormField<ComunicacaoRow>[] = useMemo(
    () => [
      {
        key: 'tipo',
        label: 'Tipo de comunicação',
        required: true,
        defaultValue: 'email',
        renderInput: ({ value, onChange, field }) => {
          const tipoValue = (value && typeof value === 'string' ? value : 'email') || 'email'
          return (
            <SelectPicker
              label={field.label}
              value={tipoValue}
              onChange={(val) => onChange(val || 'email')}
              options={[
                { label: 'E-mail', value: 'email' },
              ]}
              fullWidth
              required
              disabled
            />
          )
        },
      },
      {
        key: 'descricao',
        label: 'Descrição',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Informe a descrição da comunicação"
            required
          />
        ),
      },
      {
        key: 'assunto',
        label: 'Assunto',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <TextPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Informe o assunto do e-mail"
            required
          />
        ),
      },
      {
        key: 'html',
        label: 'HTML',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <HtmlEditor
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(text) => onChange(text)}
            fullWidth
            placeholder="Digite o HTML do e-mail aqui..."
            required
          />
        ),
      },
      {
        key: 'remetenteId',
        label: 'Remetente',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <SelectPicker
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChange={(val) => onChange(val)}
            options={remetenteOptions}
            fullWidth
            placeholder="Selecione o remetente"
            required
          />
        ),
      },
      {
        key: 'chave',
        label: 'Chave',
        required: false,
        renderInput: ({ value, onChange, field, formValues, disabled }) => {
          // value é o valor original do registro (quando editando)
          // formValues.chave é o valor atual no formulário
          const originalChave = value || ''
          const currentChave = formValues.chave || originalChave || ''
          
          // Se já existe uma chave original (modo edição), mostra apenas leitura
          const isEditMode = !!originalChave && originalChave !== ''
          
          // Se estiver editando e já tiver chave, mostra apenas leitura com botão de copiar
          if (isEditMode) {
            return (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" component="label" sx={{ fontWeight: 500 }}>
                    {field.label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '4px',
                    backgroundColor: 'action.hover',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      flex: 1,
                      wordBreak: 'break-all',
                    }}
                  >
                    {originalChave}
                  </Typography>
                  <Tooltip title={copiedKey === originalChave ? 'Copiado!' : 'Copiar chave'}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyKey(originalChave)}
                      sx={{ padding: '4px' }}
                    >
                      {copiedKey === originalChave ? (
                        <Check sx={{ fontSize: '18px', color: 'success.main' }} />
                      ) : (
                        <ContentCopy sx={{ fontSize: '18px' }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )
          }
          
          // Se estiver criando (sem chave original), permite editar
          return (
            <KeyPicker
              label={field.label}
              value={currentChave}
              onChange={(text) => onChange(text)}
              fullWidth
              placeholder="Ex: EMAIL-RESET-PASSWORD"
              disabled={disabled}
              helperText="Apenas letras, números e hífens. Espaços são convertidos em hífen."
            />
          )
        },
      },
      {
        key: 'tipoEnvio',
        label: 'Tipo de envio',
        required: true,
        renderInput: ({ value, onChange, field }) => (
          <SelectPicker
            label={field.label}
            value={typeof value === 'string' ? value : 'imediato'}
            onChange={(val) => onChange(val)}
            options={[
              { label: 'Imediato', value: 'imediato' },
              { label: 'Agendado (em desenvolvimento)', value: 'agendado', disabled: true },
            ]}
            fullWidth
            required
          />
        ),
      },
    ],
    [remetenteOptions, copiedKey],
  )

  const tableColumns = useMemo<TableCardColumn<ComunicacaoRow>[]>(() => [
    { key: 'descricao', label: 'Descrição' },
    { key: 'assunto', label: 'Assunto' },
    {
      key: 'remetenteId',
      label: 'Remetente',
      render: (value: ComunicacaoRow['remetenteId']) => (
        <Typography variant="body2">{getRemetenteNome(value)}</Typography>
      ),
    },
    { key: 'tipo', label: 'Tipo' },
    { key: 'tipoEnvio', label: 'Tipo de envio' },
    {
      key: 'chave',
      label: 'Chave',
      render: (value: ComunicacaoRow['chave']) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {value}
          </Typography>
          <Tooltip title={copiedKey === value ? 'Copiado!' : 'Copiar chave'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyKey(value)
              }}
              sx={{ padding: '4px' }}
            >
              {copiedKey === value ? (
                <Check sx={{ fontSize: '16px', color: 'success.main' }} />
              ) : (
                <ContentCopy sx={{ fontSize: '16px' }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [getRemetenteNome, copiedKey])

  return (
    <Box className="comunicacoes-page">
      {loading ? (
        <Box className="comunicacoes-page__loading">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Carregando comunicações...
          </Typography>
        </Box>
      ) : (
        <TableCard
          title="Comunicações"
          columns={tableColumns}
          rows={comunicacoes}
          onAdd={handleAddComunicacao}
          onEdit={handleEditComunicacao}
          onDelete={handleDeleteComunicacao}
          onBulkDelete={handleBulkDelete}
          formFields={comunicacaoFormFields}
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

export default ComunicacoesPage

