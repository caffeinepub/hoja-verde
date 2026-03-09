import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Prospect {
    id: ProspectId;
    status: ProspectStatus;
    name: string;
    serviceRequested: string;
    address: string;
    notes: string;
    phone: string;
    quoteDate: string;
}
export type Time = bigint;
export type ProspectId = bigint;
export interface MaintenanceSchedule {
    id: ScheduleId;
    frequencyDays: bigint;
    clientId: ClientId;
    isActive: boolean;
    notes: string;
    lastDate: string;
    nextDate: string;
}
export type JobId = bigint;
export interface Invoice {
    id: InvoiceId;
    clientId: ClientId;
    clientName: string;
    date: string;
    isPaid: boolean;
    totalAmount: bigint;
    nextMaintenanceDate: string;
    services: Array<string>;
}
export interface Garden {
    photoUrls: Array<string>;
    clientId: ClientId;
    toolsRequired: string;
    grassType: string;
    sizeM2: number;
    observations: string;
    avgWorkTimeHours: number;
    terrainType: string;
}
export type ScheduleId = string;
export type QuoteId = bigint;
export interface Job {
    id: JobId;
    status: JobStatus;
    clientId: ClientId;
    clientName: string;
    date: string;
    serviceDescription: string;
    notes: string;
    price: bigint;
}
export type InvoiceId = bigint;
export type FinancialEntryId = bigint;
export interface FinancialEntry {
    id: FinancialEntryId;
    entryType: FinancialEntryType;
    date: string;
    description: string;
    category: string;
    amount: bigint;
}
export interface Quote {
    id: QuoteId;
    status: QuoteStatus;
    clientId: ClientId;
    clientName: string;
    date: string;
    serviceDescription: string;
    notes: string;
    price: bigint;
}
export interface Client {
    id: ClientId;
    name: string;
    createdAt: Time;
    isActive: boolean;
    address: string;
    notes: string;
    phone: string;
    mapLocation: string;
}
export type ClientId = string;
export interface UserProfile {
    name: string;
    role: string;
}
export enum FinancialEntryType {
    expense = "expense",
    income = "income"
}
export enum JobStatus {
    scheduled = "scheduled",
    cancelled = "cancelled",
    completed = "completed",
    inProgress = "inProgress"
}
export enum ProspectStatus {
    quoteSent = "quoteSent",
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum QuoteStatus {
    pending = "pending",
    sent = "sent",
    rejected = "rejected",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClient(client: Client): Promise<void>;
    createFinancialEntry(entry: FinancialEntry): Promise<FinancialEntryId>;
    createInvoice(invoice: Invoice): Promise<InvoiceId>;
    createJob(job: Job): Promise<JobId>;
    createOrUpdateGarden(garden: Garden): Promise<void>;
    createOrUpdateMaintenanceSchedule(schedule: MaintenanceSchedule): Promise<void>;
    createProspect(prospect: Prospect): Promise<ProspectId>;
    createQuote(quote: Quote): Promise<QuoteId>;
    deleteClient(clientId: ClientId): Promise<void>;
    deleteFinancialEntry(entryId: FinancialEntryId): Promise<void>;
    deleteInvoice(invoiceId: InvoiceId): Promise<void>;
    deleteJob(jobId: JobId): Promise<void>;
    deleteProspect(prospectId: ProspectId): Promise<void>;
    deleteQuote(quoteId: QuoteId): Promise<void>;
    getAllActiveSchedules(): Promise<Array<MaintenanceSchedule>>;
    getAllClients(): Promise<Array<Client>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllJobs(): Promise<Array<Job>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(clientId: ClientId): Promise<Client>;
    getEntriesByType(entryType: FinancialEntryType): Promise<Array<FinancialEntry>>;
    getGardenByClient(clientId: ClientId): Promise<Garden>;
    getInvoice(invoiceId: InvoiceId): Promise<Invoice>;
    getJob(jobId: JobId): Promise<Job>;
    getProspectsByStatus(status: ProspectStatus): Promise<Array<Prospect>>;
    getQuoteByStatus(status: QuoteStatus): Promise<Array<Quote>>;
    getUpcomingMaintenance(days: bigint): Promise<Array<MaintenanceSchedule>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markInvoiceAsPaid(invoiceId: InvoiceId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClient(updatedClient: Client): Promise<void>;
    updateFinancialEntry(entry: FinancialEntry): Promise<void>;
    updateJob(job: Job): Promise<void>;
    updateJobStatus(jobId: JobId, status: JobStatus): Promise<void>;
    updateProspect(prospect: Prospect): Promise<void>;
    updateProspectStatus(prospectId: ProspectId, status: ProspectStatus): Promise<void>;
    updateQuote(quote: Quote): Promise<void>;
    updateQuoteStatus(quoteId: QuoteId, status: QuoteStatus): Promise<void>;
}
