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
import {
  Briefcase,
  Edit,
  ExternalLink,
  Leaf,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { JobStatus } from "../backend.d";
import type { Client, Garden, MaintenanceSchedule } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import {
  useCreateOrUpdateGarden,
  useCreateOrUpdateSchedule,
  useGetAllClients,
  useGetAllJobs,
  useGetAllSchedules,
  useGetGarden,
  useUpdateClient,
} from "../hooks/useQueries";
import {
  calculateNextDate,
  formatColones,
  formatDate,
  getTodayStr,
} from "../utils/format";

interface ClienteDetalleViewProps {
  clientId: string;
  onBack: () => void;
}

const JOB_STATUS_COLORS: Record<string, string> = {
  scheduled: "badge-scheduled",
  inProgress: "badge-in-progress",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

const JOB_STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  inProgress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function ClienteDetalleView({
  clientId,
  onBack,
}: ClienteDetalleViewProps) {
  const [editingInfo, setEditingInfo] = useState(false);

  const { data: clients, isLoading: clientsLoading } = useGetAllClients();
  const { data: garden, isLoading: gardenLoading } = useGetGarden(clientId);
  const { data: allSchedules } = useGetAllSchedules();
  const { data: allJobs } = useGetAllJobs();
  const updateClient = useUpdateClient();

  const client = clients?.find((c) => c.id === clientId);
  const schedule = allSchedules?.find((s) => s.clientId === clientId);
  const clientJobs = (allJobs ?? []).filter((j) => j.clientId === clientId);

  if (clientsLoading) {
    return (
      <div className="animate-fade-in">
        <AppHeader title="Cliente" onBack={onBack} />
        <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="animate-fade-in">
        <AppHeader title="Cliente" onBack={onBack} />
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">Cliente no encontrado</p>
        </div>
      </div>
    );
  }

  const handleUpdateClient = async (updates: Partial<Client>) => {
    try {
      await updateClient.mutateAsync({ ...client, ...updates });
      toast.success("Cliente actualizado");
      setEditingInfo(false);
    } catch {
      toast.error("Error al actualizar el cliente");
    }
  };

  return (
    <div className="animate-fade-in">
      <AppHeader
        title={client.name}
        subtitle={client.address || "Sin dirección"}
        onBack={onBack}
        rightContent={
          <button
            type="button"
            data-ocid="cliente_detalle.edit_button"
            onClick={() => setEditingInfo(true)}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Edit className="w-4 h-4 text-white" />
          </button>
        }
      />

      {/* Quick info bar */}
      <div className="bg-white border-b border-border px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-4">
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-1.5 text-primary text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              {client.phone}
            </a>
          )}
          {client.mapLocation && (
            <a
              href={client.mapLocation}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              Ver mapa
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Badge
            variant={client.isActive ? "default" : "secondary"}
            className="ml-auto text-xs"
          >
            {client.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-24">
        <Tabs defaultValue="info">
          <TabsList
            data-ocid="cliente_detalle.tab"
            className="w-full rounded-none border-b border-border bg-white h-auto p-0"
          >
            {[
              { value: "info", label: "Info", Icon: Edit },
              { value: "jardin", label: "Jardín", Icon: Leaf },
              { value: "mantenimiento", label: "Mantenim.", Icon: Wrench },
              { value: "trabajos", label: "Trabajos", Icon: Briefcase },
            ].map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 gap-1 py-3 rounded-none text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Info tab */}
          <TabsContent value="info" className="p-4 space-y-3">
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <InfoRow label="Nombre" value={client.name} />
                <InfoRow label="Teléfono" value={client.phone} />
                <InfoRow label="Dirección" value={client.address} />
                {client.notes && <InfoRow label="Notas" value={client.notes} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Garden tab */}
          <TabsContent value="jardin" className="p-4">
            <GardenTab
              clientId={clientId}
              garden={garden ?? null}
              loading={gardenLoading}
            />
          </TabsContent>

          {/* Maintenance tab */}
          <TabsContent value="mantenimiento" className="p-4">
            <MaintenanceTab clientId={clientId} schedule={schedule ?? null} />
          </TabsContent>

          {/* Jobs tab */}
          <TabsContent value="trabajos" className="p-4 space-y-2.5">
            {clientJobs.length === 0 ? (
              <div className="py-10 text-center">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  Sin trabajos registrados
                </p>
              </div>
            ) : (
              clientJobs.map((job) => (
                <Card key={String(job.id)} className="shadow-card">
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {job.serviceDescription}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(job.date)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${JOB_STATUS_COLORS[job.status]}`}
                        >
                          {JOB_STATUS_LABELS[job.status]}
                        </span>
                        <span className="text-xs font-medium text-primary">
                          {formatColones(job.price)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit client dialog */}
      {editingInfo && (
        <EditClientDialog
          client={client}
          onClose={() => setEditingInfo(false)}
          onSave={handleUpdateClient}
          isPending={updateClient.isPending}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-foreground mt-0.5">{value || "—"}</p>
    </div>
  );
}

function GardenTab({
  clientId,
  garden,
  loading,
}: {
  clientId: string;
  garden: Garden | null;
  loading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const createOrUpdate = useCreateOrUpdateGarden();

  const [form, setForm] = useState<Partial<Garden>>(
    garden ?? {
      clientId,
      sizeM2: 0,
      grassType: "",
      terrainType: "",
      toolsRequired: "",
      avgWorkTimeHours: 0,
      photoUrls: [],
      observations: "",
    },
  );

  const handleSave = async () => {
    try {
      await createOrUpdate.mutateAsync({
        clientId,
        sizeM2: Number(form.sizeM2 ?? 0),
        grassType: form.grassType ?? "",
        terrainType: form.terrainType ?? "",
        toolsRequired: form.toolsRequired ?? "",
        avgWorkTimeHours: Number(form.avgWorkTimeHours ?? 0),
        photoUrls: form.photoUrls ?? [],
        observations: form.observations ?? "",
      });
      toast.success("Jardín guardado");
      setEditing(false);
    } catch {
      toast.error("Error al guardar el jardín");
    }
  };

  if (loading) return <Skeleton className="h-64 rounded-xl" />;

  if (!garden && !editing) {
    return (
      <div className="py-10 text-center">
        <Leaf className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground mb-1">Sin perfil de jardín</p>
        <p className="text-muted-foreground text-sm mb-4">
          Agrega información sobre el jardín de este cliente
        </p>
        <Button onClick={() => setEditing(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" />
          Agregar jardín
        </Button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Tamaño (m²)</Label>
            <Input
              type="number"
              value={form.sizeM2}
              onChange={(e) =>
                setForm({ ...form, sizeM2: Number(e.target.value) })
              }
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label className="text-xs">Tiempo promedio (h)</Label>
            <Input
              type="number"
              step="0.5"
              value={form.avgWorkTimeHours}
              onChange={(e) =>
                setForm({ ...form, avgWorkTimeHours: Number(e.target.value) })
              }
              className="mt-1 h-11"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Tipo de grama</Label>
          <Input
            value={form.grassType}
            onChange={(e) => setForm({ ...form, grassType: e.target.value })}
            placeholder="Ej: San Agustín, Bermuda..."
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label className="text-xs">Tipo de terreno</Label>
          <Input
            value={form.terrainType}
            onChange={(e) => setForm({ ...form, terrainType: e.target.value })}
            placeholder="Ej: Plano, con pendiente..."
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label className="text-xs">Herramientas requeridas</Label>
          <Input
            value={form.toolsRequired}
            onChange={(e) =>
              setForm({ ...form, toolsRequired: e.target.value })
            }
            placeholder="Ej: Cortadora, bordeadora..."
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label className="text-xs">Observaciones</Label>
          <Textarea
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            placeholder="Notas especiales sobre el jardín..."
            className="mt-1 min-h-[80px] resize-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={createOrUpdate.isPending}
            className="flex-1 rounded-xl"
          >
            {createOrUpdate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Guardar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setForm(garden ?? {});
            setEditing(true);
          }}
          className="rounded-xl gap-1"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar
        </Button>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Tamaño" value={`${garden?.sizeM2} m²`} />
            <InfoRow
              label="Tiempo promedio"
              value={`${garden?.avgWorkTimeHours} horas`}
            />
          </div>
          <InfoRow label="Tipo de grama" value={garden?.grassType} />
          <InfoRow label="Tipo de terreno" value={garden?.terrainType} />
          <InfoRow label="Herramientas" value={garden?.toolsRequired} />
          {garden?.observations && (
            <InfoRow label="Observaciones" value={garden.observations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenanceTab({
  clientId,
  schedule,
}: {
  clientId: string;
  schedule: MaintenanceSchedule | null;
}) {
  const [editing, setEditing] = useState(false);
  const createOrUpdate = useCreateOrUpdateSchedule();
  const [frequency, setFrequency] = useState(
    schedule ? String(Number(schedule.frequencyDays)) : "15",
  );
  const [notes, setNotes] = useState(schedule?.notes ?? "");

  const handleSave = async () => {
    const freq = Number(frequency);
    const newSchedule: MaintenanceSchedule = {
      id: schedule?.id ?? `sched-${clientId}`,
      clientId,
      frequencyDays: BigInt(freq),
      lastDate: schedule?.lastDate ?? getTodayStr(),
      nextDate: calculateNextDate(schedule?.lastDate ?? getTodayStr(), freq),
      isActive: true,
      notes,
    };
    try {
      await createOrUpdate.mutateAsync(newSchedule);
      toast.success("Mantenimiento actualizado");
      setEditing(false);
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleMarkDone = async () => {
    if (!schedule) return;
    const freq = Number(schedule.frequencyDays);
    const today = getTodayStr();
    const updated: MaintenanceSchedule = {
      ...schedule,
      lastDate: today,
      nextDate: calculateNextDate(today, freq),
    };
    try {
      await createOrUpdate.mutateAsync(updated);
      toast.success("Último servicio actualizado");
    } catch {
      toast.error("Error al actualizar");
    }
  };

  if (!schedule && !editing) {
    return (
      <div className="py-10 text-center">
        <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground mb-1">
          Sin programa de mantenimiento
        </p>
        <p className="text-muted-foreground text-sm mb-4">
          Configura la frecuencia de mantenimiento
        </p>
        <Button onClick={() => setEditing(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" />
          Configurar
        </Button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Frecuencia</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="mt-1 h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Cada 7 días (semanal)</SelectItem>
              <SelectItem value="15">Cada 15 días (quincenal)</SelectItem>
              <SelectItem value="30">Cada 30 días (mensual)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Notas</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones del mantenimiento..."
            className="mt-1 min-h-[70px] resize-none"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={createOrUpdate.isPending}
            className="flex-1 rounded-xl"
          >
            {createOrUpdate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : null}
            Guardar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="shadow-card bg-accent/10 border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                Mantenimiento cada {Number(schedule!.frequencyDays)} días
              </p>
              <p className="text-xs text-muted-foreground">
                {Number(schedule!.frequencyDays) === 7
                  ? "Semanal"
                  : Number(schedule!.frequencyDays) === 15
                    ? "Quincenal"
                    : "Mensual"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Último
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {formatDate(schedule!.lastDate)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Próximo
              </p>
              <p className="text-sm font-medium text-primary mt-0.5">
                {formatDate(schedule!.nextDate)}
              </p>
            </div>
          </div>
          {schedule?.notes && (
            <p className="text-xs text-muted-foreground mt-2">
              {schedule.notes}
            </p>
          )}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setFrequency(String(Number(schedule!.frequencyDays)));
            setNotes(schedule?.notes ?? "");
            setEditing(true);
          }}
          className="flex-1 rounded-xl gap-1"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar
        </Button>
        <Button
          onClick={handleMarkDone}
          disabled={createOrUpdate.isPending}
          className="flex-1 rounded-xl gap-1"
        >
          {createOrUpdate.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wrench className="w-3.5 h-3.5" />
          )}
          Marcar hecho hoy
        </Button>
      </div>
    </div>
  );
}

interface EditClientDialogProps {
  client: Client;
  onClose: () => void;
  onSave: (updates: Partial<Client>) => Promise<void>;
  isPending: boolean;
}

function EditClientDialog({
  client,
  onClose,
  onSave,
  isPending,
}: EditClientDialogProps) {
  const [form, setForm] = useState({
    name: client.name,
    phone: client.phone,
    address: client.address,
    mapLocation: client.mapLocation,
    notes: client.notes,
    isActive: client.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="cliente_detalle.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm">Nombre *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 h-11"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Teléfono</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 h-11"
              type="tel"
            />
          </div>
          <div>
            <Label className="text-sm">Dirección</Label>
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 min-h-[70px] resize-none"
            />
          </div>
          <div>
            <Label className="text-sm">Link de mapa</Label>
            <Input
              value={form.mapLocation}
              onChange={(e) =>
                setForm({ ...form, mapLocation: e.target.value })
              }
              className="mt-1 h-11"
              type="url"
            />
          </div>
          <div>
            <Label className="text-sm">Notas</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1 min-h-[70px] resize-none"
            />
          </div>
          <DialogFooter className="gap-2 flex-row justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="cliente_detalle.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="cliente_detalle.save_button"
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
