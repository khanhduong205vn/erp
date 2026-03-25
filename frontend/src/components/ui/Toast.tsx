import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/** Toast notification types */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  exiting: boolean;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/** Auto-dismiss duration in ms */
const DEFAULT_DURATION = 4000;

/** Hook to trigger toast notifications from any component */
export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/** Wrap this around <App /> to enable toast notifications globally */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 250);
  }, []);

  const toast = useCallback((type: ToastType, message: string, duration = DEFAULT_DURATION) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, duration, exiting: false }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — top right corner */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none" style={{ maxWidth: '380px' }}>
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Individual toast card with progress bar */
function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const config = TOAST_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg border overflow-hidden relative
        ${config.bg} ${config.border}
        ${item.exiting ? 'animate-toast-out' : mounted ? 'animate-toast-in' : 'opacity-0'}`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <p className="text-sm font-medium text-gray-800 flex-1 leading-relaxed">{item.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5">
        <div
          className={`h-full ${config.progress} rounded-full`}
          style={{ animation: `progress-bar ${item.duration}ms linear` }}
        />
      </div>
    </div>
  );
}

/** Color and icon config per toast type */
const TOAST_CONFIG: Record<ToastType, {
  icon: typeof CheckCircle;
  bg: string;
  border: string;
  iconColor: string;
  progress: string;
}> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    progress: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    progress: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    progress: 'bg-blue-500',
  },
};
