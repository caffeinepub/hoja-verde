import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { QuoteStatus } from "../backend.d";
import type { Quote } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import {
  useCreateQuote,
  useDeleteQuote,
  useGetAllClients,
  useGetAllQuotes,
  useUpdateQuoteStatus,
} from "../hooks/useQueries";
import {
  formatColones,
  formatDate,
  getTodayStr,
  shareViaWhatsApp,
} from "../utils/format";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  sent: "Enviada",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: "badge-pending",
  sent: "badge-sent",
  accepted: "badge-accepted",
  rejected: "badge-rejected",
};

const TABS = [
  { value: "all", label: "Todas" },
  { value: QuoteStatus.pending, label: "Pendiente" },
  { value: QuoteStatus.sent, label: "Enviada" },
  { value: QuoteStatus.accepted, label: "Aceptada" },
  { value: QuoteStatus.rejected, label: "Rechazada" },
];

export function CotizacionesView() {
  const [activeTab, setActiveTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: quotes, isLoading } = useGetAllQuotes();
  const { data: clients } = useGetAllClients();
  const createQuote = useCreateQuote();
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();

  const filtered = useMemo(() => {
    if (!quotes) return [];
    if (activeTab === "all") return quotes;
    return quotes.filter((q) => q.status === activeTab);
  }, [quotes, activeTab]);

  const handleCreate = async (form: Partial<Quote>) => {
    if (!form.clientName || !form.serviceDescription) {
      toast.error("Complete todos los campos requeridos");
      return;
    }
    const client = clients?.find((c) => c.name === form.clientName);
    const newQuote: Quote = {
      id: BigInt(Date.now()),
      clientId: client?.id ?? "",
      clientName: form.clientName!,
      serviceDescription: form.serviceDescription!,
      price: BigInt(Number(form.price ?? 0)),
      date: getTodayStr(),
      status: QuoteStatus.pending,
      notes: form.notes ?? "",
    };
    try {
      await createQuote.mutateAsync(newQuote);
      toast.success("Cotización creada");
      setShowCreate(false);
    } catch {
      toast.error("Error al crear cotización");
    }
  };

  const handleStatusChange = async (quote: Quote, status: QuoteStatus) => {
    try {
      await updateStatus.mutateAsync({ quoteId: quote.id, status });
      toast.success("Estado actualizado");
      setSelectedQuote(null);
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteQuote.mutateAsync(deleteId);
      toast.success("Cotización eliminada");
      setDeleteId(null);
      setSelectedQuote(null);
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleWhatsApp = (quote: Quote) => {
    const client = clients?.find((c) => c.id === quote.clientId);
    const phone = client?.phone ?? "";
    const msg = `🌿 *Cotización Hoja Verde*\n\nEstimado/a ${quote.clientName},\n\n*Servicio:* ${quote.serviceDescription}\n*Precio:* ${formatColones(quote.price)}\n*Fecha:* ${formatDate(quote.date)}\n\nQuedamos a sus órdenes.\n\nHoja Verde - Gestión de Jardines`;
    shareViaWhatsApp(phone, msg);
  };

  return (
    <div className="animate-fade-in">
      <AppHeader title="Cotizaciones" subtitle="Gestión de cotizaciones" />

      <div className="max-w-lg mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-3">
            <TabsList
              data-ocid="cotizaciones.tab"
              className="w-full bg-muted/50 rounded-xl h-auto p-1 grid grid-cols-5 gap-0.5"
            >
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="text-[10px] py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent
            value={activeTab}
            className="px-4 py-3 pb-24 space-y-2.5"
          >
            {isLoading ? (
              <div className="space-y-3" data-ocid="cotizaciones.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="py-12 text-center"
                data-ocid="cotizaciones.empty_state"
              >
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">
                  Sin cotizaciones
                </p>
                <p className="text-muted-foreground text-sm">
                  Crea tu primera cotización con el botón +
                </p>
              </div>
            ) : (
              filtered.map((quote, idx) => (
                <button
                  type="button"
                  key={String(quote.id)}
                  data-ocid={`cotizaciones.item.${idx + 1}`}
                  onClick={() => setSelectedQuote(quote)}
                  className="w-full text-left bg-white rounded-xl shadow-card border border-border hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99] p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {quote.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {quote.serviceDescription}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE_CLASSES[quote.status]}`}
                    >
                      {STATUS_LABELS[quote.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-sm">
                      {formatColones(quote.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(quote.date)}
                      </span>
                      <button
                        type="button"
                        data-ocid="cotizaciones.whatsapp_button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsApp(quote);
                        }}
                        className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-700" />
                      </button>
                    </div>
                  </div>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB */}
      <button
        type="button"
        data-ocid="cotizaciones.add_button"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-fab hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Nueva cotización"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Create dialog */}
      {showCreate && (
        <CreateQuoteDialog
          clients={clients ?? []}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          isPending={createQuote.isPending}
        />
      )}

      {/* Detail dialog */}
      {selectedQuote && (
        <QuoteDetailDialog
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onStatusChange={handleStatusChange}
          onWhatsApp={handleWhatsApp}
          onDelete={(id) => setDeleteId(id)}
          isPending={updateStatus.isPending}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent
          data-ocid="cotizaciones.dialog"
          className="max-w-sm mx-4 rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar cotización?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="cotizaciones.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="cotizaciones.confirm_button"
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateQuoteDialog({
  clients,
  onClose,
  onCreate,
  isPending,
}: {
  clients: { id: string; name: string }[];
  onClose: () => void;
  onCreate: (data: Partial<Quote>) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    clientName: "",
    serviceDescription: "",
    price: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(form as unknown as Partial<Quote>);
    setForm({ clientName: "", serviceDescription: "", price: "", notes: "" });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="cotizaciones.create.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Nueva Cotización</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm">Cliente *</Label>
            <Select
              value={form.clientName}
              onValueChange={(v) => setForm({ ...form, clientName: v })}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Descripción del servicio *</Label>
            <Textarea
              value={form.serviceDescription}
              onChange={(e) =>
                setForm({ ...form, serviceDescription: e.target.value })
              }
              placeholder="Descripción del trabajo..."
              className="mt-1 min-h-[70px] resize-none"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Precio (₡) *</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="45000"
              className="mt-1 h-11"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Notas</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Observaciones..."
              className="mt-1 h-11"
            />
          </div>
          <DialogFooter className="gap-2 flex-row justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="cotizaciones.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="cotizaciones.submit_button"
              className="rounded-xl"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuoteDetailDialog({
  quote,
  onClose,
  onStatusChange,
  onWhatsApp,
  onDelete,
  isPending,
}: {
  quote: Quote;
  onClose: () => void;
  onStatusChange: (quote: Quote, status: QuoteStatus) => Promise<void>;
  onWhatsApp: (quote: Quote) => void;
  onDelete: (id: bigint) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="cotizaciones.detail.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Cotización</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-green-pale rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-foreground">{quote.clientName}</p>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[quote.status]}`}
              >
                {STATUS_LABELS[quote.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {quote.serviceDescription}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {formatDate(quote.date)}
              </span>
              <span className="font-bold text-primary text-lg">
                {formatColones(quote.price)}
              </span>
            </div>
            {quote.notes && (
              <p className="text-xs text-muted-foreground italic">
                {quote.notes}
              </p>
            )}
          </div>

          {/* Status actions */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Cambiar estado:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(QuoteStatus)
                .filter((s) => s !== quote.status)
                .map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => onStatusChange(quote, status)}
                    className="rounded-xl text-xs h-9"
                  >
                    {STATUS_LABELS[status]}
                  </Button>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              data-ocid="cotizaciones.detail.whatsapp_button"
              onClick={() => onWhatsApp(quote)}
              className="flex-1 rounded-xl gap-2 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(quote.id)}
              className="rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              data-ocid="cotizaciones.delete_button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
