
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import TextPicker from '../../components/TextPicker'
import CPFCNPJPicker from '../../components/CPFCNPJPicker'
import DatePicker from '../../components/DatePicker'
import CEPPicker from '../../components/CEPPicker'
import BankCodePicker from '../../components/BankCodePicker'
import FileUpload from '../../components/FileUpload'
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
    customerService,
    type CustomerDTO,
    type CustomerContact,
    type CustomerAddress,
    type CustomerBankAccount,
    type CustomerDocument,
    type CreateDocumentPayload
} from '../../services/customers'
import { getBankName } from '../../services/bankService'
import { DashboardTopBar } from '../../components/Dashboard/DashboardTopBar'
import { DashboardTopCard } from '../../components/Dashboard/DashboardTopCard'
import { DashboardBodyCard } from '../../components/Dashboard/DashboardBodyCard'
import React from 'react'
import { MenuItem } from '@mui/material'

type CustomerDashboardProps = {
    customerId: string | null
    open: boolean
    onClose: () => void
    onUpdate?: () => void
}

const CustomerDashboard = ({ customerId, open, onClose, onUpdate }: CustomerDashboardProps) => {
    const [customer, setCustomer] = useState<CustomerDTO | null>(null)
    const [loading, setLoading] = useState(false)
    const { permissions, user } = useAuth()

    // Edit Customer State
    const [editOpen, setEditOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        lastName: '',
        cpfCnpj: '',
        birthDate: null as string | null
    })

    // Contact Management State
    const [contactDialogOpen, setContactDialogOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<CustomerContact | null>(null)
    const [contactForm, setContactForm] = useState({
        contactType: 'Telefone',
        contactValue: '',
        label: ''
    })
    const [savingContact, setSavingContact] = useState(false)

    // Address Management State
    const [addressDialogOpen, setAddressDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
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
    const [editingAccount, setEditingAccount] = useState<CustomerBankAccount | null>(null)
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
    const [editingDocument, setEditingDocument] = useState<CustomerDocument | null>(null)
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

    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (customerId && open) {
            loadCustomerData(customerId)
        } else {
            setCustomer(null)
        }
    }, [customerId, open])

    const loadCustomerData = async (id: string) => {
        try {
            setLoading(true)
            const data = await customerService.getById(id)
            setCustomer(data)
        } catch (error) {
            console.error('Erro ao carregar dados do cliente:', error)
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
        if (!customer) return
        setEditForm({
            name: customer.name,
            lastName: customer.lastName,
            cpfCnpj: customer.cpfCnpj,
            birthDate: customer.birthDate || null
        })
        setEditOpen(true)
    }

    const handleSaveEdit = async () => {
        if (!customer) return
        try {
            setSaving(true)
            await customerService.update(customer.id, {
                ...customer,
                name: editForm.name,
                lastName: editForm.lastName,
                cpfCnpj: editForm.cpfCnpj,
                birthDate: editForm.birthDate,
                updatedBy: user?.login || 'system'
            })
            await loadCustomerData(customer.id)
            if (onUpdate) {
                onUpdate()
            }
            setEditOpen(false)
        } catch (error) {
            console.error('Erro ao salvar edição:', error)
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

    const handleEditContact = (contact: CustomerContact) => {
        setEditingContact(contact)
        setContactForm({
            contactType: contact.contactType,
            contactValue: contact.contactValue,
            label: contact.label || ''
        })
        setContactDialogOpen(true)
    }

    const handleDeleteContact = async (contact: CustomerContact) => {
        if (!customer) return
        try {
            await customerService.removeContact(customer.id, contact.id)
            await loadCustomerData(customer.id)
        } catch (error) {
            console.error('Erro ao excluir contato:', error)
        }
    }

    const handleSaveContact = async () => {
        if (!customer) return
        try {
            setSavingContact(true)
            if (editingContact) {
                await customerService.updateContact(customer.id, editingContact.id, contactForm)
            } else {
                await customerService.createContact(customer.id, contactForm)
            }
            await loadCustomerData(customer.id)
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

    const handleEditAddress = (address: CustomerAddress) => {
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

    const handleDeleteAddress = async (address: CustomerAddress) => {
        if (!customer) return
        try {
            await customerService.removeAddress(customer.id, address.id)
            await loadCustomerData(customer.id)
        } catch (error) {
            console.error('Erro ao excluir endereço:', error)
        }
    }

    const handleSaveAddress = async () => {
        if (!customer) return
        try {
            setSavingAddress(true)
            if (editingAddress) {
                await customerService.updateAddress(customer.id, editingAddress.id, addressForm)
            } else {
                await customerService.createAddress(customer.id, addressForm)
            }
            await loadCustomerData(customer.id)
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

    const handleEditAccount = (acc: CustomerBankAccount) => {
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

    const handleDeleteAccount = async (acc: CustomerBankAccount) => {
        if (!customer) return
        try {
            await customerService.removeBankAccount(customer.id, acc.id)
            await loadCustomerData(customer.id)
        } catch (error) {
            console.error('Failed to delete bank account', error)
        }
    }

    const handleSaveAccount = async () => {
        if (!customer) return
        try {
            setSavingAccount(true)
            const payload = {
                ...bankForm,
                isDefaultReceipt: bankForm.isDefaultReceipt
            }

            if (editingAccount) {
                await customerService.updateBankAccount(customer.id, editingAccount.id, payload)
            } else {
                await customerService.createBankAccount(customer.id, payload)
            }
            await loadCustomerData(customer.id)
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

    const handleEditDocument = (doc: CustomerDocument) => {
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

    const handleDeleteDocument = async (doc: CustomerDocument) => {
        if (!customer) return
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            try {
                await customerService.removeDocument(customer.id, doc.id)
                await loadCustomerData(customer.id)
            } catch (error) {
                console.error('Erro ao excluir documento:', error)
            }
        }
    }

    const handleSaveDocument = async () => {
        if (!customer) return
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
                await customerService.updateDocument(customer.id, editingDocument.id, payload)
            } else {
                await customerService.createDocument(customer.id, payload)
            }
            await loadCustomerData(customer.id)
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
                <DashboardTopBar title="Cliente" onClose={onClose} />

                {loading ? (
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </DialogContent>
                ) : customer ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', p: 3 }}>

                        {/* Header Area */}
                        <DashboardTopCard
                            title={`${customer.name} ${customer.lastName}`}
                            action={
                                permissions.includes('comercial:clientes:editar') && (
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
                            {customer.cpfCnpj && (
                                <Typography variant="subtitle1" className="customer-dashboard-subtitle">
                                    CPF/CNPJ: {customer.cpfCnpj}
                                </Typography>
                            )}
                            {customer.birthDate && (
                                <Typography variant="body1" className="customer-dashboard-subtitle" sx={{ mt: 0.5 }}>
                                    Nascimento: {new Date(customer.birthDate).toLocaleDateString()}
                                </Typography>
                            )}
                        </DashboardTopCard>

                        {/* Google Contacts Style Grid */}
                        <Grid container spacing={3}>

                            {/* Left Column: Contacts & Addresses */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={3}>
                                    {/* Contacts Card */}
                                    {permissions.includes('comercial:clientes:contatos:listar') && (
                                        <DashboardBodyCardList<CustomerContact>
                                            title="Contatos"
                                            items={customer.contacts || []}
                                            keyExtractor={(item) => item.id}
                                            renderIcon={(item) => item.contactType === 'Email' ? <Email /> : <Phone />}
                                            renderText={(item) => item.contactValue}
                                            renderSecondaryText={(item) => `${item.contactType}${item.label ? ' • ' + item.label : ''}`}
                                            onAdd={permissions.includes('comercial:clientes:contatos:criar') ? handleAddContact : undefined}
                                            addButtonLabel="Adicionar contato"
                                            onEdit={permissions.includes('comercial:clientes:contatos:editar') || permissions.includes('comercial:clientes:contatos:visualizar') ? handleEditContact : undefined}
                                            onDelete={permissions.includes('comercial:clientes:contatos:excluir') ? handleDeleteContact : undefined}
                                            emptyText="Nenhum contato registrado."
                                        />
                                    )}

                                    {/* Addresses Card */}
                                    {permissions.includes('comercial:clientes:enderecos:listar') && (
                                        <DashboardBodyCardList<CustomerAddress>
                                            title="Endereços"
                                            items={customer.addresses || []}
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
                                            onAdd={permissions.includes('comercial:clientes:enderecos:criar') ? handleAddAddress : undefined}
                                            addButtonLabel="Adicionar endereço"
                                            onEdit={permissions.includes('comercial:clientes:enderecos:editar') || permissions.includes('comercial:clientes:enderecos:visualizar') ? handleEditAddress : undefined}
                                            onDelete={permissions.includes('comercial:clientes:enderecos:excluir') ? handleDeleteAddress : undefined}
                                            emptyText="Nenhum endereço registrado."
                                        />
                                    )}
                                </Stack>
                            </Grid>

                            {/* Middle/Right Column: Bank Accounts, Documents, System Info */}
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Grid container spacing={3}>
                                    {/* Bank Accounts */}
                                    {permissions.includes('comercial:clientes:dados-bancarios:listar') && (
                                        <Grid size={{ xs: 12, lg: 6 }}>
                                            <DashboardBodyCardList<CustomerBankAccount>
                                                title="Dados Bancários"
                                                items={customer.bankAccounts || []}
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
                                                        <Typography variant="body2" className="customer-dashboard-text-primary">
                                                            {item.accountType} • Ag: {item.branchCode} • CC: {item.accountNumber}
                                                        </Typography>
                                                        {item.pixKey && (
                                                            <Typography variant="caption" className="customer-dashboard-text-secondary" display="block">
                                                                PIX: {item.pixKey}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                                onAdd={permissions.includes('comercial:clientes:dados-bancarios:criar') ? handleAddAccount : undefined}
                                                onEdit={permissions.includes('comercial:clientes:dados-bancarios:editar') || permissions.includes('comercial:clientes:dados-bancarios:visualizar') ? (item) => handleEditAccount(item as CustomerBankAccount) : undefined}
                                                onDelete={permissions.includes('comercial:clientes:dados-bancarios:excluir') ? (item) => handleDeleteAccount(item as CustomerBankAccount) : undefined}
                                                emptyText="Nenhuma conta bancária registrada."
                                            />
                                        </Grid>
                                    )}

                                    {/* Documents */}
                                    {permissions.includes('comercial:clientes:documentos:listar') && (
                                        <Grid size={{ xs: 12, lg: 6 }}>
                                            <DashboardBodyCardList<CustomerDocument>
                                                title="Documentos"
                                                items={customer.documents || []}
                                                keyExtractor={(item) => item.id}
                                                renderIcon={() => <Description />}
                                                renderText={(item) => item.documentType}
                                                renderSecondaryText={(item) => (
                                                    <React.Fragment>
                                                        <Typography component="span" variant="caption" display="block" className="customer-dashboard-text-secondary">
                                                            Enviado: {new Date(item.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                                                            {item.verificationStatus === 'verified' && <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircle fontSize="inherit" /> Verificado</Typography>}
                                                            {item.verificationStatus === 'rejected' && <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Error fontSize="inherit" /> Rejeitado</Typography>}
                                                            {item.verificationStatus === 'pending' && <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Warning fontSize="inherit" /> Pendente</Typography>}
                                                        </Stack>
                                                    </React.Fragment>
                                                )}
                                                onAdd={permissions.includes('comercial:clientes:documentos:criar') ? handleAddDocument : undefined}
                                                onEdit={permissions.includes('comercial:clientes:documentos:editar') || permissions.includes('comercial:clientes:documentos:visualizar') ? (item) => handleEditDocument(item as CustomerDocument) : undefined}
                                                onDelete={permissions.includes('comercial:clientes:documentos:excluir') ? (item) => handleDeleteDocument(item as CustomerDocument) : undefined}
                                                emptyText="Nenhum documento registrado."
                                            />
                                        </Grid>
                                    )}

                                    {/* System Info */}
                                    {permissions.includes('comercial:clientes:auditoria') && (
                                        <Grid size={{ xs: 12 }}>
                                            <DashboardBodyCard title="Informações do Sistema">
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="subtitle2" className="customer-dashboard-label">ID do Sistema</Typography>
                                                        <Typography variant="body2" className="customer-dashboard-value" sx={{ fontFamily: 'monospace' }}>{customer.id}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="subtitle2" className="customer-dashboard-label">Criado por</Typography>
                                                        <Typography variant="body2" className="customer-dashboard-value">{customer.createdBy} em {new Date(customer.createdAt).toLocaleString()}</Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6 }}>
                                                        <Typography variant="subtitle2" className="customer-dashboard-label">Atualizado por</Typography>
                                                        <Typography variant="body2" className="customer-dashboard-value">{customer.updatedBy} em {new Date(customer.updatedAt).toLocaleString()}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </DashboardBodyCard>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                ) : null}
            </Dialog>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <CPFCNPJPicker
                                label="CPF/CNPJ"
                                value={editForm.cpfCnpj}
                                onChange={(val) => setEditForm(prev => ({ ...prev, cpfCnpj: val }))}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Nome"
                                value={editForm.name}
                                onChange={(val) => setEditForm(prev => ({ ...prev, name: val }))}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Sobrenome"
                                value={editForm.lastName}
                                onChange={(val) => setEditForm(prev => ({ ...prev, lastName: val }))}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <DatePicker
                                label="Data de Nascimento"
                                value={editForm.birthDate ?? ''}
                                onChange={(val) => setEditForm(prev => ({ ...prev, birthDate: val }))}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={contactDialogOpen} onClose={handleCloseContactDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingContact ? 'Editar Contato' : 'Adicionar Contato'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Tipo"
                                value={contactForm.contactType}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactForm(prev => ({ ...prev, contactType: e.target.value }))}
                                fullWidth
                                select
                                required
                                disabled={!permissions.includes('comercial:clientes:contatos:editar')}
                            >
                                <MenuItem value="Telefone">Telefone</MenuItem>
                                <MenuItem value="Email">Email</MenuItem>
                                <MenuItem value="Whatsapp">Whatsapp</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextPicker
                                label={contactForm.contactType}
                                value={contactForm.contactValue}
                                onChange={(val) => setContactForm(prev => ({ ...prev, contactValue: val }))}
                                fullWidth
                                required
                                placeholder={contactForm.contactType === 'Email' ? 'exemplo@email.com' : '(00) 00000-0000'}
                                disabled={!permissions.includes('comercial:clientes:contatos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Marcador"
                                value={contactForm.label}
                                onChange={(val) => setContactForm(prev => ({ ...prev, label: val }))}
                                fullWidth
                                placeholder="Ex: Casa, Trabalho, Comercial"
                                disabled={!permissions.includes('comercial:clientes:contatos:editar')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseContactDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveContact} variant="contained" disabled={savingContact || !permissions.includes('comercial:clientes:contatos:editar')}>
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
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
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
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
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
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 9 }}>
                            <TextPicker
                                label="Rua"
                                value={addressForm.street}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, street: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextPicker
                                label="Número"
                                value={addressForm.number}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, number: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextPicker
                                label="Bairro"
                                value={addressForm.neighborhood}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, neighborhood: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextPicker
                                label="Cidade"
                                value={addressForm.city}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, city: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Complemento"
                                value={addressForm.complement}
                                onChange={(val) => setAddressForm(prev => ({ ...prev, complement: val }))}
                                fullWidth
                                disabled={!permissions.includes('comercial:clientes:enderecos:editar')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddressDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveAddress} variant="contained" disabled={savingAddress || !permissions.includes('comercial:clientes:enderecos:editar')}>
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
                                disabled={!permissions.includes('comercial:clientes:dados-bancarios:editar')}
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
                                disabled={!permissions.includes('comercial:clientes:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextPicker
                                label="Agência"
                                value={bankForm.branchCode}
                                onChange={(val) => setBankForm(prev => ({ ...prev, branchCode: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:clientes:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextPicker
                                label="Conta"
                                value={bankForm.accountNumber}
                                onChange={(val) => setBankForm(prev => ({ ...prev, accountNumber: val }))}
                                fullWidth
                                required
                                disabled={!permissions.includes('comercial:clientes:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextPicker
                                label="Chave PIX"
                                value={bankForm.pixKey}
                                onChange={(val) => setBankForm(prev => ({ ...prev, pixKey: val }))}
                                fullWidth
                                placeholder="CPF, Email, Telefone, Chave Aleatória"
                                disabled={!permissions.includes('comercial:clientes:dados-bancarios:editar')}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={bankForm.isDefaultReceipt}
                                        onChange={(e) => setBankForm(prev => ({ ...prev, isDefaultReceipt: e.target.checked }))}
                                        disabled={!permissions.includes('comercial:clientes:dados-bancarios:editar')}
                                    />
                                }
                                label="Conta Principal para Recebimento"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBankDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveAccount} variant="contained" disabled={savingAccount || !permissions.includes('comercial:clientes:dados-bancarios:editar')}>
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
                                disabled={!permissions.includes('comercial:clientes:documentos:editar')}
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
                                showPreview={permissions.includes('comercial:clientes:documentos:preview')}
                                showDownload={permissions.includes('comercial:clientes:documentos:download')}
                                disabled={!permissions.includes('comercial:clientes:documentos:editar')}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDocumentDialog} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleSaveDocument} variant="contained" disabled={savingDocument || !permissions.includes('comercial:clientes:documentos:editar')}>
                        {savingDocument ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
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

export default CustomerDashboard
