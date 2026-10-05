'use client';

import React, { useState, useEffect } from 'react';
import { BellRing, Clock, MapPin, User, X } from 'lucide-react';
import { LembreteConsulta } from '@/types';
import { showToast } from './ToastContainer';

interface AlarmEventDetail {
  lembrete: LembreteConsulta;
  antecedenciaTexto: string;
}

interface AlarmModalProps {
  onNavigateToLembrete?: (id: string) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({ onNavigateToLembrete }) => {
  const [activeAlarm, setActiveAlarm] = useState<AlarmEventDetail | null>(null);

  useEffect(() => {
    const handleAlarm = (e: Event) => {
      const customEvent = e as CustomEvent<AlarmEventDetail>;
      if (customEvent.detail) {
        setActiveAlarm(customEvent.detail);
      }
    };

    window.addEventListener('praxis_in_app_alarm', handleAlarm);
    return () => window.removeEventListener('praxis_in_app_alarm', handleAlarm);
  }, []);

  if (!activeAlarm) return null;

  const { lembrete, antecedenciaTexto } = activeAlarm;

  const handleDismiss = () => {
    setActiveAlarm(null);
  };

  const handleSnooze = () => {
    setActiveAlarm(null);
    showToast('Lembrete adiado em 5 minutos.', 'info');
    // Set a timer for 5 minutes (300,000 ms) in-app simulation
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('praxis_in_app_alarm', {
          detail: {
            lembrete,
            antecedenciaTexto: 'Alerta Adiado (5 minutos decorridos)',
          },
        })
      );
    }, 5 * 60 * 1000);
  };

  const handleOpen = () => {
    setActiveAlarm(null);
    onNavigateToLembrete?.(lembrete.id);
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#121c25] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#00E5FF]/40 p-6 overflow-hidden">
        {/* Decorative alert header band */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#008B94] via-[#00E5FF] to-[#38edff]" />

        <div className="flex items-start justify-between mt-1 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-[#182633] flex items-center justify-center text-[#007a82] dark:text-[#00E5FF] animate-bounce">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md inline-block mb-1">
                {antecedenciaTexto}
              </span>
              <h2 id="alarm-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Alerta de Consulta — Psicoficha
              </h2>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dispensar alarme"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b1015] border border-slate-200 dark:border-[#1e2d3b] rounded-xl p-4 mb-5 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
            <User className="w-4 h-4 text-[#007a82] dark:text-[#00E5FF] shrink-0" />
            <span className="font-bold">{lembrete.nomeAprendente}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-[#008B94] dark:text-[#38edff] shrink-0" />
            <span>
              Horário:{' '}
              <strong className="text-slate-900 dark:text-white font-bold">
                {lembrete.horarioInicio} ({lembrete.duracaoMinutos} min)
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{lembrete.modalidade === 'presencial' ? lembrete.local : 'Atendimento Online (Remoto)'}</span>
          </div>

          {lembrete.observacoes && (
            <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-[#1e2d3b] italic">
              &ldquo;{lembrete.observacoes}&rdquo;
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#182633] hover:bg-slate-200 dark:hover:bg-[#223545] rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
          >
            Dispensar
          </button>
          <button
            onClick={handleSnooze}
            className="px-3 py-2.5 text-xs font-bold text-[#007a82] dark:text-[#00E5FF] bg-teal-50 dark:bg-[#0e272d] hover:bg-teal-100 dark:hover:bg-[#143942] rounded-xl transition-colors min-h-[44px] flex items-center justify-center border border-teal-200 dark:border-[#00E5FF]/20"
          >
            Adiar 5 min
          </button>
          <button
            onClick={handleOpen}
            className="px-3 py-2.5 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] dark:hover:bg-[#38edff] rounded-xl shadow-xs transition-colors min-h-[44px] flex items-center justify-center"
          >
            Abrir Consulta
          </button>
        </div>
      </div>
    </div>
  );
};
