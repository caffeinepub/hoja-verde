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
import { Loader2, MessageCircle, Plus, Trash2, UserSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProspectStatus } from "../backend.d";
import type { Prospect } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import {
  useCreateProspect,
  useDeleteProspect,
  useGetAllProspects,
  useUpdateProspectStatus,
} from "../hooks/useQueries";
import { formatDate, getTodayStr, shareViaWhatsApp } from "../utils/format";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  quoteSent: "Cotización Enviada",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: "badge-pending",
  quoteSent: "badge-quote-sent",
  accepted: "badge-accepted",
  rejected: "badge-rejected",
};

const TABS = [
  { value: ProspectStatus.pending, label: "Pendiente" },
  { value: ProspectStatus.quoteSent, label: "Cot. Enviada" },
  { value: ProspectStatus.accepted, label: "Aceptado" },
  { value: ProspectStatus.rejected, label: "Rechazado" },
];

export function ProspectosView() {
  const [activeTab, setActiveTab] = useState<string>(ProspectStatus.pending);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: prospects, isLoading } = useGetAllProspects();
  const createProspect = useCreateProspect();
  const updateStatus = useUpdateProspectStatus();
  const deleteProspect = useDeleteProspect();

  const filtered = useMemo(
    () => (prospects ?? []).filter((p) => p.status === activeTab),
    [prospects, activeTab],
  );

  const handleCreate = async (form: Partial<Prospect>) => {
    if (!form.name?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    const newProspect: Prospect = {
      id: BigInt(Date.now()),
      name: form.name!,
      phone: form.phone ?? "",
      address: form.address ?? "",
      serviceRequested: form.serviceRequested ?? "",
      quoteDate: getTodayStr(),
      status: ProspectStatus.pending,
      notes: form.notes ?? "",
    };
    try {
      await createProspect.mutateAsync(newProspect);
      toast.success("Prospecto agregado");
      setShowCreate(false);
    } catch {
      toast.error("Error al crear prospecto");
    }
  };

  const handleStatusChange = async (
    prospect: Prospect,
    status: ProspectStatus,
  ) => {
    try {
      await updateStatus.mutateAsync({ prospectId: prospect.id, status });
      toast.success("Estado actualizado");
      setSelectedProspect(null);
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProspect.mutateAsync(deleteId);
      toast.success("Prospecto eliminado");
      setDeleteId(null);
      setSelectedProspect(null);
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleWhatsApp = (prospect: Prospect) => {
    const msg = `Hola ${prospect.name}, le contactamos de Hoja Verde para hacer seguimiento de su solicitud de servicio: "${prospect.serviceRequested}". ¿Tiene alguna pregunta o desea agendar una visita?`;
    shareViaWhatsApp(prospect.phone, msg);
  };

  return (
    <div className="animate-fade-in">
      <AppHeader
        title="Prospectos"
        subtitle="Seguimiento de clientes potenciales"
      />

      <div className="max-w-lg mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-3">
            <TabsList
              data-ocid="prospectos.tab"
              className="w-full bg-muted/50 rounded-xl h-auto p-1 grid grid-cols-4 gap-0.5"
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
              <div className="space-y-3" data-ocid="prospectos.loading_state">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="py-12 text-center"
                data-ocid="prospectos.empty_state"
              >
                <UserSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">
                  Sin prospectos
                </p>
                <p className="text-muted-foreground text-sm">
                  No hay prospectos en esta categoría
                </p>
              </div>
            ) : (
              filtered.map((prospect, idx) => (
                <button
                  type="button"
                  key={String(prospect.id)}
                  data-ocid={`prospectos.item.${idx + 1}`}
                  onClick={() => setSelectedProspect(prospect)}
                  className="w-full text-left bg-white rounded-xl shadow-card border border-border hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99] p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {prospect.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {prospect.phone}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE_CLASSES[prospect.status]}`}
                    >
                      {STATUS_LABELS[prospect.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {prospect.serviceRequested}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fecha: {formatDate(prospect.quoteDate)}
                  </p>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB */}
      <button
        type="button"
        data-ocid="prospectos.add_button"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-fab hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Nuevo prospecto"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Create dialog */}
      {showCreate && (
        <CreateProspectDialog
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          isPending={createProspect.isPending}
        />
      )}

      {/* Detail dialog */}
      {selectedProspect && (
        <ProspectDetailDialog
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onStatusChange={handleStatusChange}
          onWhatsApp={handleWhatsApp}
          onDelete={(id) => setDeleteId(id)}
          isPending={updateStatus.isPending}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent
          data-ocid="prospectos.dialog"
          className="max-w-sm mx-4 rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar prospecto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="prospectos.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="prospectos.confirm_button"
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

function CreateProspectDialog({
  onClose,
  onCreate,
  isPending,
}: {
  onClose: () => void;
  onCreate: (data: Partial<Prospect>) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    serviceRequested: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(form as Partial<Prospect>);
    setForm({
      name: "",
      phone: "",
      address: "",
      serviceRequested: "",
      notes: "",
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="prospectos.create.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Nuevo Prospecto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm">Nombre *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre completo"
              className="mt-1 h-11"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Teléfono</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="8888-8888"
              className="mt-1 h-11"
              type="tel"
            />
          </div>
          <div>
            <Label className="text-sm">Dirección</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="San José, Barrio..."
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label className="text-sm">Servicio solicitado</Label>
            <Textarea
              value={form.serviceRequested}
              onChange={(e) =>
                setForm({ ...form, serviceRequested: e.target.value })
              }
              placeholder="Describe el servicio que solicita..."
              className="mt-1 min-h-[70px] resize-none"
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
              data-ocid="prospectos.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="prospectos.submit_button"
              className="rounded-xl"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProspectDetailDialog({
  prospect,
  onClose,
  onStatusChange,
  onWhatsApp,
  onDelete,
  isPending,
}: {
  prospect: Prospect;
  onClose: () => void;
  onStatusChange: (prospect: Prospect, status: ProspectStatus) => Promise<void>;
  onWhatsApp: (prospect: Prospect) => void;
  onDelete: (id: bigint) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="prospectos.detail.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">{prospect.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-green-pale rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Estado:</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE_CLASSES[prospect.status]}`}
              >
                {STATUS_LABELS[prospect.status]}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Teléfono:</span>
              <p className="text-sm font-medium">{prospect.phone || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Dirección:</span>
              <p className="text-sm">{prospect.address || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Servicio solicitado:
              </span>
              <p className="text-sm">{prospect.serviceRequested || "—"}</p>
            </div>
            {prospect.notes && (
              <div>
                <span className="text-xs text-muted-foreground">Notas:</span>
                <p className="text-sm italic">{prospect.notes}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Cambiar estado:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ProspectStatus)
                .filter((s) => s !== prospect.status)
                .map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => onStatusChange(prospect, status)}
                    className="rounded-xl text-xs h-9"
                  >
                    {STATUS_LABELS[status]}
                  </Button>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              data-ocid="prospectos.detail.whatsapp_button"
              onClick={() => onWhatsApp(prospect)}
              className="flex-1 rounded-xl gap-2 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(prospect.id)}
              className="rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              data-ocid="prospectos.delete_button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
