
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Box,
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
import SelectPicker from '../../components/SelectPicker'
import { relationshipTypeService, type RelationshipTypeDTO } from '../../services/relationshipTypes'
import './style.css'

type RelationshipTypeRow = TableCardRow & RelationshipTypeDTO

const DEFAULT_USER = 'admin'

const RelationshipTypesPage = () => {
    const [types, setTypes] = useState<RelationshipTypeRow[]>([])
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
        setPlaceholder('Pesquisar por origem ou destino...')
        const filters = [
            { id: 'relationshipSource', label: 'Origem', field: 'relationshipSource', type: 'text' as const, page: 'tipos-relacionamento' },
            { id: 'relationshipTarget', label: 'Destino', field: 'relationshipTarget', type: 'text' as const, page: 'tipos-relacionamento' },
        ]
        setFilters(filters, 'relationshipSource')
        return () => {
            setFilters([])
            setPlaceholder('')
            setQuery('')
        }
    }, [setFilters, setPlaceholder, setQuery])

    const loadTypes = async () => {
        try {
            setLoading(true)
            const data = await relationshipTypeService.list()
            setTypes(data.map(type => ({ ...type })))
        } catch (err) {
            console.error(err)
            setError('Não foi possível carregar tipos de relacionamento')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (hasPermission('cadastro:tipos-relacionamento:listar')) {
            loadTypes()
        } else {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissions])

    const handleAddType = async (data: Partial<RelationshipTypeRow>) => {
        try {
            let inverseId = (data.inverseTypeId as string) || 'auto'
            if (inverseId === 'auto') {
                inverseId = crypto.randomUUID()
            }

            const payload = {
                connectorPrefix: (data.connectorPrefix as string) ?? '',
                relationshipSource: (data.relationshipSource as string) ?? '',
                connectorSuffix: (data.connectorSuffix as string) ?? '',
                relationshipTarget: (data.relationshipTarget as string) ?? '',
                inverseTypeId: inverseId,
                createdBy: currentUser?.login ?? DEFAULT_USER,
            }
            await relationshipTypeService.create(payload)
            await loadTypes()
            setToast({ open: true, message: 'Tipo de relacionamento criado com sucesso' })
        } catch (err) {
            console.error(err)
            setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao criar tipo de relacionamento' })
        }
    }

    const handleEditType = async (id: string, data: Partial<RelationshipTypeRow>) => {
        try {
            const payload = {
                connectorPrefix: data.connectorPrefix as string | undefined,
                relationshipSource: data.relationshipSource as string | undefined,
                connectorSuffix: data.connectorSuffix as string | undefined,
                relationshipTarget: data.relationshipTarget as string | undefined,
                inverseTypeId: data.inverseTypeId as string | undefined,
                updatedBy: currentUser?.login ?? DEFAULT_USER,
            }
            await relationshipTypeService.update(id, payload)
            await loadTypes()
            setToast({ open: true, message: 'Tipo de relacionamento atualizado com sucesso' })
        } catch (err) {
            console.error(err)
            setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao atualizar tipo de relacionamento' })
        }
    }

    const handleDeleteType = async (id: string) => {
        try {
            await relationshipTypeService.remove(id)
            setTypes((prev) => prev.filter((type) => type.id !== id))
            setToast({ open: true, message: 'Tipo de relacionamento removido' })
        } catch (err) {
            console.error(err)
            setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
        }
    }

    const handleBulkDelete = async (ids: string[]) => {
        try {
            await Promise.all(ids.map((id) => relationshipTypeService.remove(id)))
            setTypes((prev) => prev.filter((type) => !ids.includes(type.id)))
            setToast({ open: true, message: 'Tipos de relacionamento removidos' })
        } catch (err) {
            console.error(err)
            setToast({ open: true, message: err instanceof Error ? err.message : 'Erro ao remover' })
        }
    }

    const relationshipFormFields: TableCardFormField<RelationshipTypeRow>[] = useMemo(
        () => [
            {
                key: 'connectorPrefix',
                label: 'Prefixo',
                required: true,
                renderInput: ({ value, onChange, field, disabled }) => (
                    <TextPicker
                        label={field.label}
                        value={typeof value === 'string' ? value : ''}
                        onChange={(text) => onChange(text)}
                        fullWidth
                        placeholder="Ex: É pai de"
                        required={field.required}
                        disabled={disabled}
                    />
                ),
            },
            {
                key: 'relationshipSource',
                label: 'Origem',
                required: true,
                renderInput: ({ value, onChange, field, disabled }) => (
                    <TextPicker
                        label={field.label}
                        value={typeof value === 'string' ? value : ''}
                        onChange={(text) => onChange(text)}
                        fullWidth
                        placeholder="Ex: Pai"
                        required={field.required}
                        disabled={disabled}
                    />
                ),
            },
            {
                key: 'connectorSuffix',
                label: 'Sufixo',
                required: true,
                renderInput: ({ value, onChange, field, disabled }) => (
                    <TextPicker
                        label={field.label}
                        value={typeof value === 'string' ? value : ''}
                        onChange={(text) => onChange(text)}
                        fullWidth
                        placeholder="Ex: de"
                        required={field.required}
                        disabled={disabled}
                    />
                ),
            },
            {
                key: 'relationshipTarget',
                label: 'Destino',
                required: true,
                renderInput: ({ value, onChange, field, disabled }) => (
                    <TextPicker
                        label={field.label}
                        value={typeof value === 'string' ? value : ''}
                        onChange={(text) => onChange(text)}
                        fullWidth
                        placeholder="Ex: Filho"
                        required={field.required}
                        disabled={disabled}
                    />
                ),
            },
            {
                key: 'inverseTypeId',
                label: 'Tipo Inverso',
                required: true,
                defaultValue: 'auto',
                renderInput: ({ value, onChange, field, disabled }) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <SelectPicker
                            label={field.label}
                            value={typeof value === 'string' ? value : 'auto'}
                            onChange={(val) => onChange(val as string)}
                            options={[
                                { value: 'auto', label: 'Autogerar novo recíproco' },
                                ...types.map(t => ({ value: t.id, label: `${t.connectorPrefix} ${t.relationshipSource} -> ${t.relationshipTarget}` }))
                            ]}
                            fullWidth
                            required={field.required}
                            disabled={disabled}
                        />
                        {value === 'auto' && (
                            <Typography variant="caption" className="relationship-helper-text" sx={{ ml: 1 }}>
                                Um novo tipo de relacionamento será criado automaticamente como inverso deste.
                            </Typography>
                        )}
                    </Box>
                ),
            },
        ],
        [types],
    )

    const tableColumns = useMemo<TableCardColumn<RelationshipTypeRow>[]>(() => [
        { key: 'connectorPrefix', label: 'Prefixo' },
        { key: 'relationshipSource', label: 'Origem' },
        { key: 'connectorSuffix', label: 'Sufixo' },
        { key: 'relationshipTarget', label: 'Destino' },
        { key: 'createdAt', label: 'Cadastro', dataType: 'date' },
    ], [types])

    if (!loading && !hasPermission('cadastro:tipos-relacionamento:listar')) {
        return (
            <Box className="relationship-types-page">
                <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                    Você não tem permissão para listar tipos de relacionamento
                </Typography>
            </Box>
        )
    }

    return (
        <Box className="relationship-types-page">
            <TableCard
                title="Tipos de Relacionamento"
                columns={tableColumns}
                rows={types}
                loading={loading}
                onAdd={hasPermission('cadastro:tipos-relacionamento:criar') ? handleAddType : undefined}
                onEdit={hasPermission('cadastro:tipos-relacionamento:editar') ? handleEditType : undefined}
                onDelete={hasPermission('cadastro:tipos-relacionamento:excluir') ? handleDeleteType : undefined}
                onBulkDelete={hasPermission('cadastro:tipos-relacionamento:excluir') ? handleBulkDelete : undefined}
                formFields={relationshipFormFields}
                disableDelete={!hasPermission('cadastro:tipos-relacionamento:excluir')}
                disableEdit={!hasPermission('cadastro:tipos-relacionamento:editar')}
                disableView={!hasPermission('cadastro:tipos-relacionamento:visualizar')}
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

export default RelationshipTypesPage
