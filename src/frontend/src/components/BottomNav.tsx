import {
  BarChart3,
  Calendar,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Navigation,
  Receipt,
  UserSearch,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ViewName } from "../types";

interface BottomNavProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
}

const PRIMARY_TABS: {
  view: ViewName;
  label: string;
  Icon: React.ElementType;
}[] = [
  { view: "dashboard", label: "Inicio", Icon: LayoutDashboard },
  { view: "clientes", label: "Clientes", Icon: Users },
  { view: "calendario", label: "Calendario", Icon: Calendar },
  { view: "cotizaciones", label: "Cotizaciones", Icon: FileText },
];

const MORE_ITEMS: { view: ViewName; label: string; Icon: React.ElementType }[] =
  [
    { view: "facturas", label: "Facturas", Icon: Receipt },
    { view: "prospectos", label: "Prospectos", Icon: UserSearch },
    { view: "finanzas", label: "Finanzas", Icon: Wallet },
    { view: "estadisticas", label: "Estadísticas", Icon: BarChart3 },
    { view: "rutas", label: "Rutas", Icon: Navigation },
  ];

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = MORE_ITEMS.some((item) => item.view === activeView);

  const handleNavigate = (view: ViewName) => {
    onNavigate(view);
    setShowMore(false);
  };

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setShowMore(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowMore(false)}
        />
      )}

      {/* More menu */}
      {showMore && (
        <div className="fixed bottom-[72px] left-0 right-0 z-40 max-w-lg mx-auto px-3">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-display font-semibold text-foreground text-sm">
                Más opciones
              </span>
              <button
                type="button"
                onClick={() => setShowMore(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 p-3">
              {MORE_ITEMS.map(({ view, label, Icon }) => (
                <button
                  type="button"
                  key={view}
                  onClick={() => handleNavigate(view)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors touch-target ${
                    activeView === view
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border pb-safe">
        <div className="max-w-lg mx-auto flex items-stretch">
          {PRIMARY_TABS.map(({ view, label, Icon }, idx) => {
            const isActive = activeView === view;
            const ocid =
              idx === 0
                ? "nav.dashboard_link"
                : idx === 1
                  ? "nav.clientes_link"
                  : idx === 2
                    ? "nav.calendario_link"
                    : "nav.cotizaciones_link";

            return (
              <button
                type="button"
                key={view}
                data-ocid={ocid}
                onClick={() => handleNavigate(view)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[60px] transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                    isActive ? "bg-primary/10 scale-105" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-none ${isActive ? "text-primary" : ""}`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            type="button"
            data-ocid="nav.mas_link"
            onClick={() => setShowMore(!showMore)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[60px] transition-colors ${
              isMoreActive || showMore
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                isMoreActive || showMore ? "bg-primary/10 scale-105" : ""
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
              {isMoreActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium leading-none ${isMoreActive || showMore ? "text-primary" : ""}`}
            >
              Más
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
