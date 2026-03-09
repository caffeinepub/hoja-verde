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
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { JobStatus } from "../backend.d";
import type { Job } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import {
  useCreateJob,
  useGetAllClients,
  useGetAllJobs,
  useGetAllSchedules,
} from "../hooks/useQueries";
import { formatColones, getTodayStr } from "../utils/format";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

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

export function CalendarioView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [showCreateJob, setShowCreateJob] = useState(false);

  const { data: jobs, isLoading: jobsLoading } = useGetAllJobs();
  const { data: schedules } = useGetAllSchedules();
  const { data: clients } = useGetAllClients();
  const createJob = useCreateJob();

  // Dates with events in current month
  const datesWithEvents = useMemo(() => {
    const set = new Set<string>();
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    for (const j of jobs ?? []) {
      if (j.date.startsWith(monthPrefix)) {
        set.add(j.date);
      }
    }
    for (const s of schedules ?? []) {
      if (s.nextDate.startsWith(monthPrefix)) {
        set.add(s.nextDate);
      }
    }
    return set;
  }, [jobs, schedules, currentYear, currentMonth]);

  // Events for selected date
  const selectedJobs = useMemo(
    () => (jobs ?? []).filter((j) => j.date === selectedDate),
    [jobs, selectedDate],
  );
  const selectedMaint = useMemo(
    () => (schedules ?? []).filter((s) => s.nextDate === selectedDate),
    [schedules, selectedDate],
  );

  // Calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleCreateJob = async (formData: Partial<Job>) => {
    if (!formData.clientName || !formData.serviceDescription) {
      toast.error("Complete todos los campos requeridos");
      return;
    }
    const client = clients?.find((c) => c.name === formData.clientName);
    const newJob: Job = {
      id: BigInt(Date.now()),
      clientId: client?.id ?? "",
      clientName: formData.clientName!,
      date: selectedDate,
      serviceDescription: formData.serviceDescription!,
      status: JobStatus.scheduled,
      notes: formData.notes ?? "",
      price: BigInt(formData.price ?? 0),
    };
    try {
      await createJob.mutateAsync(newJob);
      toast.success("Trabajo creado");
      setShowCreateJob(false);
    } catch {
      toast.error("Error al crear el trabajo");
    }
  };

  const todayStr = getTodayStr();

  return (
    <div className="animate-fade-in">
      <AppHeader title="Calendario" subtitle="Trabajos y mantenimientos" />

      <div className="px-4 py-4 pb-24 max-w-lg mx-auto space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={prevMonth}
            className="w-10 h-10 bg-white rounded-xl border border-border flex items-center justify-center shadow-card hover:border-primary/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="font-display font-bold text-lg text-foreground">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="w-10 h-10 bg-white rounded-xl border border-border flex items-center justify-center shadow-card hover:border-primary/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Calendar grid */}
        <Card className="shadow-card overflow-hidden">
          <CardContent className="p-3">
            {/* Day names */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-muted-foreground py-1"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`pad-${i + 1}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const hasEvent = datesWithEvents.has(dateStr);

                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                          ? "bg-accent/30 text-accent-foreground font-bold"
                          : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {day}
                    {hasEvent && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {hasEvent && isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected date events */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-display font-semibold text-foreground text-sm">
              {selectedDate === todayStr ? "Hoy" : selectedDate}
            </h3>
            <button
              type="button"
              data-ocid="calendario.add_button"
              onClick={() => setShowCreateJob(true)}
              className="flex items-center gap-1.5 text-primary text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nuevo trabajo
            </button>
          </div>

          {jobsLoading ? (
            <Skeleton
              className="h-24 rounded-xl"
              data-ocid="calendario.loading_state"
            />
          ) : (
            <div className="space-y-2.5">
              {selectedJobs.map((job, idx) => (
                <Card
                  key={String(job.id)}
                  className="shadow-card border-border"
                  data-ocid={`calendario.item.${idx + 1}`}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          <p className="font-semibold text-sm text-foreground truncate">
                            {job.clientName}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground ml-4">
                          {job.serviceDescription}
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
              ))}

              {selectedMaint.map((sched, idx) => (
                <Card
                  key={sched.id}
                  className="shadow-card border-accent/30 bg-accent/5"
                  data-ocid={`calendario.maintenance.item.${idx + 1}`}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-foreground rounded-full" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          Mantenimiento - {sched.clientId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cada {Number(sched.frequencyDays)} días
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Mantenimiento
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedJobs.length === 0 && selectedMaint.length === 0 && (
                <div
                  className="py-8 text-center"
                  data-ocid="calendario.empty_state"
                >
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Sin eventos para esta fecha
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create job dialog */}
      {showCreateJob && (
        <CreateJobDialog
          selectedDate={selectedDate}
          clients={clients ?? []}
          onClose={() => setShowCreateJob(false)}
          onCreate={handleCreateJob}
          isPending={createJob.isPending}
        />
      )}
    </div>
  );
}

function CreateJobDialog({
  selectedDate,
  clients,
  onClose,
  onCreate,
  isPending,
}: {
  selectedDate: string;
  clients: { id: string; name: string }[];
  onClose: () => void;
  onCreate: (data: Partial<Job>) => Promise<void>;
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
    await onCreate({
      ...form,
      price: BigInt(Number(form.price) || 0),
    });
    setForm({ clientName: "", serviceDescription: "", price: "", notes: "" });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="calendario.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Nuevo Trabajo</DialogTitle>
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
            <Label className="text-sm">Fecha</Label>
            <Input
              value={selectedDate}
              disabled
              className="mt-1 h-11 bg-muted"
            />
          </div>
          <div>
            <Label className="text-sm">Descripción del servicio *</Label>
            <Textarea
              value={form.serviceDescription}
              onChange={(e) =>
                setForm({ ...form, serviceDescription: e.target.value })
              }
              placeholder="Corte de césped, bordeado..."
              className="mt-1 min-h-[70px] resize-none"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Precio (₡)</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="45000"
              className="mt-1 h-11"
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
              data-ocid="calendario.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="calendario.submit_button"
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
