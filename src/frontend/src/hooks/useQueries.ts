import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Client,
  type ClientId,
  type FinancialEntry,
  type FinancialEntryId,
  FinancialEntryType,
  type Garden,
  type Invoice,
  type InvoiceId,
  type Job,
  type JobId,
  type JobStatus,
  type MaintenanceSchedule,
  type Prospect,
  type ProspectId,
  ProspectStatus,
  type Quote,
  type QuoteId,
  QuoteStatus,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Clients ───────────────────────────────────────────────────────────────

export function useGetAllClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (client: Client) => {
      if (!actor) throw new Error("No actor");
      return actor.createClient(client);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (client: Client) => {
      if (!actor) throw new Error("No actor");
      return actor.updateClient(client);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

// ─── Gardens ───────────────────────────────────────────────────────────────

export function useGetGarden(clientId: ClientId | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Garden | null>({
    queryKey: ["garden", clientId],
    queryFn: async () => {
      if (!actor || !clientId) return null;
      try {
        return await actor.getGardenByClient(clientId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!clientId,
  });
}

export function useCreateOrUpdateGarden() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (garden: Garden) => {
      if (!actor) throw new Error("No actor");
      return actor.createOrUpdateGarden(garden);
    },
    onSuccess: (_data, garden) =>
      qc.invalidateQueries({ queryKey: ["garden", garden.clientId] }),
  });
}

// ─── Maintenance Schedules ─────────────────────────────────────────────────

export function useGetAllSchedules() {
  const { actor, isFetching } = useActor();
  return useQuery<MaintenanceSchedule[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveSchedules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUpcomingMaintenance(days = 7) {
  const { actor, isFetching } = useActor();
  return useQuery<MaintenanceSchedule[]>({
    queryKey: ["upcoming-maintenance", days],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingMaintenance(BigInt(days));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrUpdateSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: MaintenanceSchedule) => {
      if (!actor) throw new Error("No actor");
      return actor.createOrUpdateMaintenanceSchedule(schedule);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      qc.invalidateQueries({ queryKey: ["upcoming-maintenance"] });
    },
  });
}

// ─── Jobs ──────────────────────────────────────────────────────────────────

export function useGetAllJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: Job) => {
      if (!actor) throw new Error("No actor");
      return actor.createJob(job);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: Job) => {
      if (!actor) throw new Error("No actor");
      return actor.updateJob(job);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateJobStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      status,
    }: { jobId: JobId; status: JobStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateJobStatus(jobId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: JobId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteJob(jobId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

// ─── Quotes ────────────────────────────────────────────────────────────────

export function useGetAllQuotes() {
  const { actor, isFetching } = useActor();
  return useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: async () => {
      if (!actor) return [];
      const [pending, sent, accepted, rejected] = await Promise.all([
        actor.getQuoteByStatus(QuoteStatus.pending),
        actor.getQuoteByStatus(QuoteStatus.sent),
        actor.getQuoteByStatus(QuoteStatus.accepted),
        actor.getQuoteByStatus(QuoteStatus.rejected),
      ]);
      return [...pending, ...sent, ...accepted, ...rejected];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateQuote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quote: Quote) => {
      if (!actor) throw new Error("No actor");
      return actor.createQuote(quote);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useUpdateQuote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quote: Quote) => {
      if (!actor) throw new Error("No actor");
      return actor.updateQuote(quote);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useUpdateQuoteStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      quoteId,
      status,
    }: { quoteId: QuoteId; status: QuoteStatus }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateQuoteStatus(quoteId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useDeleteQuote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: QuoteId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteQuote(quoteId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

// ─── Invoices ──────────────────────────────────────────────────────────────

export function useGetAllInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!actor) throw new Error("No actor");
      return actor.createInvoice(invoice);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useMarkInvoicePaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: InvoiceId) => {
      if (!actor) throw new Error("No actor");
      return actor.markInvoiceAsPaid(invoiceId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: InvoiceId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteInvoice(invoiceId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

// ─── Prospects ─────────────────────────────────────────────────────────────

export function useGetAllProspects() {
  const { actor, isFetching } = useActor();
  return useQuery<Prospect[]>({
    queryKey: ["prospects"],
    queryFn: async () => {
      if (!actor) return [];
      const [pending, quoteSent, accepted, rejected] = await Promise.all([
        actor.getProspectsByStatus(ProspectStatus.pending),
        actor.getProspectsByStatus(ProspectStatus.quoteSent),
        actor.getProspectsByStatus(ProspectStatus.accepted),
        actor.getProspectsByStatus(ProspectStatus.rejected),
      ]);
      return [...pending, ...quoteSent, ...accepted, ...rejected];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProspect() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prospect: Prospect) => {
      if (!actor) throw new Error("No actor");
      return actor.createProspect(prospect);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}

export function useUpdateProspect() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prospect: Prospect) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProspect(prospect);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}

export function useUpdateProspectStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      prospectId,
      status,
    }: {
      prospectId: ProspectId;
      status: ProspectStatus;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProspectStatus(prospectId, status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}

export function useDeleteProspect() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prospectId: ProspectId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProspect(prospectId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prospects"] }),
  });
}

// ─── Financial ─────────────────────────────────────────────────────────────

export function useGetFinancialEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<FinancialEntry[]>({
    queryKey: ["financial"],
    queryFn: async () => {
      if (!actor) return [];
      const [income, expense] = await Promise.all([
        actor.getEntriesByType(FinancialEntryType.income),
        actor.getEntriesByType(FinancialEntryType.expense),
      ]);
      return [...income, ...expense];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateFinancialEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: FinancialEntry) => {
      if (!actor) throw new Error("No actor");
      return actor.createFinancialEntry(entry);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial"] }),
  });
}

export function useUpdateFinancialEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: FinancialEntry) => {
      if (!actor) throw new Error("No actor");
      return actor.updateFinancialEntry(entry);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial"] }),
  });
}

export function useDeleteFinancialEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: FinancialEntryId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFinancialEntry(entryId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financial"] }),
  });
}
