'use client';

import React from 'react';
import { AlertTriangle, Archive, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tipo: 'excluir' | 'arquivar' | 'restaurar_demo';
  titulo: string;
  itemIdentificador: string;
  mensagemExtra?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tipo,
  titulo,
  itemIdentificador,
  mensagemExtra,
}) => {
  if (!isOpen) return null;

  const isDelete = tipo === 'excluir';
  const isArchive = tipo === 'arquivar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#121c25] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#1e2d3b]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDelete
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : isArchive
                  ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              {isDelete ? (
                <Trash2 className="w-5 h-5" />
              ) : isArchive ? (
                <Archive className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                {titulo}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Confirmação de ação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cancelar e fechar"
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b1015] border border-slate-200 dark:border-[#1e2d3b] rounded-xl p-3 mb-4 text-xs space-y-1">
          <p className="text-slate-500 dark:text-slate-400">Registro selecionado:</p>
          <p className="font-bold text-sm text-slate-900 dark:text-white">{itemIdentificador}</p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {mensagemExtra ||
            (isDelete
              ? 'Este registro será enviado para a lixeira, podendo ser restaurado posteriormente nas Configurações.'
              : isArchive
              ? 'Ao arquivar, o registro deixará de aparecer na lista principal, mas permanecerá acessível nos filtros.'
              : 'Deseja confirmar esta ação?')}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#182633] hover:bg-slate-200 dark:hover:bg-[#203243] rounded-xl transition-colors min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors min-h-[44px] flex items-center gap-1.5 ${
              isDelete
                ? 'bg-rose-600 hover:bg-rose-700'
                : isArchive
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isDelete ? 'Excluir Registro' : isArchive ? 'Arquivar Registro' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
