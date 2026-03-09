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
import {
  CheckCircle,
  Loader2,
  MessageCircle,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Invoice } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import {
  useCreateInvoice,
  useDeleteInvoice,
  useGetAllClients,
  useGetAllInvoices,
  useMarkInvoicePaid,
} from "../hooks/useQueries";
import {
  addDaysToToday,
  formatColones,
  formatDate,
  formatInvoiceId,
  getTodayStr,
  shareViaWhatsApp,
} from "../utils/format";

export function FacturasView() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: invoices, isLoading } = useGetAllInvoices();
  const { data: clients } = useGetAllClients();
  const createInvoice = useCreateInvoice();
  const markPaid = useMarkInvoicePaid();
  const deleteInvoice = useDeleteInvoice();

  const handleCreate = async (
    form: Partial<Invoice> & { servicesText: string },
  ) => {
    if (!form.clientName) {
      toast.error("Seleccione un cliente");
      return;
    }
    const client = clients?.find((c) => c.name === form.clientName);
    const services = form.servicesText
      ? form.servicesText.split("\n").filter((s) => s.trim())
      : [];
    const newInvoice: Invoice = {
      id: BigInt(Date.now()),
      clientId: client?.id ?? "",
      clientName: form.clientName!,
      services,
      totalAmount: BigInt(Number(form.totalAmount ?? 0)),
      date: getTodayStr(),
      nextMaintenanceDate: form.nextMaintenanceDate ?? addDaysToToday(15),
      isPaid: false,
    };
    try {
      await createInvoice.mutateAsync(newInvoice);
      toast.success("Factura creada");
      setShowCreate(false);
    } catch {
      toast.error("Error al crear factura");
    }
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await markPaid.mutateAsync(invoice.id);
      toast.success("Factura marcada como pagada");
      setSelectedInvoice(null);
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInvoice.mutateAsync(deleteId);
      toast.success("Factura eliminada");
      setDeleteId(null);
      setSelectedInvoice(null);
    } catch {
      toast.error("Error al eliminar la factura");
    }
  };

  const handleWhatsApp = (invoice: Invoice) => {
    const client = clients?.find((c) => c.id === invoice.clientId);
    const phone = client?.phone ?? "";
    const invoiceNum = formatInvoiceId(invoice.id);
    const servicesText = invoice.services.map((s) => `• ${s}`).join("\n");
    const msg = `🌿 *Factura ${invoiceNum} - Hoja Verde*\n\nCliente: ${invoice.clientName}\n\n*Servicios realizados:*\n${servicesText}\n\n*Total: ${formatColones(invoice.totalAmount)}*\nFecha: ${formatDate(invoice.date)}\nPróximo mantenimiento: ${formatDate(invoice.nextMaintenanceDate)}\n\nGracias por confiar en Hoja Verde 🍃`;
    shareViaWhatsApp(phone, msg);
  };

  return (
    <div className="animate-fade-in">
      <AppHeader title="Facturas" subtitle="Gestión de facturas" />

      <div className="px-4 py-4 pb-24 max-w-lg mx-auto space-y-2.5">
        {isLoading ? (
          <div className="space-y-3" data-ocid="facturas.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="py-12 text-center" data-ocid="facturas.empty_state">
            <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground mb-1">Sin facturas</p>
            <p className="text-muted-foreground text-sm">
              Crea tu primera factura con el botón +
            </p>
          </div>
        ) : (
          invoices.map((invoice, idx) => (
            <div
              key={String(invoice.id)}
              data-ocid={`facturas.item.${idx + 1}`}
              className="bg-white rounded-xl shadow-card border border-border p-4"
            >
              <button
                type="button"
                onClick={() => setSelectedInvoice(invoice)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-primary text-sm">
                      {formatInvoiceId(invoice.id)}
                    </p>
                    <p className="font-semibold text-foreground text-sm">
                      {invoice.clientName}
                    </p>
                  </div>
                  <Badge
                    variant={invoice.isPaid ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {invoice.isPaid ? "Pagada" : "Pendiente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-base">
                    {formatColones(invoice.totalAmount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(invoice.date)}
                  </span>
                </div>
              </button>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <button
                  type="button"
                  data-ocid="facturas.whatsapp_button"
                  onClick={() => handleWhatsApp(invoice)}
                  className="flex-1 h-8 bg-green-100 rounded-lg flex items-center justify-center gap-1.5 hover:bg-green-200 transition-colors text-xs font-medium text-green-700"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  data-ocid={`facturas.delete_button.${idx + 1}`}
                  onClick={() => setDeleteId(invoice.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        data-ocid="facturas.add_button"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-fab hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Nueva factura"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Create dialog */}
      {showCreate && (
        <CreateInvoiceDialog
          clients={clients ?? []}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          isPending={createInvoice.isPending}
        />
      )}

      {/* Detail dialog */}
      {selectedInvoice && (
        <InvoiceDetailDialog
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onMarkPaid={handleMarkPaid}
          onWhatsApp={handleWhatsApp}
          onDelete={(id) => setDeleteId(id)}
          isPending={markPaid.isPending}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent
          data-ocid="facturas.dialog"
          className="max-w-sm mx-4 rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar factura?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="facturas.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="facturas.confirm_button"
              onClick={handleDelete}
              disabled={deleteInvoice.isPending}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {deleteInvoice.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateInvoiceDialog({
  clients,
  onClose,
  onCreate,
  isPending,
}: {
  clients: { id: string; name: string }[];
  onClose: () => void;
  onCreate: (
    data: Partial<Invoice> & { servicesText: string },
  ) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    clientName: "",
    servicesText: "",
    totalAmount: "",
    nextMaintenanceDate: addDaysToToday(15),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      ...form,
      totalAmount: BigInt(Number(form.totalAmount)) as unknown as bigint,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="facturas.create.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Nueva Factura</DialogTitle>
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
            <Label className="text-sm">Servicios (uno por línea) *</Label>
            <textarea
              value={form.servicesText}
              onChange={(e) =>
                setForm({ ...form, servicesText: e.target.value })
              }
              placeholder="Corte de césped&#10;Bordeado&#10;Poda de arbustos"
              className="mt-1 w-full min-h-[90px] resize-none rounded-xl border border-input px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Total (₡) *</Label>
            <Input
              type="number"
              value={form.totalAmount}
              onChange={(e) =>
                setForm({ ...form, totalAmount: e.target.value })
              }
              placeholder="45000"
              className="mt-1 h-11"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Próximo mantenimiento</Label>
            <Input
              type="date"
              value={form.nextMaintenanceDate}
              onChange={(e) =>
                setForm({ ...form, nextMaintenanceDate: e.target.value })
              }
              className="mt-1 h-11"
            />
          </div>
          <DialogFooter className="gap-2 flex-row justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="facturas.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="facturas.submit_button"
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

function InvoiceDetailDialog({
  invoice,
  onClose,
  onMarkPaid,
  onWhatsApp,
  onDelete,
  isPending,
}: {
  invoice: Invoice;
  onClose: () => void;
  onMarkPaid: (invoice: Invoice) => Promise<void>;
  onWhatsApp: (invoice: Invoice) => void;
  onDelete: (id: bigint) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="facturas.detail.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display flex items-center justify-between">
            <span>{formatInvoiceId(invoice.id)}</span>
            <Badge variant={invoice.isPaid ? "default" : "secondary"}>
              {invoice.isPaid ? "Pagada" : "Pendiente"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-green-pale rounded-xl p-4">
            <p className="font-bold text-foreground">{invoice.clientName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(invoice.date)}
            </p>

            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Servicios:
              </p>
              {invoice.services.map((s) => (
                <div key={s} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                  <p className="text-sm text-foreground">{s}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Total:
                </span>
                <span className="font-bold text-primary text-xl">
                  {formatColones(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  Próximo mantenimiento:
                </span>
                <span className="text-xs font-medium text-foreground">
                  {formatDate(invoice.nextMaintenanceDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!invoice.isPaid && (
              <Button
                onClick={() => onMarkPaid(invoice)}
                disabled={isPending}
                className="flex-1 rounded-xl gap-2"
                data-ocid="facturas.detail.paid_button"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Marcar Pagada
              </Button>
            )}
            <Button
              data-ocid="facturas.detail.whatsapp_button"
              onClick={() => onWhatsApp(invoice)}
              className={`rounded-xl gap-2 bg-green-600 hover:bg-green-700 ${invoice.isPaid ? "flex-1" : ""}`}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              data-ocid="facturas.detail.delete_button"
              variant="outline"
              onClick={() => {
                onDelete(invoice.id);
                onClose();
              }}
              className="rounded-xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
