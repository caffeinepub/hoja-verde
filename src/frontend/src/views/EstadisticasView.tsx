import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Briefcase,
  CheckCircle,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { FinancialEntryType, JobStatus, QuoteStatus } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import {
  useGetAllClients,
  useGetAllJobs,
  useGetAllQuotes,
  useGetFinancialEntries,
} from "../hooks/useQueries";
import { formatColones, getTodayStr } from "../utils/format";

export function EstadisticasView() {
  const today = getTodayStr();
  const currentMonth = today.slice(0, 7);

  const { data: clients, isLoading: clientsLoading } = useGetAllClients();
  const { data: jobs, isLoading: jobsLoading } = useGetAllJobs();
  const { data: quotes, isLoading: quotesLoading } = useGetAllQuotes();
  const { data: financial, isLoading: finLoading } = useGetFinancialEntries();

  const isLoading =
    clientsLoading || jobsLoading || quotesLoading || finLoading;

  const stats = useMemo(() => {
    const completedJobs = (jobs ?? []).filter(
      (j) =>
        j.status === JobStatus.completed && j.date.startsWith(currentMonth),
    );
    const activeClients = (clients ?? []).filter((c) => c.isActive);
    const sentQuotes = (quotes ?? []).filter(
      (q) => q.status === QuoteStatus.sent || q.status === QuoteStatus.accepted,
    );
    const acceptedJobs = (jobs ?? []).filter(
      (j) => j.status !== JobStatus.cancelled,
    );

    const monthlyIncome = (financial ?? [])
      .filter(
        (e) =>
          e.entryType === FinancialEntryType.income &&
          e.date.startsWith(currentMonth),
      )
      .reduce((s, e) => s + e.amount, BigInt(0));

    const monthlyExpenses = (financial ?? [])
      .filter(
        (e) =>
          e.entryType === FinancialEntryType.expense &&
          e.date.startsWith(currentMonth),
      )
      .reduce((s, e) => s + e.amount, BigInt(0));

    const totalJobsMonth = (jobs ?? []).filter((j) =>
      j.date.startsWith(currentMonth),
    );

    return {
      completedJobs: completedJobs.length,
      activeClients: activeClients.length,
      sentQuotes: sentQuotes.length,
      acceptedJobs: acceptedJobs.length,
      monthlyIncome,
      monthlyExpenses,
      profit: monthlyIncome - monthlyExpenses,
      totalJobsMonth: totalJobsMonth.length,
    };
  }, [clients, jobs, quotes, financial, currentMonth]);

  const statCards = [
    {
      label: "Trabajos completados",
      sublabel: "Este mes",
      value: String(stats.completedJobs),
      Icon: CheckCircle,
      color: "from-primary/10 to-primary/5",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "Clientes activos",
      sublabel: "Total",
      value: String(stats.activeClients),
      Icon: Users,
      color: "from-accent/20 to-accent/10",
      iconColor: "text-accent-foreground",
      iconBg: "bg-accent/20",
    },
    {
      label: "Cotizaciones enviadas",
      sublabel: "Activas",
      value: String(stats.sentQuotes),
      Icon: FileText,
      color: "from-blue-50 to-blue-50/50",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Trabajos en curso",
      sublabel: "Este mes",
      value: String(stats.totalJobsMonth),
      Icon: Briefcase,
      color: "from-purple-50 to-purple-50/50",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="animate-fade-in">
      <AppHeader title="Estadísticas" subtitle="Resumen del negocio" />

      <div className="px-4 py-4 pb-24 max-w-lg mx-auto space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(
            ({ label, sublabel, value, Icon, color, iconColor, iconBg }) => (
              <Card
                key={label}
                className={`shadow-card bg-gradient-to-br ${color}`}
              >
                <CardContent className="p-4">
                  <div
                    className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12 rounded mb-1" />
                  ) : (
                    <p className="font-display font-bold text-3xl text-foreground leading-none mb-1">
                      {value}
                    </p>
                  )}
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {sublabel}
                  </p>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        {/* Financial summary */}
        <section>
          <h2 className="font-display font-semibold text-foreground text-base mb-3 px-1">
            Resumen Financiero Este Mes
          </h2>
          <Card className="shadow-card overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-green-gradient p-4">
                <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
                  Ganancia neta
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32 rounded mt-1 bg-white/20" />
                ) : (
                  <p className="font-display font-bold text-white text-3xl mt-1">
                    {formatColones(stats.profit)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Ingresos
                    </span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 rounded" />
                  ) : (
                    <p className="font-bold text-foreground">
                      {formatColones(stats.monthlyIncome)}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Gastos
                    </span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 rounded" />
                  ) : (
                    <p className="font-bold text-foreground">
                      {formatColones(stats.monthlyExpenses)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Jobs breakdown */}
        <section>
          <h2 className="font-display font-semibold text-foreground text-base mb-3 px-1">
            Trabajos Este Mes
          </h2>
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              {[
                {
                  label: "Total programados",
                  value: stats.totalJobsMonth,
                  color: "bg-primary",
                },
                {
                  label: "Completados",
                  value: stats.completedJobs,
                  color: "bg-accent-foreground",
                },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{label}</span>
                    <span className="font-bold text-sm text-foreground">
                      {value}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{
                        width:
                          stats.totalJobsMonth > 0
                            ? `${Math.round((value / stats.totalJobsMonth) * 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
