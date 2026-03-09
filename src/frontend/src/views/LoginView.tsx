import { Button } from "@/components/ui/button";
import { Leaf, Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginView() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col bg-green-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Top section with logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="animate-fade-in flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <div className="w-28 h-28 bg-white/15 rounded-3xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
            <img
              src="/assets/generated/hoja-verde-logo-transparent.dim_200x200.png"
              alt="Hoja Verde"
              className="w-20 h-20 object-contain drop-shadow"
            />
          </div>

          {/* Brand */}
          <div>
            <h1 className="font-display font-bold text-4xl text-white tracking-tight leading-none mb-2">
              Hoja Verde
            </h1>
            <p className="text-white/80 text-lg font-medium">
              Gestión de Jardines
            </p>
            <p className="text-white/60 text-sm mt-1">Costa Rica</p>
          </div>
        </div>
      </div>

      {/* Login card */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl animate-slide-up">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Bienvenido
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Inicia sesión para gestionar tus clientes, trabajos y finanzas de
              manera eficiente.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: "📋", label: "Clientes" },
              { icon: "📅", label: "Calendario" },
              { icon: "💰", label: "Finanzas" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-3 bg-green-pale rounded-xl"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-fab gap-3"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <Leaf className="w-5 h-5" />
                Iniciar Sesión
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Acceso seguro con Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
}
