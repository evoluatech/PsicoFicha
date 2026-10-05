'use client';

import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { showToast } from './ToastContainer';

interface PWAInstallBannerProps {
  compact?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWA();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed as PWA or running in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        showToast('Aplicativo instalado com sucesso!', 'sucesso');
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      showToast('O navegador atual não emitiu o evento de instalação ou já está instalado.', 'info');
    }
  };

  return (
    <>
      {compact ? (
        <button
          onClick={handleInstallClick}
          aria-label="Instalar aplicativo PWA"
          title="Instalar Psicoficha no dispositivo"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#176B73] bg-[#EEF5F4] hover:bg-[#d4ecec] rounded-lg transition-colors min-h-[36px]"
        >
          <Download className="w-3.5 h-3.5 text-[#176B73]" />
          <span>Instalar App</span>
        </button>
      ) : (
        <div className="p-3 bg-[#EEF5F4] border border-[#238B8D]/20 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#176B73] shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#183238]">Usar como aplicativo (PWA)</p>
              <p className="text-[11px] text-[#52676B]">Acesso rápido na tela inicial e modo offline</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-lg shadow-xs transition-colors whitespace-nowrap min-h-[36px]"
          >
            Instalar
          </button>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF5F4] flex items-center justify-center text-[#176B73]">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#183238]">Instalar no iPhone ou iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-[#52676B] hover:text-[#183238] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#52676B] mb-4">
              O Safari no iOS não permite instalação automática por botão. Siga estes passos simples:
            </p>

            <ol className="space-y-3 text-xs text-[#183238] mb-6 list-decimal list-inside">
              <li className="leading-relaxed">
                Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra inferior do Safari.
              </li>
              <li className="leading-relaxed flex items-center gap-1.5 mt-1">
                <span>Role para baixo e selecione</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 rounded font-medium">
                  <PlusSquare className="w-3.5 h-3.5" /> Adicionar à Tela de Início
                </span>
              </li>
              <li className="leading-relaxed">
                Confirme tocando em <strong>Adicionar</strong> no canto superior direito.
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-[#183238] bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors min-h-[44px]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
