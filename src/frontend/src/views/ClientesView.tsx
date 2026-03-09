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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Phone, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import { useCreateClient, useGetAllClients } from "../hooks/useQueries";
import type { ViewName } from "../types";
import { getTodayStr } from "../utils/format";

interface ClientesViewProps {
  onNavigate: (view: ViewName, clientId?: string) => void;
}

export function ClientesView({ onNavigate }: ClientesViewProps) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: clients, isLoading } = useGetAllClients();
  const createClient = useCreateClient();

  const filtered = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async (formData: Partial<Client>) => {
    if (!formData.name?.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: formData.name,
      phone: formData.phone ?? "",
      address: formData.address ?? "",
      mapLocation: formData.mapLocation ?? "",
      notes: formData.notes ?? "",
      isActive: true,
      createdAt: BigInt(Date.now()),
    };
    try {
      await createClient.mutateAsync(newClient);
      toast.success("Cliente creado exitosamente");
      setShowCreate(false);
    } catch {
      toast.error("Error al crear el cliente");
    }
  };

  return (
    <div className="animate-fade-in">
      <AppHeader title="Clientes" subtitle="Gestión de clientes" />

      <div className="px-4 py-4 pb-24 max-w-lg mx-auto space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="clientes.search_input"
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl border-border"
          />
        </div>

        {/* Client list */}
        {isLoading ? (
          <div className="space-y-3" data-ocid="clientes.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="clientes.empty_state"
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <div className="w-16 h-16 bg-green-pale rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-primary/50" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">
                {search ? "Sin resultados" : "Sin clientes aún"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {search
                  ? "Intenta con otro término de búsqueda"
                  : "Agrega tu primer cliente con el botón +"}
              </p>
            </div>
          </div>
        ) : (
          <div data-ocid="clientes.list" className="space-y-2.5">
            {filtered.map((client, idx) => (
              <button
                type="button"
                key={client.id}
                data-ocid={`clientes.item.${idx + 1}`}
                onClick={() => onNavigate("cliente_detalle", client.id)}
                className="w-full text-left bg-white rounded-xl shadow-card border border-border hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-base">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {client.name}
                      </p>
                      {client.phone && (
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </p>
                      )}
                      {client.address && (
                        <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={client.isActive ? "default" : "secondary"}
                    className="text-[10px] flex-shrink-0"
                  >
                    {client.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        data-ocid="clientes.add_button"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-fab hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Agregar cliente"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Create dialog */}
      <CreateClientDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
        isPending={createClient.isPending}
      />
    </div>
  );
}

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Client>) => Promise<void>;
  isPending: boolean;
}

function CreateClientDialog({
  open,
  onClose,
  onCreate,
  isPending,
}: CreateClientDialogProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    mapLocation: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(form);
    setForm({ name: "", phone: "", address: "", mapLocation: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="clientes.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Nuevo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-sm">
              Nombre *
            </Label>
            <Input
              id="name"
              data-ocid="clientes.input"
              placeholder="Nombre completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 h-11"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm">
              Teléfono
            </Label>
            <Input
              id="phone"
              placeholder="8888-8888"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 h-11"
              type="tel"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-sm">
              Dirección
            </Label>
            <Textarea
              id="address"
              placeholder="San José, Barrio..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 min-h-[70px] resize-none"
            />
          </div>
          <div>
            <Label htmlFor="mapLocation" className="text-sm">
              Link de mapa (Google Maps)
            </Label>
            <Input
              id="mapLocation"
              placeholder="https://maps.google.com/..."
              value={form.mapLocation}
              onChange={(e) =>
                setForm({ ...form, mapLocation: e.target.value })
              }
              className="mt-1 h-11"
              type="url"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-sm">
              Notas
            </Label>
            <Textarea
              id="notes"
              placeholder="Observaciones del cliente..."
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
              data-ocid="clientes.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="clientes.submit_button"
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
