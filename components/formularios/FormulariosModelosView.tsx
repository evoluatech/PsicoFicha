'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Copy,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  X,
  Trash2,
} from 'lucide-react';
import { MOCK_MODELOS_FORMULARIOS } from '@/lib/mock-data';
import { ModeloFormulario } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface FormulariosModelosViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const FormulariosModelosView: React.FC<FormulariosModelosViewProps> = ({ onNavigate }) => {
  const [modelos, setModelos] = useState<ModeloFormulario[]>(MOCK_MODELOS_FORMULARIOS);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloFormulario | null>(null);
  const [modalExcluir, setModalExcluir] = useState<{ aberto: boolean; modelo?: ModeloFormulario }>({
    aberto: false,
  });

  const handleIniciarModelo = (mod: ModeloFormulario) => {
    if (mod.categoria === 'anamnese') {
      onNavigate('anamnese', { id: 'apr-1' });
    } else if (mod.categoria === 'sessao') {
      onNavigate('sessoes', { id: 'apr-2' });
    } else if (mod.categoria === 'avaliacao') {
      onNavigate('avaliacao', { id: 'apr-1' });
    } else {
      onNavigate('relatorio-novo', { modelo: mod.id });
    }
    showToast(`Iniciando formulário a partir de "${mod.titulo}"`, 'info');
  };

  const handleDuplicarModelo = (mod: ModeloFormulario) => {
    const clone: ModeloFormulario = {
      ...mod,
      id: `mod-${Date.now()}`,
      titulo: `${mod.titulo} (Cópia)`,
    };
    setModelos((prev) => [clone, ...prev]);
    showToast(`Modelo demonstrativo "${mod.titulo}" clonado para sua biblioteca!`, 'sucesso');
  };

  const handleExcluirConfirmado = () => {
    if (!modalExcluir.modelo) return;
    const alvo = modalExcluir.modelo;
    setModelos((prev) => prev.filter((m) => m.id !== alvo.id));
    setModalExcluir({ aberto: false });
    showToast(`Modelo "${alvo.titulo}" removido com sucesso.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#183238]">
          Modelos e Instrumentos Psicopedagógicos
        </h1>
        <p className="text-xs text-[#52676B] mt-0.5">
          Biblioteca de roteiros padronizados e humanizados para anamneses, sessões e devolutivas.
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modelos.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-2xl border border-[#EEF5F4] p-5 shadow-xs hover:border-[#238B8D]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#EEF5F4] text-[#176B73] flex items-center justify-center font-bold text-xs group-hover:bg-[#176B73] group-hover:text-white transition-colors">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EEF5F4] text-[#176B73] capitalize">
                  {mod.categoria}
                </span>
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#183238] group-hover:text-[#176B73] transition-colors leading-snug">
                  {mod.titulo}
                </h2>
                <p className="text-xs text-[#52676B] mt-1 line-clamp-2 leading-relaxed">
                  {mod.descricao}
                </p>
              </div>

              <div className="p-3 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4] text-[11px] text-[#52676B] space-y-1">
                <div>
                  <strong>Indicação:</strong> {mod.indicacaoUso}
                </div>
                <div className="flex items-center gap-3 pt-1 text-[10px]">
                  <span>{mod.itensEstimados} seções/questões</span>
                  <span aria-hidden="true">·</span>
                  <span>~{mod.tempoMedioPreenchimentoMinutos} min preenchimento</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EEF5F4] flex items-center justify-between gap-2 mt-4">
              <button
                type="button"
                onClick={() => setModeloSelecionado(mod)}
                className="text-xs font-semibold text-[#52676B] hover:text-[#183238] flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Roteiro</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDuplicarModelo(mod)}
                  title="Duplicar modelo"
                  className="p-1.5 text-[#52676B] hover:text-[#183238] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#182633] rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setModalExcluir({ aberto: true, modelo: mod })}
                  title="Excluir modelo"
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleIniciarModelo(mod)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] dark:bg-[#008B94] dark:hover:bg-[#00A3AD] rounded-xl shadow-xs transition-colors flex items-center gap-1"
                >
                  <span>Iniciar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal for Template */}
      {modeloSelecionado && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#EEF5F4]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#176B73] tracking-wider">
                  Roteiro de Modelo Estruturado
                </span>
                <h3 className="text-base font-bold text-[#183238] mt-0.5">
                  {modeloSelecionado.titulo}
                </h3>
              </div>
              <button
                onClick={() => setModeloSelecionado(null)}
                className="p-1 text-[#52676B] hover:text-[#183238] rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#52676B] space-y-2 leading-relaxed">
              <p><strong>Descrição:</strong> {modeloSelecionado.descricao}</p>
              <p><strong>Aplicação Recomendada:</strong> {modeloSelecionado.indicacaoUso}</p>
              <div className="p-3 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4] space-y-1">
                <span className="font-semibold text-[#183238] block">Diretrizes Inclusas no Modelo:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Diferenciação clara entre fala espontânea e observações profissionais</li>
                  <li>Incentivo a termos neutros sem rotulação nosológica precoce</li>
                  <li>Foco em recursos e fatores de proteção da família e do aprendente</li>
                  <li>Orientações práticas executáveis no cotidiano familiar e escolar</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EEF5F4]">
              <button
                type="button"
                onClick={() => setModeloSelecionado(null)}
                className="px-4 py-2 text-xs font-semibold text-[#52676B] hover:text-[#183238] bg-neutral-100 rounded-xl"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = modeloSelecionado;
                  setModeloSelecionado(null);
                  handleIniciarModelo(m);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <span>Usar este Modelo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Modelo */}
      <ConfirmModal
        isOpen={modalExcluir.aberto}
        onClose={() => setModalExcluir({ aberto: false })}
        onConfirm={handleExcluirConfirmado}
        tipo="excluir"
        titulo="Remover Modelo de Formulário"
        itemIdentificador={modalExcluir.modelo?.titulo || ''}
        mensagemExtra="Este modelo será removido da listagem ativa de instrumentos."
      />
    </div>
  );
};
