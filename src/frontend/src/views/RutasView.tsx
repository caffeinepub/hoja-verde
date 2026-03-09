import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, MessageCircle, Navigation, User, Wrench } from "lucide-react";
import { useMemo } from "react";
import { JobStatus } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import { useGetAllClients, useGetAllJobs } from "../hooks/useQueries";
import {
  formatColones,
  formatTodaySpanish,
  getTodayStr,
  shareViaWhatsApp,
} from "../utils/format";

const JOB_STATUS_LABELS: Record<string, string> = {
  scheduled: "Programado",
  inProgress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

const JOB_STATUS_COLORS: Record<string, string> = {
  scheduled: "badge-scheduled",
  inProgress: "badge-in-progress",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export function RutasView() {
  const today = getTodayStr();
  const { data: jobs, isLoading: jobsLoading } = useGetAllJobs();
  const { data: clients, isLoading: clientsLoading } = useGetAllClients();

  const isLoading = jobsLoading || clientsLoading;

  const todayRoute = useMemo(() => {
    const todayJobs = (jobs ?? [])
      .filter((j) => j.date === today && j.status !== JobStatus.cancelled)
      .sort((a, b) => {
        const clientA = clients?.find((c) => c.id === a.clientId);
        const clientB = clients?.find((c) => c.id === b.clientId);
        const addrA = clientA?.address ?? a.clientName;
        const addrB = clientB?.address ?? b.clientName;
        return addrA.localeCompare(addrB);
      });

    return todayJobs.map((job) => {
      const client = clients?.find((c) => c.id === job.clientId);
      return { job, client };
    });
  }, [jobs, clients, today]);

  const handleSendToWorker = (
    clientName: string,
    address: string,
    service: string,
    mapLocation: string,
    phone: string,
  ) => {
    const mapLink =
      mapLocation ||
      `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    const msg = `🌿 *Trabajo Hoja Verde*\n\n👤 *Cliente:* ${clientName}\n📍 *Dirección:* ${address}\n🔧 *Servicio:* ${service}\n\n📌 Ubicación: ${mapLink}\n\n✅ Presentarse en buenas condiciones y con los equipos necesarios.`;
    shareViaWhatsApp(phone, msg);
  };

  return (
    <div className="animate-fade-in">
      <AppHeader
        title="Ruta de Hoy"
        subtitle="Trabajos optimizados por ubicación"
      />

      <div className="px-4 py-4 pb-24 max-w-lg mx-auto space-y-4">
        {/* Today info */}
        <div className="bg-green-gradient rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-base capitalize">
                {formatTodaySpanish().split(",")[0]}
              </p>
              <p className="text-white/80 text-sm">
                {todayRoute.length}{" "}
                {todayRoute.length === 1 ? "trabajo" : "trabajos"} programados
              </p>
            </div>
          </div>
        </div>

        {/* Route list */}
        {isLoading ? (
          <div className="space-y-3" data-ocid="rutas.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : todayRoute.length === 0 ? (
          <div className="py-12 text-center" data-ocid="rutas.empty_state">
            <Navigation className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground mb-1">Sin trabajos hoy</p>
            <p className="text-muted-foreground text-sm">
              No hay trabajos programados para hoy
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayRoute.map(({ job, client }, idx) => (
              <div
                key={String(job.id)}
                data-ocid={`rutas.item.${idx + 1}`}
                className="bg-white rounded-xl shadow-card border border-border overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Number badge */}
                  <div className="bg-green-gradient flex items-center justify-center w-12 flex-shrink-0">
                    <span className="font-display font-bold text-white text-lg">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="flex-1 p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <p className="font-semibold text-sm text-foreground truncate">
                            {job.clientName}
                          </p>
                        </div>
                        <div className="flex items-start gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-snug">
                            {client?.address ?? "Sin dirección"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${JOB_STATUS_COLORS[job.status]}`}
                      >
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 mb-3">
                      <Wrench className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground line-clamp-2">
                        {job.serviceDescription}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-sm">
                        {formatColones(job.price)}
                      </span>
                      <Button
                        data-ocid={`rutas.send_worker_button.${idx + 1}`}
                        size="sm"
                        onClick={() =>
                          handleSendToWorker(
                            job.clientName,
                            client?.address ?? "",
                            job.serviceDescription,
                            client?.mapLocation ?? "",
                            "", // Worker phone - opens generic WhatsApp
                          )
                        }
                        className="rounded-xl gap-1.5 bg-green-600 hover:bg-green-700 h-8 text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Enviar a trabajador
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Route summary */}
        {todayRoute.length > 0 && (
          <Card className="shadow-card bg-green-pale">
            <CardContent className="p-4">
              <p className="font-semibold text-foreground text-sm mb-2">
                Resumen de la ruta
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total trabajos
                  </p>
                  <p className="font-bold text-foreground">
                    {todayRoute.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Ingresos estimados
                  </p>
                  <p className="font-bold text-primary">
                    {formatColones(
                      todayRoute.reduce(
                        (s, { job }) => s + job.price,
                        BigInt(0),
                      ),
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
