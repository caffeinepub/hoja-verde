import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import type { ViewName } from "./types";
import { CalendarioView } from "./views/CalendarioView";
import { ClienteDetalleView } from "./views/ClienteDetalleView";
import { ClientesView } from "./views/ClientesView";
import { CotizacionesView } from "./views/CotizacionesView";
import { DashboardView } from "./views/DashboardView";
import { EstadisticasView } from "./views/EstadisticasView";
import { FacturasView } from "./views/FacturasView";
import { FinanzasView } from "./views/FinanzasView";
import { LoginView } from "./views/LoginView";
import { ProspectosView } from "./views/ProspectosView";
import { RutasView } from "./views/RutasView";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeView, setActiveView] = useState<ViewName>("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  const handleNavigate = useCallback((view: ViewName, clientId?: string) => {
    if (view === "cliente_detalle" && clientId) {
      setSelectedClientId(clientId);
    }
    setActiveView(view);
  }, []);

  const handleBack = useCallback(() => {
    setActiveView("clientes");
    setSelectedClientId(null);
  }, []);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-gradient">
        <div className="flex flex-col items-center gap-4 text-white">
          <img
            src="/assets/generated/hoja-verde-logo-transparent.dim_200x200.png"
            alt="Hoja Verde"
            className="w-16 h-16 object-contain animate-pulse"
          />
          <p className="font-display font-semibold text-lg">Hoja Verde</p>
          <p className="text-white/70 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <Toaster />
      </>
    );
  }

  // Main app
  return (
    <div className="min-h-screen bg-background">
      {/* Max width container for larger screens */}
      <div className="max-w-lg mx-auto min-h-screen relative bg-background shadow-xl">
        {/* Views */}
        <main className="min-h-screen">
          {activeView === "dashboard" && (
            <DashboardView onNavigate={handleNavigate} />
          )}
          {activeView === "clientes" && (
            <ClientesView onNavigate={handleNavigate} />
          )}
          {activeView === "cliente_detalle" && selectedClientId && (
            <ClienteDetalleView
              clientId={selectedClientId}
              onBack={handleBack}
            />
          )}
          {activeView === "calendario" && <CalendarioView />}
          {activeView === "cotizaciones" && <CotizacionesView />}
          {activeView === "facturas" && <FacturasView />}
          {activeView === "prospectos" && <ProspectosView />}
          {activeView === "finanzas" && <FinanzasView />}
          {activeView === "estadisticas" && <EstadisticasView />}
          {activeView === "rutas" && <RutasView />}
        </main>

        {/* Bottom nav - show for all views except client detail */}
        {activeView !== "cliente_detalle" && (
          <BottomNav activeView={activeView} onNavigate={handleNavigate} />
        )}
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
}
