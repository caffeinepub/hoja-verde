import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  FileText,
  Navigation,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
import { FinancialEntryType, JobStatus } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import { useGetAllJobs } from "../hooks/useQueries";
import { useGetUpcomingMaintenance } from "../hooks/useQueries";
import { useGetFinancialEntries } from "../hooks/useQueries";
import type { ViewName } from "../types";
import { formatColones, formatDateShort, getTodayStr } from "../utils/format";

interface DashboardViewProps {
  onNavigate: (view: ViewName, clientId?: string) => void;
}

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

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { data: allJobs, isLoading: jobsLoading } = useGetAllJobs();
  const { data: upcomingMaint, isLoading: maintLoading } =
    useGetUpcomingMaintenance(7);
  const { data: financialEntries, isLoading: finLoading } =
    useGetFinancialEntries();

  const today = getTodayStr();
  const currentMonth = today.slice(0, 7);

  const todayJobs = useMemo(
    () => (allJobs ?? []).filter((j) => j.date === today),
    [allJobs, today],
  );

  const monthlyIncome = useMemo(() => {
    if (!financialEntries) return BigInt(0);
    return financialEntries
      .filter(
        (e) =>
          e.entryType === FinancialEntryType.income &&
          e.date.startsWith(currentMonth),
      )
      .reduce((sum, e) => sum + e.amount, BigInt(0));
  }, [financialEntries, currentMonth]);

  const quickAccessItems: {
    label: string;
    view: ViewName;
    Icon: React.ElementType;
    color: string;
  }[] = [
    {
      label: "Clientes",
      view: "clientes",
      Icon: Users,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Cotizaciones",
      view: "cotizaciones",
      Icon: FileText,
      color: "bg-lime-50 text-lime-700",
    },
    {
      label: "Facturas",
      view: "facturas",
      Icon: Receipt,
      color: "bg-teal-50 text-teal-700",
    },
    {
      label: "Calendario",
      view: "calendario",
      Icon: Calendar,
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Finanzas",
      view: "finanzas",
      Icon: Wallet,
      color: "bg-emerald-50 text-emerald-800",
    },
    {
      label: "Rutas",
      view: "rutas",
      Icon: Navigation,
      color: "bg-lime-50 text-lime-800",
    },
  ];

  return (
    <div className="animate-fade-in">
      <AppHeader title="Hoja Verde" subtitle="Gestión de Jardines" showDate />

      <div className="px-4 py-4 pb-24 space-y-5 max-w-lg mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div data-ocid="dashboard.today_jobs_card">
            <StatCard
              label="Hoy"
              loading={jobsLoading}
              value={String(todayJobs.length)}
              sublabel="trabajos"
              icon={<Clock className="w-4 h-4" />}
              colorClass="from-primary/10 to-primary/5"
              iconColor="text-primary"
            />
          </div>
          <div data-ocid="dashboard.maintenance_card">
            <StatCard
              label="Esta semana"
              loading={maintLoading}
              value={String(upcomingMaint?.length ?? 0)}
              sublabel="mantenimientos"
              icon={<Wrench className="w-4 h-4" />}
              colorClass="from-accent/20 to-accent/10"
              iconColor="text-accent-foreground"
            />
          </div>
          <div data-ocid="dashboard.income_card">
            <StatCard
              label="Este mes"
              loading={finLoading}
              value={formatColones(monthlyIncome)}
              sublabel="ingresos"
              icon={<TrendingUp className="w-4 h-4" />}
              colorClass="from-secondary/50 to-secondary/20"
              iconColor="text-secondary-foreground"
              smallValue
            />
          </div>
        </div>

        {/* Quick access */}
        <section>
          <h2 className="font-display font-semibold text-foreground text-base mb-3 px-1">
            Acceso Rápido
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {quickAccessItems.map(({ label, view, Icon, color }) => (
              <button
                type="button"
                key={view}
                onClick={() => onNavigate(view)}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-card border border-border hover:border-primary/30 hover:shadow-md transition-all touch-target active:scale-95"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Today's jobs */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display font-semibold text-foreground text-base">
              Trabajos de Hoy
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("calendario")}
              className="text-primary text-sm font-medium"
            >
              Ver todos
            </button>
          </div>

          {jobsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : todayJobs.length === 0 ? (
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No hay trabajos programados para hoy
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayJobs.map((job, idx) => (
                <Card
                  key={String(job.id)}
                  className="shadow-card border-border overflow-hidden"
                  data-ocid={`dashboard.today_jobs_card.item.${idx + 1}`}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {job.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {job.serviceDescription}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
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
              ))}
            </div>
          )}
        </section>

        {/* Upcoming maintenance */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display font-semibold text-foreground text-base">
              Próximos Mantenimientos
            </h2>
          </div>

          {maintLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : !upcomingMaint || upcomingMaint.length === 0 ? (
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <Wrench className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Sin mantenimientos próximos esta semana
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingMaint.slice(0, 5).map((sched, idx) => (
                <Card
                  key={sched.id}
                  className="shadow-card border-border"
                  data-ocid={`dashboard.maintenance_card.item.${idx + 1}`}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {sched.clientId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cada {Number(sched.frequencyDays)} días
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        {formatDateShort(sched.nextDate)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  loading: boolean;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  colorClass: string;
  iconColor: string;
  smallValue?: boolean;
}

function StatCard({
  label,
  loading,
  value,
  sublabel,
  icon,
  colorClass,
  iconColor,
  smallValue = false,
}: StatCardProps) {
  return (
    <Card
      className={`shadow-card border-border bg-gradient-to-br ${colorClass} overflow-hidden`}
    >
      <CardContent className="p-3">
        <div className={`flex items-center gap-1.5 mb-1.5 ${iconColor}`}>
          {icon}
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
            {label}
          </span>
        </div>
        {loading ? (
          <Skeleton className="h-6 w-12 rounded" />
        ) : (
          <p
            className={`font-display font-bold text-foreground leading-none ${smallValue ? "text-sm" : "text-xl"}`}
          >
            {value}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">{sublabel}</p>
      </CardContent>
    </Card>
  );
}
