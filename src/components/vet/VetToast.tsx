'use client';

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, X } from 'reicon-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useVetToast() {
  return useContext(ToastContext);
}

const iconMap = {
  success: <CheckCircle size={18} weight="Outline" className="text-emerald-500" />,
  warning: <AlertTriangle size={18} weight="Outline" className="text-amber-500" />,
  error: <XCircle size={18} weight="Outline" className="text-red-500" />,
  info: <CheckCircle size={18} weight="Outline" className="text-primary" />,
};

export function VetToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'success', duration = 3500) => {
      const id = `vt-${++counterRef.current}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="toast-container no-print" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`toast-item ${toast.type}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {iconMap[toast.type]}
                </div>
                <p className="text-sm font-medium text-foreground flex-1 leading-snug">
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={14} weight="Outline" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
