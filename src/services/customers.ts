
import { api } from './api'

const API_CLIENTES_URL = import.meta.env.VITE_API_CLIENTES_BASE_URL ?? 'http://localhost:3335/api'

export type CustomerAddress = {
    id: string
    addressType: string
    postalCode: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    createdAt: string
    updatedAt: string
}

export type CustomerContact = {
    id: string
    contactType: string
    contactValue: string
    label?: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export type CustomerBankAccount = {
    id: string
    bankCode: string
    branchCode: string
    accountNumber: string
    accountType: string
    pixKey?: string
    isDefaultReceipt: boolean
    createdAt: string
    updatedAt: string
}

export type CustomerDocument = {
    id: string
    documentType: string
    file: string
    verificationStatus: string
    rejectionReason?: string
    expirationDate?: string
    documentInternalData?: any
    fileName?: string
    fileSize?: string
    createdAt: string
    updatedAt: string
}

export type CustomerDTO = {
    id: string
    seqId?: number
    name: string
    lastName: string
    cpfCnpj: string
    birthDate?: string | null
    createdAt: string
    createdBy: string
    updatedAt: string
    updatedBy: string
    addresses?: CustomerAddress[]
    contacts?: CustomerContact[]
    bankAccounts?: CustomerBankAccount[]
    documents?: CustomerDocument[]
    details?: CustomerDetail | null
}

export type CreateCustomerPayload = {
    name: string
    lastName: string
    cpfCnpj: string
    birthDate?: string | null
    createdBy: string
}

export type UpdateCustomerPayload = {
    name?: string
    lastName?: string
    cpfCnpj?: string
    birthDate?: string | null
    updatedBy: string
}

// Adapters
const adaptAddress = (data: any): CustomerAddress => ({
    id: data.id,
    addressType: data.address_type,
    postalCode: data.postal_code,
    street: data.street,
    number: data.number,
    complement: data.complement,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const adaptContact = (data: any): CustomerContact => ({
    id: data.id,
    contactType: data.contact_type,
    contactValue: data.contact_value,
    label: data.label,
    isDefault: data.is_default,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const adaptBankAccount = (data: any): CustomerBankAccount => ({
    id: data.id,
    bankCode: data.bank_code,
    branchCode: data.branch_code,
    accountNumber: data.account_number,
    accountType: data.account_type,
    pixKey: data.pix_key,
    isDefaultReceipt: data.is_default_receipt,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const adaptDocument = (data: any): CustomerDocument => ({
    id: data.id,
    documentType: data.document_type,
    file: data.file,
    verificationStatus: data.verification_status,
    rejectionReason: data.rejection_reason,
    expirationDate: data.expiration_date,
    documentInternalData: data.document_internal_data,
    fileName: data.file_name,
    fileSize: data.file_size,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const adaptCustomer = (data: any): CustomerDTO => {
    return {
        id: data.id,
        seqId: data.seq_id,
        name: data.name,
        lastName: data.last_name,
        cpfCnpj: data.cpf_cnpj,
        birthDate: data.birth_date,
        createdAt: data.created_at,
        createdBy: data.created_by,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
        addresses: data.addresses?.map(adaptAddress),
        contacts: data.contacts?.map(adaptContact),
        bankAccounts: data.bankAccounts?.map(adaptBankAccount), // API returns 'bankAccounts' in repo findById? No, usually snake_case in raw query but check repo again.
        // Wait, PostgresCustomerRepository findById returns:
        // { ...customer, addresses: ..., contacts: ..., bankAccounts: ..., documents: ... }
        // The keys in the return object of findById are camelCase because the Repository manually constructs the object:
        // return { ...customer, addresses: ..., bankAccounts: ... }
        // However, the "customer" part comes from `customerRes.rows[0]` which is snake_case (Postgres default).
        // The arrays come from `addressesRes.rows` which are also array of objects with snake_case keys (DB columns).
        // So `data.addresses` will be an array of snake_case objects.
        // AND the key `addresses` is camelCase because the repository explicitly set it so.
        // So `data.addresses` is correct. `data.bankAccounts` is correct.
        documents: data.documents?.map(adaptDocument),
        details: data.details ? adaptDetail(data.details) : null,
    }
}

const list = async () => {
    const response = await api.get<any[]>('/clientes', { baseUrl: API_CLIENTES_URL })
    return response.map(adaptCustomer)
}

const create = async (payload: CreateCustomerPayload) => {
    const response = await api.post<any>('/clientes', payload, { baseUrl: API_CLIENTES_URL })
    return adaptCustomer(response)
}

const update = async (id: string, payload: UpdateCustomerPayload) => {
    const response = await api.put<any>(`/clientes/${id}`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptCustomer(response)
}

const remove = (id: string) => api.delete<void>(`/clientes/${id}`, { baseUrl: API_CLIENTES_URL })

const getById = async (id: string) => {
    const response = await api.get<any>(`/clientes/${id}`, { baseUrl: API_CLIENTES_URL })
    return adaptCustomer(response)
}

export type CreateContactPayload = {
    contactType: string
    contactValue: string
    label?: string
    isDefault?: boolean
}

export type UpdateContactPayload = {
    contactType?: string
    contactValue?: string
    label?: string
    isDefault?: boolean
}

// ... existing code ...

const createContact = async (customerId: string, payload: CreateContactPayload) => {
    const response = await api.post<any>(`/clientes/${customerId}/contatos`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptContact(response)
}

const updateContact = async (customerId: string, contactId: string, payload: UpdateContactPayload) => {
    const response = await api.put<any>(`/clientes/${customerId}/contatos/${contactId}`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptContact(response)
}

const removeContact = (customerId: string, contactId: string) =>
    api.delete<void>(`/clientes/${customerId}/contatos/${contactId}`, { baseUrl: API_CLIENTES_URL })

// Addresses
export type CreateAddressPayload = {
    addressType: string
    postalCode: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>

const createAddress = async (customerId: string, payload: CreateAddressPayload) => {
    const response = await api.post<any>(`/clientes/${customerId}/enderecos`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptAddress(response)
}

const updateAddress = async (customerId: string, addressId: string, payload: UpdateAddressPayload) => {
    const response = await api.put<any>(`/clientes/${customerId}/enderecos/${addressId}`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptAddress(response)
}

const removeAddress = (customerId: string, addressId: string) =>
    api.delete<void>(`/clientes/${customerId}/enderecos/${addressId}`, { baseUrl: API_CLIENTES_URL })

// Bank Accounts
export type CreateBankAccountPayload = {
    bankCode: string
    branchCode: string
    accountNumber: string
    accountType: string
    pixKey?: string
    isDefaultReceipt?: boolean
}

export type UpdateBankAccountPayload = Partial<CreateBankAccountPayload>

const createBankAccount = async (customerId: string, payload: CreateBankAccountPayload) => {
    const response = await api.post<any>(`/clientes/${customerId}/contas-bancarias`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptBankAccount(response)
}

const updateBankAccount = async (customerId: string, accountId: string, payload: UpdateBankAccountPayload) => {
    const response = await api.put<any>(`/clientes/${customerId}/contas-bancarias/${accountId}`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptBankAccount(response)
}

const removeBankAccount = (customerId: string, accountId: string) =>
    api.delete<void>(`/clientes/${customerId}/contas-bancarias/${accountId}`, { baseUrl: API_CLIENTES_URL })

// Documents
export type CreateDocumentPayload = {
    documentType: string
    file: string
    expirationDate?: string // Format YYYY-MM-DD
    documentInternalData?: any
    fileName?: string
    fileSize?: string
}

export type UpdateDocumentPayload = Partial<CreateDocumentPayload> & {
    verificationStatus?: string
    rejectionReason?: string
}

const createDocument = async (customerId: string, payload: CreateDocumentPayload) => {
    const response = await api.post<any>(`/clientes/${customerId}/documentos`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptDocument(response)
}

const updateDocument = async (customerId: string, documentId: string, payload: UpdateDocumentPayload) => {
    const response = await api.put<any>(`/clientes/${customerId}/documentos/${documentId}`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptDocument(response)
}

const removeDocument = (customerId: string, documentId: string) =>
    api.delete<void>(`/clientes/${customerId}/documentos/${documentId}`, { baseUrl: API_CLIENTES_URL })

// Details
export type CustomerDetail = {
    id: string
    sex?: string
    maritalStatus?: string
    nationality?: string
    occupation?: string
    birthDate?: string | null
    createdAt: string
    updatedAt: string
}

export type CreateDetailPayload = {
    sex?: string | null
    maritalStatus?: string | null
    nationality?: string | null
    occupation?: string | null
    birthDate?: string | null
}

export type UpdateDetailPayload = Partial<CreateDetailPayload>

const adaptDetail = (data: any): CustomerDetail => ({
    id: data.id,
    sex: data.sex,
    maritalStatus: data.marital_status,
    nationality: data.nationality,
    occupation: data.occupation,
    birthDate: data.birth_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const createDetail = async (customerId: string, payload: CreateDetailPayload) => {
    const response = await api.post<any>(`/clientes/${customerId}/detalhes`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptDetail(response)
}

const updateDetail = async (customerId: string, detailId: string, payload: UpdateDetailPayload) => {
    const response = await api.put<any>(`/clientes/${customerId}/detalhes/${detailId}`, payload, { baseUrl: API_CLIENTES_URL })
    return adaptDetail(response)
}

const removeDetail = (customerId: string, detailId: string) =>
    api.delete<void>(`/clientes/${customerId}/detalhes/${detailId}`, { baseUrl: API_CLIENTES_URL })

export const customerService = {
    list,
    create,
    update,
    remove,
    getById,
    // Contacts
    createContact,
    updateContact,
    removeContact,
    // Addresses
    createAddress,
    updateAddress,
    removeAddress,
    // Bank Accounts
    createBankAccount,
    updateBankAccount,
    removeBankAccount,
    // Documents
    createDocument,
    updateDocument,
    removeDocument,
    // Details
    createDetail,
    updateDetail,
    removeDetail,
}
