
import { api } from './api'

const API_PESSOAS_URL = import.meta.env.VITE_API_PESSOAS_BASE_URL ?? 'http://localhost:3335/api'

export type PeopleAddress = {
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

export type PeopleContact = {
    id: string
    contactType: string
    contactValue: string
    label?: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export type PeopleBankAccount = {
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

export type PeopleDocument = {
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

export type PeopleRelationshipType = {
    id: string
    connectorPrefix: string
    relationshipSource: string
    connectorSuffix: string
    relationshipTarget: string
    inverseTypeId: string
    createdAt: string
    updatedAt: string
}

export type PeopleRelationship = {
    id: string
    peopleRelationshipTypesId: string
    peopleIdSource: string
    peopleIdTarget: string
    inverseTypeId: string
    connectorPrefix: string
    relationshipSource: string
    connectorSuffix: string
    relationshipTarget: string
    targetName: string
    targetCpfCnpj?: string
    createdAt: string
    updatedAt: string
}

export type PeopleDTO = {
    id: string
    seqId?: number
    name: string
    cpfCnpj: string
    birthDate?: string | null
    createdAt: string
    createdBy: string
    updatedAt: string
    updatedBy: string
    addresses?: PeopleAddress[]
    contacts?: PeopleContact[]
    bankAccounts?: PeopleBankAccount[]
    documents?: PeopleDocument[]
    relationships?: PeopleRelationship[]
    details?: PeopleDetail | null
}

export type CreatePeoplePayload = {
    name: string
    cpfCnpj: string
    birthDate?: string | null
    createdBy: string
}

export type UpdatePeoplePayload = {
    name?: string
    cpfCnpj?: string
    birthDate?: string | null
    updatedBy: string
}

// Adapters
const adaptAddress = (data: any): PeopleAddress => ({
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

const adaptContact = (data: any): PeopleContact => ({
    id: data.id,
    contactType: data.contact_type,
    contactValue: data.contact_value,
    label: data.label,
    isDefault: data.is_default,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const adaptBankAccount = (data: any): PeopleBankAccount => ({
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

const adaptDocument = (data: any): PeopleDocument => ({
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

const adaptRelationshipType = (data: any): PeopleRelationshipType => ({
    id: data.id,
    connectorPrefix: data.connector_prefix,
    relationshipSource: data.relationship_source,
    connectorSuffix: data.connector_suffix,
    relationshipTarget: data.relationship_target,
    inverseTypeId: data.inverse_type_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const adaptRelationship = (data: any): PeopleRelationship => ({
    id: data.id,
    peopleRelationshipTypesId: data.people_relationship_types_id,
    peopleIdSource: data.people_id_source,
    peopleIdTarget: data.people_id_target,
    inverseTypeId: data.inverse_type_id,
    connectorPrefix: data.connector_prefix,
    relationshipSource: data.relationship_source,
    connectorSuffix: data.connector_suffix,
    relationshipTarget: data.relationship_target,
    targetName: data.target_name,
    targetCpfCnpj: data.target_cpf_cnpj,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const adaptPeople = (data: any): PeopleDTO => {
    return {
        id: data.id,
        seqId: data.seq_id,
        name: data.name,
        cpfCnpj: data.cpf_cnpj,
        birthDate: data.birth_date,
        createdAt: data.created_at,
        createdBy: data.created_by,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
        addresses: data.addresses?.map(adaptAddress),
        contacts: data.contacts?.map(adaptContact),
        bankAccounts: data.bankAccounts?.map(adaptBankAccount), // API returns 'bankAccounts' in repo findById? No, usually snake_case in raw query but check repo again.
        // Wait, PostgresPeopleRepository findById returns:
        // { ...people, addresses: ..., contacts: ..., bankAccounts: ..., documents: ... }
        // The keys in the return object of findById are camelCase because the Repository manually constructs the object:
        // return { ...people, addresses: ..., bankAccounts: ... }
        // However, the "people" part comes from `peopleRes.rows[0]` which is snake_case (Postgres default).
        // The arrays come from `addressesRes.rows` which are also array of objects with snake_case keys (DB columns).
        // So `data.addresses` will be an array of snake_case objects.
        // AND the key `addresses` is camelCase because the repository explicitly set it so.
        // So `data.addresses` is correct. `data.bankAccounts` is correct.
        documents: data.documents?.map(adaptDocument),
        relationships: data.relationships?.map(adaptRelationship),
        details: data.details ? adaptDetail(data.details) : null,
    }
}

const list = async () => {
    const response = await api.get<any[]>('/peoples', { baseUrl: API_PESSOAS_URL })
    return response.map(adaptPeople)
}

const create = async (payload: CreatePeoplePayload) => {
    const response = await api.post<any>('/peoples', payload, { baseUrl: API_PESSOAS_URL })
    return adaptPeople(response)
}

const update = async (id: string, payload: UpdatePeoplePayload) => {
    const response = await api.put<any>(`/peoples/${id}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptPeople(response)
}

const remove = (id: string) => api.delete<void>(`/peoples/${id}`, { baseUrl: API_PESSOAS_URL })

const getById = async (id: string) => {
    const response = await api.get<any>(`/peoples/${id}`, { baseUrl: API_PESSOAS_URL })
    return adaptPeople(response)
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

const createContact = async (peopleId: string, payload: CreateContactPayload) => {
    const response = await api.post<any>(`/peoples/${peopleId}/contacts`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptContact(response)
}

const updateContact = async (peopleId: string, contactId: string, payload: UpdateContactPayload) => {
    const response = await api.put<any>(`/peoples/${peopleId}/contacts/${contactId}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptContact(response)
}

const removeContact = (peopleId: string, contactId: string) =>
    api.delete<void>(`/peoples/${peopleId}/contacts/${contactId}`, { baseUrl: API_PESSOAS_URL })

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

const createAddress = async (peopleId: string, payload: CreateAddressPayload) => {
    const response = await api.post<any>(`/peoples/${peopleId}/addresses`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptAddress(response)
}

const updateAddress = async (peopleId: string, addressId: string, payload: UpdateAddressPayload) => {
    const response = await api.put<any>(`/peoples/${peopleId}/addresses/${addressId}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptAddress(response)
}

const removeAddress = (peopleId: string, addressId: string) =>
    api.delete<void>(`/peoples/${peopleId}/addresses/${addressId}`, { baseUrl: API_PESSOAS_URL })

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

const createBankAccount = async (peopleId: string, payload: CreateBankAccountPayload) => {
    const response = await api.post<any>(`/peoples/${peopleId}/bank-accounts`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptBankAccount(response)
}

const updateBankAccount = async (peopleId: string, accountId: string, payload: UpdateBankAccountPayload) => {
    const response = await api.put<any>(`/peoples/${peopleId}/bank-accounts/${accountId}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptBankAccount(response)
}

const removeBankAccount = (peopleId: string, accountId: string) =>
    api.delete<void>(`/peoples/${peopleId}/bank-accounts/${accountId}`, { baseUrl: API_PESSOAS_URL })

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

const createDocument = async (peopleId: string, payload: CreateDocumentPayload) => {
    const response = await api.post<any>(`/peoples/${peopleId}/documents`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptDocument(response)
}

const updateDocument = async (peopleId: string, documentId: string, payload: UpdateDocumentPayload) => {
    const response = await api.put<any>(`/peoples/${peopleId}/documents/${documentId}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptDocument(response)
}

const removeDocument = (peopleId: string, documentId: string) =>
    api.delete<void>(`/peoples/${peopleId}/documents/${documentId}`, { baseUrl: API_PESSOAS_URL })

// Details
export type PeopleDetail = {
    id: string
    sex?: string
    maritalStatus?: string
    nationality?: string
    occupation?: string
    birthDate?: string | null
    firstName?: string
    surname?: string
    legalName?: string
    tradeName?: string
    createdAt: string
    updatedAt: string
}

export type CreateDetailPayload = {
    sex?: string | null
    maritalStatus?: string | null
    nationality?: string | null
    occupation?: string | null
    birthDate?: string | null
    firstName?: string | null
    surname?: string | null
    legalName?: string | null
    tradeName?: string | null
}

export type UpdateDetailPayload = Partial<CreateDetailPayload>

const adaptDetail = (data: any): PeopleDetail => ({
    id: data.id,
    sex: data.sex,
    maritalStatus: data.marital_status,
    nationality: data.nationality,
    occupation: data.occupation,
    birthDate: data.birth_date,
    firstName: data.first_name,
    surname: data.surname,
    legalName: data.legal_name,
    tradeName: data.trade_name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

const createDetail = async (peopleId: string, payload: CreateDetailPayload) => {
    const response = await api.post<any>(`/peoples/${peopleId}/details`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptDetail(response)
}

const updateDetail = async (peopleId: string, detailId: string, payload: UpdateDetailPayload) => {
    const response = await api.put<any>(`/peoples/${peopleId}/details/${detailId}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptDetail(response)
}

const removeDetail = (peopleId: string, detailId: string) =>
    api.delete<void>(`/peoples/${peopleId}/details/${detailId}`, { baseUrl: API_PESSOAS_URL })

// Relationship Types
const listRelationshipTypes = async () => {
    const response = await api.get<any[]>('/peoples/relationship-types', { baseUrl: API_PESSOAS_URL })
    return response.map(adaptRelationshipType)
}

const createRelationshipType = async (payload: any) => {
    const response = await api.post<any>('/peoples/relationship-types', payload, { baseUrl: API_PESSOAS_URL })
    return adaptRelationshipType(response)
}

const updateRelationshipType = async (id: string, payload: any) => {
    const response = await api.put<any>(`/peoples/relationship-types/${id}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptRelationshipType(response)
}

const removeRelationshipType = (id: string) =>
    api.delete<void>(`/peoples/relationship-types/${id}`, { baseUrl: API_PESSOAS_URL })

// Relationships
export type CreateRelationshipPayload = {
    peopleRelationshipTypesId: string
    peopleIdSource: string
    peopleIdTarget: string
    inverseTypeId: string
}

const createRelationship = async (peopleId: string, payload: CreateRelationshipPayload) => {
    const response = await api.post<any>(`/peoples/${peopleId}/relationships`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptRelationship(response)
}

const updateRelationship = async (peopleId: string, relationshipId: string, payload: any) => {
    const response = await api.put<any>(`/peoples/${peopleId}/relationships/${relationshipId}`, payload, { baseUrl: API_PESSOAS_URL })
    return adaptRelationship(response)
}

const removeRelationship = (peopleId: string, relationshipId: string) =>
    api.delete<void>(`/peoples/${peopleId}/relationships/${relationshipId}`, { baseUrl: API_PESSOAS_URL })

export const peopleService = {
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
    // Relationship Types
    listRelationshipTypes,
    createRelationshipType,
    updateRelationshipType,
    removeRelationshipType,
    // Relationships
    createRelationship,
    updateRelationship,
    removeRelationship,
}
