
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Snackbar
} from '@mui/material'
import TextPicker from '../../../components/TextPicker'
import CPFCNPJPicker, { cleanString, validateCPF, validateCNPJ } from '../../../components/CPFCNPJPicker'
import { useState, useEffect } from 'react'
import { isFull } from '../../../utils/accessControl'

import { type AccessMode } from '../../../components/Dashboard/DashboardBodyCard'

type PeopleFormDialogProps = {
    open: boolean
    onClose: () => void
    onSave: (data: { name: string; cpfCnpj: string }) => void
    initialValues?: { name: string; cpfCnpj: string }
    title?: string
    saving?: boolean
    accessMode?: AccessMode
}

const PeopleFormDialog = ({
    open,
    onClose,
    onSave,
    initialValues,
    title = 'Adicionar Pessoa',
    saving = false,
    accessMode = 'full'
}: PeopleFormDialogProps) => {
    const [form, setForm] = useState({
        name: '',
        cpfCnpj: ''
    })

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setForm(initialValues || { name: '', cpfCnpj: '' })
            setError(null)
        }
    }, [open, initialValues])

    const handleSave = () => {
        const requiredFields = []
        if (!form.cpfCnpj) requiredFields.push('CPF/CNPJ')
        if (!form.name) requiredFields.push('Nome')

        if (requiredFields.length > 0) {
            setError(`Preencha os campos obrigatórios: ${requiredFields.join(', ')}`)
            return
        }

        const clean = cleanString(form.cpfCnpj)
        let isValid = false

        if (clean.length === 11) {
            isValid = validateCPF(clean)
        } else if (clean.length === 14) {
            isValid = validateCNPJ(clean)
        }

        if (!isValid) {
            setError('CPF/CNPJ inválido')
            return
        }

        onSave(form)
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent dividers={false}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <CPFCNPJPicker
                                label="CPF/CNPJ"
                                value={form.cpfCnpj}
                                onChange={(val) => setForm(prev => ({ ...prev, cpfCnpj: val }))}
                                fullWidth
                                required
                                accessMode={accessMode}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Nome"
                                value={form.name}
                                onChange={(val) => setForm(prev => ({ ...prev, name: val }))}
                                fullWidth
                                required
                                placeholder="Nome da pessoa"
                                accessMode={accessMode}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        className="button-cancel"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving || !isFull(accessMode)}
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
            />
        </>
    )
}

export default PeopleFormDialog
