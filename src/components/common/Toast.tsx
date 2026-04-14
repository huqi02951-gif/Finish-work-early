import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 3000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId.current++;
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        // Keep only the most recent MAX_VISIBLE
        return next.slice(-MAX_VISIBLE);
      });
      // Auto-dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, AUTO_DISMISS_MS);
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return {
    show: ctx.addToast,
    success: (msg: string) => ctx.addToast(msg, 'success'),
    error: (msg: string) => ctx.addToast(msg, 'error'),
    info: (msg: string) => ctx.addToast(msg, 'info'),
    warning: (msg: string) => ctx.addToast(msg, 'warning'),
  };
}

/* ─── Toast Container (renders inside Provider so it has context) ─── */
const ToastContainer: React.FC = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, removeToast } = ctx;
  if (toasts.length === 0) return null;

  const typeStyles: Record<ToastType, string> = {
    success:
      'bg-emerald-500 text-white',
    error:
      'bg-red-500 text-white',
    warning:
      'bg-amber-500 text-white',
    info:
      'bg-sky-500 text-white',
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none"
      style={{ paddingTop: 'env(safe-area-inset-top, 12px)' }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto max-w-sm w-auto px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-slide-in-down flex items-center justify-between gap-3 ${typeStyles[t.type]}`}
          role="alert"
        >
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="shrink-0 opacity-80 hover:opacity-100 text-lg leading-none"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
