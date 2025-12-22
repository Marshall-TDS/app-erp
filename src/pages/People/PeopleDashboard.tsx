
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import TextPicker from '../../components/TextPicker'

import DatePicker from '../../components/DatePicker'
import CEPPicker from '../../components/CEPPicker'
import BankCodePicker from '../../components/BankCodePicker'
import FileUpload from '../../components/FileUpload'
import PhonePicker from '../../components/PhonePicker'
import { parsePhoneNumber, formatPhoneNumber } from '../../components/PhonePicker/utils'
import MailPicker from '../../components/MailPicker'

import SelectPicker from '../../components/SelectPicker'
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    Snackbar,
    Alert
} from '@mui/material'
import {
    LocationOn,
    Phone,
    AccountBalance,
    Description,
    CheckCircle,
    Error,
    Warning,
    Email,
    Edit,
} from '@mui/icons-material'
import { DashboardBodyCardList } from '../../components/Dashboard/DashboardBodyCardList'
import {
    peopleService,
    type PeopleDTO,
    type PeopleContact,
    type PeopleAddress,
    type PeopleBankAccount,
    type PeopleDocument,
    type CreateDocumentPayload
} from '../../services/people'
import { getBankName } from '../../services/bankService'
import { DashboardTopBar } from '../../components/Dashboard/DashboardTopBar'
import { DashboardTopCard } from '../../components/Dashboard/DashboardTopCard'
import { DashboardBodyCard } from '../../components/Dashboard/DashboardBodyCard'
import PeopleFormDialog from './components/PeopleFormDialog'
import React from 'react'
import { MenuItem } from '@mui/material'

const MARITAL_STATUS_MAP: Record<string, string> = {
    'solteiro(a)': 'Solteiro(a)',
    'casado(a)': 'Casado(a)',
    'separado(a) judicialmente': 'Separado(a) Judicialmente',
    'divorciado(a)': 'Divorciado(a)',
    'viúvo(a)': 'Viúvo(a)'
}

type PeopleDashboardProps = {
    peopleId: string | null
    open: boolean
    onClose: () => void
    onUpdate?: () => void
}

const PeopleDashboard = ({ peopleId, open, onClose, onUpdate }: PeopleDashboardProps) => {
    const [people, setPeople] = useState<PeopleDTO | null>(null)
    const [loading, setLoading] = useState(false)
    const { permissions, user } = useAuth()

    // Edit People State
    const [editOpen, setEditOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        cpfCnpj: '',
    })

    // Contact Management State
    const [contactDialogOpen, setContactDialogOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<PeopleContact | null>(null)
    const [contactForm, setContactForm] = useState({
        contactType: 'Telefone',
        contactValue: '',
        label: ''
    })
    const [savingContact, setSavingContact] = useState(false)

    // Address Management State
    const [addressDialogOpen, setAddressDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<PeopleAddress | null>(null)
    const [addressForm, setAddressForm] = useState({
        addressType: 'Residencial',
        postalCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    })
    const [savingAddress, setSavingAddress] = useState(false)

    // Bank Accounts state
    const [bankDialogOpen, setBankDialogOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<PeopleBankAccount | null>(null)
    const [bankForm, setBankForm] = useState({
        bankCode: '',
        branchCode: '',
        accountNumber: '',
        accountType: 'Pagamento',
        pixKey: '',
        isDefaultReceipt: false
    })
    const [savingAccount, setSavingAccount] = useState(false)

    // Documents state
    const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
    const [editingDocument, setEditingDocument] = useState<PeopleDocument | null>(null)
    const [documentForm, setDocumentForm] = useState<{
        documentType: string
        file: string
        expirationDate: string
        fileName?: string
        fileSize?: number | string
    }>({
        documentType: '',
        file: '',
        expirationDate: '',
        fileName: '',
        fileSize: 0
    })
    const [savingDocument, setSavingDocument] = useState(false)

    // Details State
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [detailsForm, setDetailsForm] = useState({
        sex: '',
        maritalStatus: '',
        nationality: 'Brasileiro',
        occupation: '',
        birthDate: null as string | null,
        firstName: '',
        surname: '',
        legalName: '',
        tradeName: ''
    })
    const [savingDetails, setSavingDetails] = useState(false)

    const handleEditDetails = () => {
        if (!people) return
        const details = people.details
        setDetailsForm({
            sex: details?.sex || '',
            maritalStatus: details?.maritalStatus || '',
            nationality: details?.nationality || 'Brasileiro',
            occupation: details?.occupation || '',
            birthDate: details?.birthDate || null,
            firstName: details?.firstName || '',
            surname: details?.surname || '',
            legalName: details?.legalName || '',
            tradeName: details?.tradeName || ''
        })
        setDetailsDialogOpen(true)
    }

    const handleSaveDetails = async () => {
        if (!people) return

        try {
            setSavingDetails(true)
            const payload = {
                ...detailsForm,
                sex: detailsForm.sex || null,
                maritalStatus: detailsForm.maritalStatus || null,
                firstName: detailsForm.firstName || null,
                surname: detailsForm.surname || null,
                legalName: detailsForm.legalName || null,
                tradeName: detailsForm.tradeName || null,
            }

            if (people.details?.id) {
                await peopleService.updateDetail(people.id, people.details.id, payload)
            } else {
                await peopleService.createDetail(people.id, payload)
            }
            await loadPeopleData(people.id)
            setDetailsDialogOpen(false)
            setSnackbar({
                open: true,
                message: 'Detalhes atualizados com sucesso!',
                severity: 'success'
            })
        } catch (error) {
            console.error('Erro ao salvar detalhes:', error)
            setSnackbar({
                open: true,
                message: 'Erro ao salvar detalhes',
                severity: 'error'
            })
        } finally {
            setSavingDetails(false)
        }
    }

    const [saving, setSaving] = useState(false)
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'warning' | 'info' }>({
        open: false,
        message: '',
        severity: 'error'
    })

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false })
    }

    useEffect(() => {
        if (peopleId && open) {
            loadPeopleData(peopleId)
        } else {
            setPeople(null)
        }
    }, [peopleId, open])

    const loadPeopleData = async (id: string) => {
        try {
            setLoading(true)
            const data = await peopleService.getById(id)
            setPeople(data)
        } catch (error) {
            console.error('Erro ao carregar dados da pessoa:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatSize = (input: number | string) => {
        if (typeof input === 'string') return input
        const bytes = input
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleStartEdit = () => {
        if (!people) return
        setEditForm({
            name: people.name,
            cpfCnpj: people.cpfCnpj,
        })
        setEditOpen(true)
    }

    const handleSaveEdit = async (data?: { name: string; cpfCnpj: string }) => {
        if (!people) return

        // Use data if provided (from PeopleFormDialog), otherwise fallback to editForm state
        const formData = data || editForm

        const requiredFields = []
        if (!formData.cpfCnpj) requiredFields.push('CPF/CNPJ')
        if (!formData.name) requiredFields.push('Nome')

        if (requiredFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Preencha os campos obrigatórios: ${requiredFields.join(', ')}`,
                severity: 'warning'
            })
            return
        }

        const cleanCpfCnpj = formData.cpfCnpj.replace(/\D/g, '')
        if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
            setSnackbar({
                open: true,
                message: 'CPF/CNPJ inválido',
                severity: 'warning'
            })
            return
        }

        try {
            setSaving(true)
            await peopleService.update(people.id, {
                ...people,
                name: formData.name,
                cpfCnpj: formData.cpfCnpj,
                updatedBy: user?.login || 'system'
            })
            await loadPeopleData(people.id)
            if (onUpdate) {
                onUpdate()
            }
            setEditOpen(false)
            setSnackbar({
                open: true,
                message: 'Pessoa atualizada com sucesso!',
                severity: 'success'
            })
        } catch (error) {
            console.error('Erro ao salvar edição:', error)
            setSnackbar({
                open: true,
                message: 'Erro ao atualizar pessoa',
                severity: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCloseContactDialog = () => {
        setContactDialogOpen(false)
        setEditingContact(null)
        setContactForm({ contactType: 'Telefone', contactValue: '', label: '' })
    }

    const handleAddContact = () => {
        setEditingContact(null)
        setContactForm({ contactType: 'Telefone', contactValue: '', label: '' })
        setContactDialogOpen(true)
    }

    const handleEditContact = (contact: PeopleContact) => {
        setEditingContact(contact)
        setContactForm({
            contactType: contact.contactType,
            contactValue: contact.contactValue,
            label: contact.label || ''
        })
        setContactDialogOpen(true)
    }

    const handleDeleteContact = async (contact: PeopleContact) => {
        if (!people) return
        try {
            await peopleService.removeContact(people.id, contact.id)
            await loadPeopleData(people.id)
        } catch (error) {
            console.error('Erro ao excluir contato:', error)
        }
    }

    const handleSaveContact = async () => {
        if (!people) return

        const requiredFields = []
        if (!contactForm.contactType) requiredFields.push('Tipo')
        if (!contactForm.contactValue) requiredFields.push(contactForm.contactType || 'Valor')

        if (requiredFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Preencha os campos obrigatórios: ${requiredFields.join(', ')}`,
                severity: 'warning'
            })
            return
        }

        const invalidFields = []
        if (contactForm.contactType === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.contactValue)) {
            invalidFields.push('Email')
        }
        if (['Telefone', 'Whatsapp'].includes(contactForm.contactType)) {
            const digits = contactForm.contactValue.replace(/\D/g, '')
            if (digits.length < 10) {
                invalidFields.push(contactForm.contactType)
            }
        }

        if (invalidFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Dados inválidos nos campos: ${invalidFields.join(', ')}`,
                severity: 'warning'
            })
            return
        }

        try {
            setSavingContact(true)
            if (editingContact) {
                await peopleService.updateContact(people.id, editingContact.id, contactForm)
            } else {
                await peopleService.createContact(people.id, contactForm)
            }
            await loadPeopleData(people.id)
            handleCloseContactDialog()
        } catch (error) {
            console.error('Erro ao salvar contato:', error)
        } finally {
            setSavingContact(false)
        }
    }

    const handleCloseAddressDialog = () => {
        setAddressDialogOpen(false)
        setEditingAddress(null)
        setAddressForm({
            addressType: 'Residencial',
            postalCode: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: ''
        })
    }

    const handleAddAddress = () => {
        setEditingAddress(null)
        setAddressForm({
            addressType: 'Residencial',
            postalCode: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: ''
        })
        setAddressDialogOpen(true)
    }

    const handleEditAddress = (address: PeopleAddress) => {
        setEditingAddress(address)
        setAddressForm({
            addressType: address.addressType,
            postalCode: address.postalCode,
            street: address.street,
            number: address.number,
            complement: address.complement || '',
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state
        })
        setAddressDialogOpen(true)
    }

    const handleDeleteAddress = async (address: PeopleAddress) => {
        if (!people) return
        try {
            await peopleService.removeAddress(people.id, address.id)
            await loadPeopleData(people.id)
        } catch (error) {
            console.error('Erro ao excluir endereço:', error)
        }
    }

    const handleSaveAddress = async () => {
        if (!people) return

        const requiredFields = []
        if (!addressForm.addressType) requiredFields.push('Tipo')
        if (!addressForm.postalCode) requiredFields.push('CEP')
        if (!addressForm.street) requiredFields.push('Rua')
        if (!addressForm.number) requiredFields.push('Número')
        if (!addressForm.neighborhood) requiredFields.push('Bairro')
        if (!addressForm.city) requiredFields.push('Cidade')
        if (!addressForm.state) requiredFields.push('Estado')

        if (requiredFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Preencha os campos obrigatórios: ${requiredFields.join(', ')}`,
                severity: 'warning'
            })
            return
        }

        const invalidFields = []
        if (addressForm.postalCode.replace(/\D/g, '').length !== 8) invalidFields.push('CEP')
        if (addressForm.state.length !== 2) invalidFields.push('Estado')

        if (invalidFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Dados inválidos nos campos: ${invalidFields.join(', ')}`,
                severity: 'warning'
            })
            return
        }

        try {
            setSavingAddress(true)
            if (editingAddress) {
                await peopleService.updateAddress(people.id, editingAddress.id, addressForm)
            } else {
                await peopleService.createAddress(people.id, addressForm)
            }
            await loadPeopleData(people.id)
            handleCloseAddressDialog()
        } catch (error) {
            console.error('Erro ao salvar endereço:', error)
        } finally {
            setSavingAddress(false)
        }
    }

    // Bank Account Handlers
    const handleCloseBankDialog = () => {
        setBankDialogOpen(false)
        setEditingAccount(null)
        setBankForm({
            bankCode: '',
            branchCode: '',
            accountNumber: '',
            accountType: 'Pagamento',
            pixKey: '',
            isDefaultReceipt: false
        })
    }

    const handleAddAccount = () => {
        setEditingAccount(null)
        setBankForm({
            bankCode: '',
            branchCode: '',
            accountNumber: '',
            accountType: 'Pagamento',
            pixKey: '',
            isDefaultReceipt: false
        })
        setBankDialogOpen(true)
    }

    const handleEditAccount = (acc: PeopleBankAccount) => {
        setEditingAccount(acc)
        setBankForm({
            bankCode: acc.bankCode,
            branchCode: acc.branchCode,
            accountNumber: acc.accountNumber,
            accountType: acc.accountType,
            pixKey: acc.pixKey || '',
            isDefaultReceipt: acc.isDefaultReceipt
        })
        setBankDialogOpen(true)
    }

    const handleDeleteAccount = async (acc: PeopleBankAccount) => {
        if (!people) return
        try {
            await peopleService.removeBankAccount(people.id, acc.id)
            await loadPeopleData(people.id)
        } catch (error) {
            console.error('Failed to delete bank account', error)
        }
    }

    const handleSaveAccount = async () => {
        if (!people) return

        const requiredFields = []
        if (!bankForm.accountType) requiredFields.push('Tipo de Conta')
        if (!bankForm.bankCode) requiredFields.push('Código do Banco')
        if (!bankForm.branchCode) requiredFields.push('Agência')
        if (!bankForm.accountNumber) requiredFields.push('Conta')

        if (requiredFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Preencha os campos obrigatórios: ${requiredFields.join(', ')}`,
                severity: 'warning'
            })
            return
        }

        try {
            setSavingAccount(true)
            const payload = {
                ...bankForm,
                isDefaultReceipt: bankForm.isDefaultReceipt
            }

            if (editingAccount) {
                await peopleService.updateBankAccount(people.id, editingAccount.id, payload)
            } else {
                await peopleService.createBankAccount(people.id, payload)
            }
            await loadPeopleData(people.id)
            handleCloseBankDialog()
        } catch (error) {
            console.error('Failed to save bank account', error)
        } finally {
            setSavingAccount(false)
        }
    }

    // Document Handlers
    const handleCloseDocumentDialog = () => {
        setDocumentDialogOpen(false)
        setEditingDocument(null)
        setDocumentForm({
            documentType: '',
            file: '',
            expirationDate: ''
        })
    }

    const handleAddDocument = () => {
        setEditingDocument(null)
        setDocumentForm({
            documentType: '',
            file: '',
            expirationDate: '',
            fileName: '',
            fileSize: 0
        })
        setDocumentDialogOpen(true)
    }

    const handleEditDocument = (doc: PeopleDocument) => {
        setEditingDocument(doc)
        setDocumentForm({
            documentType: doc.documentType,
            file: doc.file,
            expirationDate: doc.expirationDate || '',
            fileName: doc.fileName || doc.documentInternalData?.fileName || '', // Backward compatibility
            fileSize: doc.fileSize ?? doc.documentInternalData?.fileSize ?? 0
        })
        setDocumentDialogOpen(true)
    }

    const handleDeleteDocument = async (doc: PeopleDocument) => {
        if (!people) return
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            try {
                await peopleService.removeDocument(people.id, doc.id)
                await loadPeopleData(people.id)
            } catch (error) {
                console.error('Erro ao excluir documento:', error)
            }
        }
    }

    const handleSaveDocument = async () => {
        if (!people) return

        const requiredFields = []
        if (!documentForm.documentType) requiredFields.push('Tipo de Documento')
        if (!documentForm.file) requiredFields.push('Arquivo')

        if (requiredFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Preencha os campos obrigatórios: ${requiredFields.join(', ')}`,
                severity: 'warning'
            })
            return
        }

        try {
            setSavingDocument(true)
            const payload: CreateDocumentPayload = {
                documentType: documentForm.documentType,
                file: documentForm.file,
                expirationDate: documentForm.expirationDate || undefined,
                fileName: documentForm.fileName,
                fileSize: formatSize(documentForm.fileSize || 0) // Saving as formatted string per requirement
            }

            if (editingDocument) {
                await peopleService.updateDocument(people.id, editingDocument.id, payload)
            } else {
                await peopleService.createDocument(people.id, payload)
            }
            await loadPeopleData(people.id)
            handleCloseDocumentDialog()
        } catch (error) {
            console.error('Erro ao salvar documento:', error)
        } finally {
            setSavingDocument(false)
        }
    }

    if (!open) return null

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullScreen
                TransitionProps={{
                    onEntered: () => { },
                }}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.default',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DashboardTopBar title="Pessoa" onClose={onClose} />

                {loading ? (
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </DialogContent>
                ) : people ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', p: 3 }}>

                        {/* Header Area */}
                        <DashboardTopCard
                            title={`${people.name}`}
                            action={
                                permissions.includes('comercial:pessoas:editar') && (
                                    <Button
                                        variant="outlined"
                                        onClick={handleStartEdit}
                                        sx={{
                                            color: 'text.primary',
                                            borderColor: 'divider',
                                            minWidth: { xs: 40, md: 64 },
                                            p: { xs: 1, md: '5px 15px' }
                                        }}
                                    >
                                        <Edit sx={{ mr: { xs: 0, md: 1 } }} />
                                        <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                                            Editar
                                        </Box>
                                    </Button>
                                )
                            }
                        >
                            {people.cpfCnpj && (
                                <Typography variant="subtitle1" className="people-dashboard-subtitle">
                                    CPF/CNPJ: {people.cpfCnpj}
                                </Typography>
                            )}

                        </DashboardTopCard>

                        {/* Google Contacts Style Grid */}
                        {/* Main Grid: All items in one column flow or adjusted grid */}
                        {/* Main Grid: All items in one responsive grid */}
                        <Grid container spacing={3}>

                            {/* 1. Detalhes */}
                            {permissions.includes('comercial:pessoas:detalhes:visualizar') && (
                                <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 1 } }}>
                                    <DashboardBodyCard
                                        title="Detalhes"
                                        action={
                                            permissions.includes('comercial:pessoas:detalhes:editar') && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={handleEditDetails}
                                                    sx={{
                                                        color: '#2196f3', // Blue color
                                                        borderColor: '#2196f3', // Blue border
                                                        '&:hover': {
                                                            borderColor: '#1976d2',
                                                            backgroundColor: 'rgba(33, 150, 243, 0.04)',
                                                        },
                                                        minWidth: { xs: 36, md: 64 },
                                                        p: { xs: 0.5, md: '4px 10px' },
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    <Edit fontSize="small" sx={{ mr: { xs: 0, md: 1 } }} />
                                                    <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
                                                        Editar
                                                    </Box>
                                                </Button>
                                            )
                                        }
                                    >
                                        <Stack spacing={2}>
                                            {people.cpfCnpj?.replace(/\D/g, '').length === 11 ? (
                                                <>
                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="caption" className="people-dashboard-label">Nome</Typography>
                                                            <Typography variant="body1">{people.details?.firstName || '-'}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="caption" className="people-dashboard-label">Sobrenome</Typography>
                                                            <Typography variant="body1">{people.details?.surname || '-'}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                    <Box>
                                                        <Typography variant="caption" className="people-dashboard-label">Data de Nascimento</Typography>
                                                        <Typography variant="body1">
                                                            {people.details?.birthDate ? new Date(people.details.birthDate).toLocaleDateString() : '-'}
                                                        </Typography>
                                                    </Box>
                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="caption" className="people-dashboard-label">Sexo</Typography>
                                                            <Typography variant="body2">{people.details?.sex || '-'}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="caption" className="people-dashboard-label">Estado Civil</Typography>
                                                            <Typography variant="body2">
                                                                {people.details?.maritalStatus ? (MARITAL_STATUS_MAP[people.details.maritalStatus] || people.details.maritalStatus) : '-'}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="caption" className="people-dashboard-label">Nacionalidade</Typography>
                                                            <Typography variant="body2">{people.details?.nationality || '-'}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="caption" className="people-dashboard-label">Profissão</Typography>
                                                            <Typography variant="body2">{people.details?.occupation || '-'}</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </>
                                            ) : (
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12 }}>
                                                        <Typography variant="caption" className="people-dashboard-label">Razão Social</Typography>
                                                        <Typography variant="body1">{people.details?.legalName || '-'}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
                                                        <Typography variant="caption" className="people-dashboard-label">Nome Fantasia</Typography>
                                                        <Typography variant="body1">{people.details?.tradeName || '-'}</Typography>
                                                    </Grid>
                                                </Grid>
                                            )}
                                        </Stack>
                                    </DashboardBodyCard>
                                </Grid>
                            )}

                            {/* 2. Endereços (Desktop: 2, Mobile: 3) */}
                            {permissions.includes('comercial:pessoas:enderecos:listar') && (
                                <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 3, md: 2 } }}>
                                    <DashboardBodyCardList<PeopleAddress>
                                        title="Endereços"
                                        items={people.addresses || []}
                                        keyExtractor={(item) => item.id}
                                        renderIcon={() => <LocationOn />}
                                        renderText={(item) => (
                                            <>
                                                {item.street}, {item.number} {item.complement ? `- ${item.complement}` : ''}
                                            </>
                                        )}
                                        renderSecondaryText={(item) => (
                                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body2" component="span" color="inherit">
                                                    {item.neighborhood}, {item.city} - {item.state}
                                                </Typography>
                                                <Typography variant="caption" component="span" color="inherit">
                                                    {item.postalCode} • {item.addressType}
                                                </Typography>
                                            </Box>
                                        )}
                                        onAdd={permissions.includes('comercial:pessoas:enderecos:criar') ? handleAddAddress : undefined}
                                        addButtonLabel="Adicionar endereço"
                                        onEdit={permissions.includes('comercial:pessoas:enderecos:editar') || permissions.includes('comercial:pessoas:enderecos:visualizar') ? handleEditAddress : undefined}
                                        onDelete={permissions.includes('comercial:pessoas:enderecos:excluir') ? handleDeleteAddress : undefined}
                                        emptyText="Nenhum endereço registrado."
                                    />
                                </Grid>
                            )}

                            {/* 3. Contatos (Desktop: 3, Mobile: 2) */}
                            {permissions.includes('comercial:pessoas:contatos:listar') && (
                                <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 2, md: 3 } }}>
                                    <DashboardBodyCardList<PeopleContact>
                                        title="Contatos"
                                        items={people.contacts || []}
                                        keyExtractor={(item) => item.id}
                                        renderIcon={(item) => item.contactType === 'Email' ? <Email /> : <Phone />}
                                        renderText={(item) => {
                                            if (['Telefone', 'Whatsapp', 'Celular'].includes(item.contactType)) {
                                                const parsed = parsePhoneNumber(item.contactValue)
                                                return formatPhoneNumber(parsed.number, parsed.country)
                                            }
                                            return item.contactValue
                                        }}
                                        renderSecondaryText={(item) => `${item.contactType}${item.label ? ' • ' + item.label : ''}`}
                                        onAdd={permissions.includes('comercial:pessoas:contatos:criar') ? handleAddContact : undefined}
                                        addButtonLabel="Adicionar contato"
                                        onEdit={permissions.includes('comercial:pessoas:contatos:editar') || permissions.includes('comercial:pessoas:contatos:visualizar') ? handleEditContact : undefined}
                                        onDelete={permissions.includes('comercial:pessoas:contatos:excluir') ? handleDeleteContact : undefined}
                                        emptyText="Nenhum contato registrado."
                                    />
                                </Grid>
                            )}

                            {/* 4. Dados Bancários (Desktop: 4, Mobile: 4) */}
                            {permissions.includes('comercial:pessoas:dados-bancarios:listar') && (
                                <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 4, md: 4 } }}>
                                    <DashboardBodyCardList<PeopleBankAccount>
                                        title="Dados Bancários"
                                        items={people.bankAccounts || []}
                                        keyExtractor={(item) => item.id}
                                        renderIcon={() => <AccountBalance />}
                                        renderText={(item) => (
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {item.bankCode}
                                                </Typography>
                                                <BankNameDisplay code={item.bankCode} />
                                                {item.isDefaultReceipt && <Chip label="Principal" size="small" color="success" sx={{ height: 20, fontSize: '0.625rem' }} />}
                                            </Stack>
                                        )}
                                        renderSecondaryText={(item) => (
                                            <Box>
                                                <Typography variant="body2" className="people-dashboard-text-primary">
                                                    {item.accountType} • Ag: {item.branchCode} • CC: {item.accountNumber}
                                                </Typography>
                                                {item.pixKey && (
                                                    <Typography variant="caption" className="people-dashboard-text-secondary" display="block">
                                                        PIX: {item.pixKey}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                        onAdd={permissions.includes('comercial:pessoas:dados-bancarios:criar') ? handleAddAccount : undefined}
                                        onEdit={permissions.includes('comercial:pessoas:dados-bancarios:editar') || permissions.includes('comercial:pessoas:dados-bancarios:visualizar') ? (item) => handleEditAccount(item as PeopleBankAccount) : undefined}
                                        onDelete={permissions.includes('comercial:pessoas:dados-bancarios:excluir') ? (item) => handleDeleteAccount(item as PeopleBankAccount) : undefined}
                                        emptyText="Nenhuma conta bancária registrada."
                                    />
                                </Grid>
                            )}

                            {/* 5. Documentos (Desktop: 5, Mobile: 5) */}
                            {permissions.includes('comercial:pessoas:documentos:listar') && (
                                <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 5, md: 5 } }}>
                                    <DashboardBodyCardList<PeopleDocument>
                                        title="Documentos"
                                        items={people.documents || []}
                                        keyExtractor={(item) => item.id}
                                        renderIcon={() => <Description />}
                                        renderText={(item) => item.documentType}
                                        renderSecondaryText={(item) => (
                                            <React.Fragment>
                                                <Typography component="span" variant="caption" display="block" className="people-dashboard-text-secondary">
                                                    Enviado: {new Date(item.createdAt).toLocaleDateString()}
                                                </Typography>
                                                <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                                                    {item.verificationStatus === 'verified' && <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircle fontSize="inherit" /> Verificado</Typography>}
                                                    {item.verificationStatus === 'rejected' && <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Error fontSize="inherit" /> Rejeitado</Typography>}
                                                    {item.verificationStatus === 'pending' && <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Warning fontSize="inherit" /> Pendente</Typography>}
                                                </Stack>
                                            </React.Fragment>
                                        )}
                                        onAdd={permissions.includes('comercial:pessoas:documentos:criar') ? handleAddDocument : undefined}
                                        onEdit={permissions.includes('comercial:pessoas:documentos:editar') || permissions.includes('comercial:pessoas:documentos:visualizar') ? (item) => handleEditDocument(item as PeopleDocument) : undefined}
                                        onDelete={permissions.includes('comercial:pessoas:documentos:excluir') ? (item) => handleDeleteDocument(item as PeopleDocument) : undefined}
                                        emptyText="Nenhum documento registrado."
                                    />
                                </Grid>
                            )}

                            {/* 6. System Info (Desktop: 6, Mobile: 6) */}
                            {permissions.includes('comercial:pessoas:auditoria') && (
                                <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 6, md: 6 } }}>
                                    <DashboardBodyCard title="Informações do Sistema">
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="subtitle2" className="people-dashboard-label">ID do Sistema</Typography>
                                                <Typography variant="body2" className="people-dashboard-value" sx={{ fontFamily: 'monospace' }}>{people.id}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="subtitle2" className="people-dashboard-label">Criado por</Typography>
                                                <Typography variant="body2" className="people-dashboard-value">{people.createdBy} em {new Date(people.createdAt).toLocaleString()}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="subtitle2" className="people-dashboard-label">Atualizado por</Typography>
                                                <Typography variant="body2" className="people-dashboard-value">{people.updatedBy} em {new Date(people.updatedAt).toLocaleString()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </DashboardBodyCard>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                ) : null}
            </Dialog>

            {/* Reusing PeopleFormDialog for editing */}
            <PeopleFormDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={(data) => {
                    // Adapt the data structure if needed, but handleSaveEdit used editForm state.
                    // We need to update editForm with data from onSave, or better, refactor handleSaveEdit to accept data.
                    // But for now, let's update state and call save.
                    setEditForm(prev => ({ ...prev, ...data }))
                    // We need to trigger save, but handleSaveEdit uses editForm state which is async.
                    // Better to pass data directly to a new save function or updated handleSaveEdit.
                    // Let's refactor handleSaveEdit to accept data optionally.
                    handleSaveEdit(data)
                }}
                initialValues={editForm}
                title="Editar Pessoa"
                saving={saving}
            />

            <Dialog open={contactDialogOpen} onClose={handleCloseContactDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingContact ? 'Editar Contato' : 'Adicionar Contato'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Tipo"
                                value={contactForm.contactType}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactForm(prev => ({
                                    ...prev,
                                    contactType: e.target.value,
                                    contactValue: '' // Clear value on type change
                                }))}
                                fullWidth
                                select
                                required
                                disabled={!permissions.includes('comercial:pessoas:contatos:editar')}
                            >
                                <MenuItem value="Telefone">Telefone</MenuItem>
                                <MenuItem value="Email">Email</MenuItem>
                                <MenuItem value="Whatsapp">Whatsapp</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            {contactForm.contactType === 'Email' ? (
                                <MailPicker
                                    label="Email"
                                    value={contactForm.contactValue}
                                    onChange={(val) => setContactForm(prev => ({ ...prev, contactValue: val }))}
                                    fullWidth
                                    required
                                    disabled={!permissions.includes('comercial:pessoas:contatos:editar')}
                                />
                            ) : ['Telefone', 'Whatsapp'].includes(contactForm.contactType) ? (
                                <PhonePicker
                                    label={contactForm.contactType}
                                    value={contactForm.contactValue}
                                    onChange={(val) => setContactForm(prev => ({ ...prev, contactValue: val }))}
                                    fullWidth
                                    required
                                    disabled={!permissions.includes('comercial:pessoas:contatos:editar')}
                                />
                            ) : (
                                <TextPicker
                                    label={contactForm.contactType}
                                    value={contactForm.contactValue}
                                    onChange={(val) => setContactForm(prev => ({ ...prev, contactValue: val }))}
                                    fullWidth
                                    required
                                    placeholder={'(00) 00000-0000'}
                                    disabled={!permissions.includes('comercial:pessoas:contatos:editar')}
                                />
                            )}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Marcador"
                                value={contactForm.label}
                                onChange={(val) => setContactForm(prev => ({ ...prev, label: val }))}
                                fullWidth
                                placeholder="Ex: Casa, Trabalho, Comercial"
                                disabled={!permissions.includes('comercial:pessoas:contatos:editar')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseContactDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveContact} variant="contained" disabled={savingContact || !permissions.includes('comercial:pessoas:contatos:editar')}>
                        {savingContact ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={addressDialogOpen} onClose={handleCloseAddressDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingAddress ? 'Editar Endereço' : 'Adicionar Endereço'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Tipo"
                                value={addressForm.addressType}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressForm(prev => ({ ...prev, addressType: e.target.value }))}
                                fullWidth
                                select
                                required
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            >
                                <MenuItem value="Residencial">Residencial</MenuItem>
                                <MenuItem value="Comercial">Comercial</MenuItem>
                                <MenuItem value="Outros">Outros</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <CEPPicker
                                label="CEP"
                                value={addressForm.postalCode}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, postalCode: val }))}
                                onAddressFetched={(data) => {
                                    setAddressForm(prev => ({
                                        ...prev,
                                        street: data.street,
                                        neighborhood: data.neighborhood,
                                        city: data.city,
                                        state: data.state,
                                        complement: '',
                                        number: ''
                                    }))
                                }}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextPicker
                                label="Estado (UF)"
                                value={addressForm.state}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, state: val }))}
                                fullWidth
                                required
                                maxLength={2}
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 9 }}>
                            <TextPicker
                                label="Rua"
                                value={addressForm.street}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, street: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextPicker
                                label="Número"
                                value={addressForm.number}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, number: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextPicker
                                label="Bairro"
                                value={addressForm.neighborhood}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, neighborhood: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextPicker
                                label="Cidade"
                                value={addressForm.city}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, city: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Complemento"
                                value={addressForm.complement}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, complement: val }))}
                                fullWidth
                                disabled={!permissions.includes('comercial:pessoas:enderecos:editar')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddressDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveAddress} variant="contained" disabled={savingAddress || !permissions.includes('comercial:pessoas:enderecos:editar')}>
                        {savingAddress ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={bankDialogOpen} onClose={handleCloseBankDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingAccount ? 'Editar Conta Bancária' : 'Adicionar Conta Bancária'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Tipo de Conta"
                                value={bankForm.accountType}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankForm(prev => ({ ...prev, accountType: e.target.value }))}
                                fullWidth
                                select
                                required
                                disabled={!permissions.includes('comercial:pessoas:dados-bancarios:editar')}
                            >
                                <MenuItem value="Pagamento">Pagamento</MenuItem>
                                <MenuItem value="Poupança">Poupança</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <BankCodePicker
                                label="Código do Banco"
                                value={bankForm.bankCode}
                                onChange={(val) => setBankForm(prev => ({ ...prev, bankCode: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextPicker
                                label="Agência"
                                value={bankForm.branchCode}
                                onChange={(val) => setBankForm(prev => ({ ...prev, branchCode: val.replace(/\D/g, '') }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextPicker
                                label="Conta"
                                value={bankForm.accountNumber}
                                onChange={(val) => setBankForm(prev => ({ ...prev, accountNumber: val.replace(/\D/g, '') }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:pessoas:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Chave PIX"
                                value={bankForm.pixKey}
                                onChange={(val) => setBankForm(prev => ({ ...prev, pixKey: val }))}
                                fullWidth
                                placeholder="CPF, Email, Telefone, Chave Aleatória"
                                disabled={!permissions.includes('comercial:pessoas:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={bankForm.isDefaultReceipt}
                                        onChange={(e) => setBankForm(prev => ({ ...prev, isDefaultReceipt: e.target.checked }))}
                                        disabled={!permissions.includes('comercial:pessoas:dados-bancarios:editar')}
                                    />
                                }
                                label="Marcar como Conta Principal para Recebimento"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBankDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveAccount} variant="contained" disabled={savingAccount || !permissions.includes('comercial:pessoas:dados-bancarios:editar')}>
                        {savingAccount ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={documentDialogOpen} onClose={handleCloseDocumentDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDocument ? 'Editar Documento' : 'Adicionar Documento'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Tipo de Documento"
                                value={documentForm.documentType}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumentForm(prev => ({ ...prev, documentType: e.target.value }))}
                                fullWidth
                                select
                                required
                                disabled={!permissions.includes('comercial:pessoas:documentos:editar')}
                            >
                                <MenuItem value="RG - Digital">RG - Digital</MenuItem>
                                <MenuItem value="RG - Frente">RG - Frente</MenuItem>
                                <MenuItem value="RG - Verso">RG - Verso</MenuItem>
                                <MenuItem value="CNH - Digital">CNH - Digital</MenuItem>
                                <MenuItem value="CNH - Impressa">CNH - Impressa</MenuItem>
                                <MenuItem value="CPF - Digital">CPF - Digital</MenuItem>
                                <MenuItem value="CPF - Impresso">CPF - Impresso</MenuItem>
                                <MenuItem value="Selfie com Doc">Selfie com Doc</MenuItem>
                                <MenuItem value="Comprovante de Residência">Comprovante de Residência</MenuItem>
                                <MenuItem value="Contrato Social">Contrato Social</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FileUpload
                                label="Arquivo do Documento"
                                value={documentForm.file}
                                fileName={documentForm.fileName}
                                fileSize={documentForm.fileSize}
                                onChange={(val, meta) => setDocumentForm(prev => ({
                                    ...prev,
                                    file: val,
                                    fileName: meta ? meta.name : prev.fileName,
                                    fileSize: meta ? meta.size : prev.fileSize
                                }))}
                                onFileNameChange={(newName) => setDocumentForm(prev => ({
                                    ...prev,
                                    fileName: newName
                                }))}
                                fullWidth
                                required
                                showPreview={permissions.includes('comercial:pessoas:documentos:preview')}
                                showDownload={permissions.includes('comercial:pessoas:documentos:download')}
                                disabled={!permissions.includes('comercial:pessoas:documentos:editar')}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDocumentDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveDocument} variant="contained" disabled={savingDocument || !permissions.includes('comercial:pessoas:documentos:editar')}>
                        {savingDocument ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Detalhes</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {people?.cpfCnpj?.replace(/\D/g, '').length === 11 ? (
                            <>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextPicker
                                        label="Nome"
                                        value={detailsForm.firstName}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, firstName: val }))}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextPicker
                                        label="Sobrenome"
                                        value={detailsForm.surname}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, surname: val }))}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <DatePicker
                                        label="Data de Nascimento"
                                        value={detailsForm.birthDate ?? ''}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, birthDate: val }))}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <SelectPicker
                                        label="Sexo"
                                        value={detailsForm.sex}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, sex: val as string }))}
                                        options={[
                                            { value: 'Homem', label: 'Homem' },
                                            { value: 'Mulher', label: 'Mulher' }
                                        ]}
                                        fullWidth
                                        placeholder="Selecione"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <SelectPicker
                                        label="Estado Civil"
                                        value={detailsForm.maritalStatus}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, maritalStatus: val as string }))}
                                        options={Object.entries(MARITAL_STATUS_MAP).map(([value, label]) => ({
                                            value,
                                            label
                                        }))}
                                        fullWidth
                                        placeholder="Selecione"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextPicker
                                        label="Nacionalidade"
                                        value={detailsForm.nationality}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, nationality: val }))}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextPicker
                                        label="Profissão"
                                        value={detailsForm.occupation}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, occupation: val }))}
                                        fullWidth
                                    />
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid size={{ xs: 12 }}>
                                    <TextPicker
                                        label="Razão Social"
                                        value={detailsForm.legalName}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, legalName: val }))}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextPicker
                                        label="Nome Fantasia"
                                        value={detailsForm.tradeName}
                                        onChange={(val) => setDetailsForm(prev => ({ ...prev, tradeName: val }))}
                                        fullWidth
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialogOpen(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveDetails} variant="contained" disabled={savingDetails}>
                        {savingDetails ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}

const BankNameDisplay = ({ code }: { code: string }) => {
    const [name, setName] = useState('')

    useEffect(() => {
        getBankName(code).then(setName)
    }, [code])

    if (!name) return null

    return (
        <Typography variant="subtitle2" sx={{ fontWeight: 'normal' }}>
            - {name}
        </Typography>
    )
}

export default PeopleDashboard
