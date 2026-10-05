'use client';

import React from 'react';
import {
  WifiOff,
  HardDrive,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { ActiveRoute } from '@/components/layout/AppShell';
import { usePWA } from '@/hooks/use-pwa';
import { showToast } from '@/components/ui/ToastContainer';
import { PsicofichaLogo } from '@/components/ui/PsicofichaLogo';

interface OfflineViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const OfflineView: React.FC<OfflineViewProps> = ({ onNavigate }) => {
  const { isOnline } = usePWA();

  const handleTestarConexao = () => {
    if (typeof window !== 'undefined') {
      if (navigator.onLine) {
        showToast('Conexão ativa restabelecida!', 'sucesso');
        onNavigate('dashboard');
      } else {
        showToast('O dispositivo ainda se encontra sem conexão de rede.', 'aviso');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
      <div className="flex justify-center mb-2">
        <PsicofichaLogo variant="full" size="lg" />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-[#EEF5F4] dark:bg-[#182633] text-[#176B73] dark:text-[#00E5FF] flex items-center justify-center mx-auto shadow-xs">
        <WifiOff className="w-8 h-8 text-[#A86B00]" />
      </div>

      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#A86B00]">
          Modo Local Autônomo
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#183238] mt-1">
          Você está navegando em modo offline
        </h1>
        <p className="text-xs text-[#52676B] max-w-md mx-auto mt-2 leading-relaxed">
          A plataforma <strong>Psicoficha</strong> foi arquitetada como Progressive Web App (PWA), permitindo continuar consultando e registrando fichas, sessões e relatórios sem depender de internet.
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-5 text-left text-xs space-y-3">
        <h2 className="font-bold text-[#183238] flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#176B73]" />
          <span>Recursos Disponíveis Offline:</span>
        </h2>
        <ul className="space-y-2 text-[#52676B]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5c8f78] shrink-0" />
            <span>Consulta a todos os aprendentes cadastrados;</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5c8f78] shrink-0" />
            <span>Preenchimento de anamneses e salvamento automático local;</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5c8f78] shrink-0" />
            <span>Registro de novas sessões e visualização de evolução;</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#5c8f78] shrink-0" />
            <span>Geração e impressão de relatórios psicopedagógicos no navegador.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleTestarConexao}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Verificar Conexão</span>
        </button>

        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-[#52676B] hover:text-[#183238] bg-white border border-[#EEF5F4] rounded-xl transition-colors min-h-[44px]"
        >
          Continuar no Dashboard
        </button>
      </div>
    </div>
  );
};
