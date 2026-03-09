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
import {
  Loader2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FinancialEntryType } from "../backend.d";
import type { FinancialEntry } from "../backend.d";
import { AppHeader } from "../components/AppHeader";
import {
  useCreateFinancialEntry,
  useDeleteFinancialEntry,
  useGetFinancialEntries,
} from "../hooks/useQueries";
import { formatColones, formatDate, getTodayStr } from "../utils/format";

const INCOME_CATEGORIES = [
  "Servicio de mantenimiento",
  "Poda y corte",
  "Diseño de jardín",
  "Instalación de riego",
  "Otros servicios",
];

const EXPENSE_CATEGORIES = [
  "Combustible",
  "Mantenimiento equipos",
  "Herramientas",
  "Fertilizantes y químicos",
  "Mano de obra",
  "Transporte",
  "Otros gastos",
];

export function FinanzasView() {
  const [activeTab, setActiveTab] = useState<string>(FinancialEntryType.income);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const { data: entries, isLoading } = useGetFinancialEntries();
  const createEntry = useCreateFinancialEntry();
  const deleteEntry = useDeleteFinancialEntry();

  const today = getTodayStr();
  const currentMonth = today.slice(0, 7);

  const incomeEntries = useMemo(
    () =>
      (entries ?? []).filter(
        (e) =>
          e.entryType === FinancialEntryType.income &&
          e.date.startsWith(currentMonth),
      ),
    [entries, currentMonth],
  );

  const expenseEntries = useMemo(
    () =>
      (entries ?? []).filter(
        (e) =>
          e.entryType === FinancialEntryType.expense &&
          e.date.startsWith(currentMonth),
      ),
    [entries, currentMonth],
  );

  const totalIncome = incomeEntries.reduce((s, e) => s + e.amount, BigInt(0));
  const totalExpenses = expenseEntries.reduce(
    (s, e) => s + e.amount,
    BigInt(0),
  );
  const profit = totalIncome - totalExpenses;

  const filteredEntries =
    activeTab === FinancialEntryType.income ? incomeEntries : expenseEntries;

  const handleCreate = async (form: {
    entryType: string;
    category: string;
    description: string;
    amount: string;
    date: string;
  }) => {
    if (!form.amount || !form.category) {
      toast.error("Complete todos los campos requeridos");
      return;
    }
    const newEntry: FinancialEntry = {
      id: BigInt(Date.now()),
      entryType: form.entryType as FinancialEntryType,
      amount: BigInt(Number(form.amount)),
      category: form.category,
      description: form.description,
      date: form.date,
    };
    try {
      await createEntry.mutateAsync(newEntry);
      toast.success("Movimiento registrado");
      setShowCreate(false);
    } catch {
      toast.error("Error al registrar movimiento");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEntry.mutateAsync(deleteId);
      toast.success("Movimiento eliminado");
      setDeleteId(null);
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="animate-fade-in">
      <AppHeader title="Finanzas" subtitle="Control financiero" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="shadow-card bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wide">
                  Ingresos
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-16 rounded" />
              ) : (
                <p className="font-bold text-foreground text-sm leading-none">
                  {formatColones(totalIncome)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-to-br from-destructive/10 to-destructive/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[10px] text-destructive font-semibold uppercase tracking-wide">
                  Gastos
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-16 rounded" />
              ) : (
                <p className="font-bold text-foreground text-sm leading-none">
                  {formatColones(totalExpenses)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card
            className={`shadow-card ${
              profit >= 0
                ? "bg-gradient-to-br from-accent/30 to-accent/10"
                : "bg-gradient-to-br from-destructive/10 to-destructive/5"
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <Wallet
                  className={`w-3.5 h-3.5 ${profit >= 0 ? "text-accent-foreground" : "text-destructive"}`}
                />
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide ${profit >= 0 ? "text-accent-foreground" : "text-destructive"}`}
                >
                  Ganancia
                </span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-16 rounded" />
              ) : (
                <p
                  className={`font-bold text-sm leading-none ${profit >= 0 ? "text-foreground" : "text-destructive"}`}
                >
                  {formatColones(profit)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            data-ocid="finanzas.tab"
            className="w-full bg-muted/50 rounded-xl h-auto p-1 grid grid-cols-2 gap-1"
          >
            <TabsTrigger
              value={FinancialEntryType.income}
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs py-2"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Ingresos
            </TabsTrigger>
            <TabsTrigger
              value={FinancialEntryType.expense}
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-xs py-2"
            >
              <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
              Gastos
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="pb-24 mt-3 space-y-2.5">
            {isLoading ? (
              <div className="space-y-2.5" data-ocid="finanzas.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div
                className="py-12 text-center"
                data-ocid="finanzas.empty_state"
              >
                <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">
                  Sin{" "}
                  {activeTab === FinancialEntryType.income
                    ? "ingresos"
                    : "gastos"}{" "}
                  este mes
                </p>
              </div>
            ) : (
              filteredEntries.map((entry, idx) => (
                <div
                  key={String(entry.id)}
                  data-ocid={`finanzas.item.${idx + 1}`}
                  className="bg-white rounded-xl shadow-card border border-border p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          entry.entryType === FinancialEntryType.income
                            ? "bg-primary/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {entry.entryType === FinancialEntryType.income ? (
                          <TrendingUp className="w-4 h-4 text-primary" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {entry.category}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`font-bold text-sm ${
                          entry.entryType === FinancialEntryType.income
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {entry.entryType === FinancialEntryType.income
                          ? "+"
                          : "-"}
                        {formatColones(entry.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteId(entry.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        data-ocid="finanzas.delete_button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB */}
      <button
        type="button"
        data-ocid="finanzas.add_button"
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-fab hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Nuevo movimiento"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Create dialog */}
      {showCreate && (
        <CreateEntryDialog
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          isPending={createEntry.isPending}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent
          data-ocid="finanzas.dialog"
          className="max-w-sm mx-4 rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar movimiento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="finanzas.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="finanzas.confirm_button"
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

function CreateEntryDialog({
  onClose,
  onCreate,
  isPending,
}: {
  onClose: () => void;
  onCreate: (data: {
    entryType: string;
    category: string;
    description: string;
    amount: string;
    date: string;
  }) => Promise<void>;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    entryType: FinancialEntryType.income,
    category: "",
    description: "",
    amount: "",
    date: getTodayStr(),
  });

  const categories =
    form.entryType === FinancialEntryType.income
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(form);
    setForm({
      entryType: FinancialEntryType.income,
      category: "",
      description: "",
      amount: "",
      date: getTodayStr(),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="finanzas.create.dialog"
        className="max-w-sm mx-4 rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Nuevo Movimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm">Tipo *</Label>
            <Select
              value={form.entryType}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  entryType: v as FinancialEntryType,
                  category: "",
                })
              }
            >
              <SelectTrigger
                data-ocid="finanzas.select"
                className="mt-1 h-11 rounded-xl"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FinancialEntryType.income}>
                  Ingreso
                </SelectItem>
                <SelectItem value={FinancialEntryType.expense}>
                  Gasto
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Categoría *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger className="mt-1 h-11 rounded-xl">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Descripción</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Detalles del movimiento..."
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label className="text-sm">Monto (₡) *</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="15000"
              className="mt-1 h-11"
              required
            />
          </div>
          <div>
            <Label className="text-sm">Fecha *</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 h-11"
              required
            />
          </div>
          <DialogFooter className="gap-2 flex-row justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="finanzas.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="finanzas.submit_button"
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
