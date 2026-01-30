import { createContext, useContext, useState, useCallback } from 'react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const ToastContext = createContext<{ addToast: (t: Omit<ToastItem, 'id'>) => void }>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast: ToastItem = { id, ...t };
    setToasts((s) => [toast, ...s]);
    const dur = t.duration ?? 4000;
    setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), dur);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={clsx('min-w-[220px] max-w-sm rounded p-3 shadow', {
            'bg-green-600 text-white': t.type === 'success',
            'bg-red-600 text-white': t.type === 'error',
            'bg-neutral-800 text-white': t.type === 'info'
          })}>
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
