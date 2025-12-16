
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

type CustomerFormDialogProps = {
    open: boolean
    onClose: () => void
    onSave: (data: { name: string; lastName: string; cpfCnpj: string }) => void
    initialValues?: { name: string; lastName: string; cpfCnpj: string }
    title?: string
    saving?: boolean
}

const CustomerFormDialog = ({
    open,
    onClose,
    onSave,
    initialValues,
    title = 'Adicionar Cliente',
    saving = false
}: CustomerFormDialogProps) => {
    const [form, setForm] = useState({
        name: '',
        lastName: '',
        cpfCnpj: ''
    })

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setForm(initialValues || { name: '', lastName: '', cpfCnpj: '' })
            setError(null)
        }
    }, [open, initialValues])

    const handleSave = () => {
        const requiredFields = []
        if (!form.cpfCnpj) requiredFields.push('CPF/CNPJ')
        if (!form.name) requiredFields.push('Nome')
        if (!form.lastName) requiredFields.push('Sobrenome')

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
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <CPFCNPJPicker
                                label="CPF/CNPJ"
                                value={form.cpfCnpj}
                                onChange={(val) => setForm(prev => ({ ...prev, cpfCnpj: val }))}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Nome"
                                value={form.name}
                                onChange={(val) => setForm(prev => ({ ...prev, name: val }))}
                                fullWidth
                                required
                                placeholder="Nome do cliente"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Sobrenome"
                                value={form.lastName}
                                onChange={(val) => setForm(prev => ({ ...prev, lastName: val }))}
                                fullWidth
                                required
                                placeholder="Sobrenome do cliente"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}>
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

export default CustomerFormDialog
