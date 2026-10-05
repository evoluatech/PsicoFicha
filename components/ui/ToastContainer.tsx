'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { ToastNotif } from '@/types';

export function showToast(
  mensagem: string,
  tipo: 'sucesso' | 'info' | 'aviso' | 'erro' = 'sucesso',
  acaoTexto?: string,
  onAcao?: () => void
) {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('praxis_toast', {
    detail: {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      mensagem,
      tipo,
      acaoTexto,
      onAcao,
    },
  });
  window.dispatchEvent(event);
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotif[]>([]);

  useEffect(() => {
    const handleNewToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastNotif>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener('praxis_toast', handleNewToast);
    return () => window.removeEventListener('praxis_toast', handleNewToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4"
    >
      {toasts.map((toast) => {
        let borderClass = 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-emerald-500/40';
        let bgClass = 'bg-white dark:bg-[#121c25]';
        let textTitleClass = 'text-emerald-800 dark:text-emerald-400';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
        let label = 'Sucesso';

        if (toast.tipo === 'aviso') {
          borderClass = 'border-l-4 border-l-amber-500 border-slate-200 dark:border-amber-500/40';
          bgClass = 'bg-white dark:bg-[#1a1714]';
          textTitleClass = 'text-amber-800 dark:text-amber-400';
          icon = <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
          label = 'Atenção';
        } else if (toast.tipo === 'erro') {
          borderClass = 'border-l-4 border-l-rose-500 border-slate-200 dark:border-rose-500/40';
          bgClass = 'bg-white dark:bg-[#1a1215]';
          textTitleClass = 'text-rose-800 dark:text-rose-400';
          icon = <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
          label = 'Aviso';
        } else if (toast.tipo === 'info') {
          borderClass = 'border-l-4 border-l-[#008B94] dark:border-l-[#00E5FF] border-slate-200 dark:border-[#00E5FF]/40';
          bgClass = 'bg-white dark:bg-[#0d1720]';
          textTitleClass = 'text-[#007a82] dark:text-[#00E5FF]';
          icon = <Info className="w-5 h-5 text-[#008B94] dark:text-[#00E5FF] shrink-0 mt-0.5" />;
          label = 'Informação';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl shadow-black/10 dark:shadow-black/60 ${bgClass} ${borderClass} transition-all duration-200 transform translate-y-0`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <span className={`text-[11px] font-bold uppercase tracking-wider block mb-0.5 ${textTitleClass}`}>
                {label}
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words">
                {toast.mensagem}
              </p>
              {toast.acaoTexto && toast.onAcao && (
                <button
                  onClick={() => {
                    toast.onAcao?.();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-xs font-bold text-[#007a82] hover:text-[#008B94] dark:text-[#00E5FF] dark:hover:text-[#38edff] underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded"
                >
                  {toast.acaoTexto}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
