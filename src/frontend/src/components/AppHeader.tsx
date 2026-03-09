import { formatTodaySpanish } from "../utils/format";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export function AppHeader({
  title = "Hoja Verde",
  subtitle,
  showDate = false,
  onBack,
  rightContent,
}: AppHeaderProps) {
  return (
    <header className="bg-green-gradient text-white px-4 pt-4 pb-5 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="touch-target flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Volver"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {!onBack && (
          <div className="w-10 h-10 flex-shrink-0">
            <img
              src="/assets/generated/hoja-verde-logo-transparent.dim_200x200.png"
              alt="Hoja Verde"
              className="w-10 h-10 object-contain drop-shadow-sm"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-xl leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-sm truncate">{subtitle}</p>
          )}
          {showDate && (
            <p className="text-white/70 text-xs mt-0.5 capitalize">
              {formatTodaySpanish()}
            </p>
          )}
        </div>

        {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      </div>
    </header>
  );
}
