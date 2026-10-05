'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { AvaliacaoPsicopedagogica, Aprendente } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AvaliacaoViewProps {
  aprendenteId: string;
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const AvaliacaoView: React.FC<AvaliacaoViewProps> = ({
  aprendenteId,
  onNavigate,
}) => {
  const aprendente = storage.getAprendenteById(aprendenteId);
  const [avaliacao, setAvaliacao] = useState<AvaliacaoPsicopedagogica | null>(null);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  useEffect(() => {
    if (!aprendenteId) return;
    const existente = storage.getAvaliacaoByAprendente(aprendenteId);
    if (existente) {
      setAvaliacao(existente);
    } else {
      const nova: AvaliacaoPsicopedagogica = {
        id: `ava-${Date.now()}`,
        aprendenteId,
        perguntaObjetivo: 'Compreender o processo de aprendizagem e estratégias de mediação adequadas.',
        periodoAvaliacao: 'Março de 2026 (Ciclo Diagnóstico Inicial)',
        contextoFontes: 'Anamnese com genitores, observações diretas em sessões lúdicas e contato pedagógico escolar.',
        procedimentosInstrumentos: 'EOCA, Provas Operatórias Piagetianas, Análise de Cadernos, Teste de Consciência Fonológica.',
        observacoesQualitativas: 'Aprendente demonstra vínculo positivo e capacidade reflexiva quando encorajada.',
        fatoresFacilitadores: 'Família presente e afetiva; interesse por narrativas e desenho.',
        barreiras: 'Insegurança perante o erro em situações de cobrança formal de escrita.',
        sinteseDescritiva: 'Processo de construção da escrita em fase de consolidação silábico-alfabética, com potencial cognitivo preservado.',
        recomendacoesPedagogicas: 'Valorização da escrita espontânea; apoio com fichas visuais e ritmo adaptado.',
        encaminhamentos: 'Acompanhamento psicopedagógico continuado e alinhamento periódico com a coordenação.',
        limitacoesAvaliacao: 'Avaliação psicopedagógica processual sem finalidade diagnóstica médica ou de rotulação.',
        revisaoProfissional: {
          revisadoPor: 'Dra. Gabriela Antunes Ferreira',
          crpCrppDemonstrativo: 'ABPp 14.892/SP - Demonstrativo',
          dataRevisao: new Date().toISOString().split('T')[0],
        },
        status: 'rascunho',
      };
      setAvaliacao(nova);
    }
  }, [aprendenteId]);

  const handleSalvar = (status: 'rascunho' | 'finalizado') => {
    if (!avaliacao) return;
    const atualizada = { ...avaliacao, status };
    storage.saveAvaliacao(atualizada);
    setAvaliacao(atualizada);
    showToast(
      status === 'finalizado'
        ? 'Avaliação psicopedagógica finalizada com sucesso!'
        : 'Rascunho de avaliação salvo localmente.',
      'sucesso'
    );
  };

  const handleConfirmarExcluirAvaliacao = () => {
    if (!aprendente) return;
    storage.deleteAvaliacao(aprendente.id);
    showToast(`Avaliação de ${aprendente.nomeCompleto} movida para a lixeira.`, 'info');
    onNavigate('aprendente-detalhe', { id: aprendente.id });
  };

  if (!aprendente || !avaliacao) {
    return <div className="p-8 text-center text-xs text-[#52676B]">Carregando avaliação...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('aprendente-detalhe', { id: aprendente.id })}
            className="text-xs font-semibold text-[#176B73] hover:underline flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Perfil de {aprendente.nomeCompleto}</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#183238] dark:text-white">
            Avaliação Psicopedagógica Estruturada
          </h1>
          <p className="text-xs text-[#52676B] dark:text-slate-400 mt-0.5">
            Registro descritivo de achados, procedimentos e recomendações pedagógicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalExcluirAberto(true)}
            title="Excluir esta Avaliação"
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Avaliação</span>
          </button>
          <button
            onClick={() => handleSalvar('rascunho')}
            className="px-3.5 py-2 text-xs font-semibold text-[#176B73] dark:text-[#00E5FF] bg-[#EEF5F4] dark:bg-[#182633] hover:bg-[#d4ecec] dark:hover:bg-[#203444] rounded-xl transition-colors min-h-[40px]"
          >
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSalvar('finalizado')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] dark:bg-[#008B94] dark:hover:bg-[#00A3AD] rounded-xl shadow-xs transition-colors min-h-[40px] flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Finalizar Avaliação</span>
          </button>
        </div>
      </div>

      {/* Ética e Neutralidade Banner */}
      <div className="bg-[#f0f8f8] dark:bg-[#0c1822] border border-[#d4ecec] dark:border-[#193240] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#183238] dark:text-[#a0c0c6] transition-colors">
        <ShieldCheck className="w-5 h-5 text-[#176B73] dark:text-[#00E5FF] shrink-0 mt-0.5" />
        <div className="leading-relaxed space-y-1">
          <p className="font-bold text-[#176B73] dark:text-[#00E5FF]">Princípio da Descrição Qualitativa</p>
          <p className="text-[#52676B] dark:text-[#8da4ac]">
            Esta avaliação documenta evidências observadas durante as sessões e propostas de intervenção pedagógica. Não gera rótulos automáticos nem substitui avaliações neurológicas ou médicas especializadas.
          </p>
        </div>
      </div>

      {/* Main Structured Form */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#183238] mb-1">
            Pergunta Norteadora / Objetivo da Avaliação
          </label>
          <input
            type="text"
            value={avaliacao.perguntaObjetivo}
            onChange={(e) => setAvaliacao({ ...avaliacao, perguntaObjetivo: e.target.value })}
            className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#183238] mb-1">
              Período da Avaliação
            </label>
            <input
              type="text"
              value={avaliacao.periodoAvaliacao}
              onChange={(e) => setAvaliacao({ ...avaliacao, periodoAvaliacao: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#183238] mb-1">
              Contexto e Fontes de Informação
            </label>
            <input
              type="text"
              value={avaliacao.contextoFontes}
              onChange={(e) => setAvaliacao({ ...avaliacao, contextoFontes: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#183238] mb-1">
            Procedimentos e Instrumentos Utilizados
          </label>
          <textarea
            rows={2}
            value={avaliacao.procedimentosInstrumentos}
            onChange={(e) => setAvaliacao({ ...avaliacao, procedimentosInstrumentos: e.target.value })}
            className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#183238] mb-1">
            Observações Qualitativas do Processo
          </label>
          <textarea
            rows={3}
            value={avaliacao.observacoesQualitativas}
            onChange={(e) => setAvaliacao({ ...avaliacao, observacoesQualitativas: e.target.value })}
            className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5c8f78] mb-1">
              Fatores Facilitadores / Potencialidades
            </label>
            <textarea
              rows={2}
              value={avaliacao.fatoresFacilitadores}
              onChange={(e) => setAvaliacao({ ...avaliacao, fatoresFacilitadores: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A86B00] mb-1">
              Barreiras Encontradas
            </label>
            <textarea
              rows={2}
              value={avaliacao.barreiras}
              onChange={(e) => setAvaliacao({ ...avaliacao, barreiras: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#183238] mb-1">
            Síntese Descritiva e Compreensiva
          </label>
          <textarea
            rows={3}
            value={avaliacao.sinteseDescritiva}
            onChange={(e) => setAvaliacao({ ...avaliacao, sinteseDescritiva: e.target.value })}
            className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#183238] mb-1">
              Recomendações Pedagógicas
            </label>
            <textarea
              rows={3}
              value={avaliacao.recomendacoesPedagogicas}
              onChange={(e) => setAvaliacao({ ...avaliacao, recomendacoesPedagogicas: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#183238] mb-1">
              Encaminhamentos Propostos
            </label>
            <textarea
              rows={3}
              value={avaliacao.encaminhamentos}
              onChange={(e) => setAvaliacao({ ...avaliacao, encaminhamentos: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#183238] mb-1">
            Limitações da Avaliação e Observações Éticas
          </label>
          <input
            type="text"
            value={avaliacao.limitacoesAvaliacao}
            onChange={(e) => setAvaliacao({ ...avaliacao, limitacoesAvaliacao: e.target.value })}
            className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
          />
        </div>

        {/* Identificação Profissional */}
        <div className="pt-4 border-t border-[#EEF5F4] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-[#52676B] mb-1">Profissional Responsável</label>
            <input
              type="text"
              value={avaliacao.revisaoProfissional.revisadoPor}
              onChange={(e) =>
                setAvaliacao({
                  ...avaliacao,
                  revisaoProfissional: { ...avaliacao.revisaoProfissional, revisadoPor: e.target.value },
                })
              }
              className="w-full text-xs p-2 rounded-lg border border-[#EEF5F4] bg-[#F7FAFA]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#52676B] mb-1">Registro Profissional (Demonstrativo)</label>
            <input
              type="text"
              value={avaliacao.revisaoProfissional.crpCrppDemonstrativo}
              onChange={(e) =>
                setAvaliacao({
                  ...avaliacao,
                  revisaoProfissional: { ...avaliacao.revisaoProfissional, crpCrppDemonstrativo: e.target.value },
                })
              }
              className="w-full text-xs p-2 rounded-lg border border-[#EEF5F4] bg-[#F7FAFA]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#52676B] mb-1">Data da Revisão</label>
            <input
              type="date"
              value={avaliacao.revisaoProfissional.dataRevisao}
              onChange={(e) =>
                setAvaliacao({
                  ...avaliacao,
                  revisaoProfissional: { ...avaliacao.revisaoProfissional, dataRevisao: e.target.value },
                })
              }
              className="w-full text-xs p-2 rounded-lg border border-[#EEF5F4] bg-[#F7FAFA]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save & Finalize Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-4">
        <div className="text-xs text-[#52676B] dark:text-slate-400">
          Status atual: <strong className="text-[#183238] dark:text-white uppercase">{avaliacao.status}</strong>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalExcluirAberto(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5 min-h-[44px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Avaliação</span>
          </button>
          <button
            onClick={() => handleSalvar('rascunho')}
            className="px-4 py-2 text-xs font-semibold text-[#176B73] dark:text-[#00E5FF] bg-[#EEF5F4] dark:bg-[#182633] hover:bg-[#d4ecec] dark:hover:bg-[#203444] rounded-xl transition-colors min-h-[44px]"
          >
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSalvar('finalizado')}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] dark:bg-[#008B94] dark:hover:bg-[#00A3AD] rounded-xl shadow-xs transition-colors min-h-[44px] flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Finalizar Avaliação</span>
          </button>
        </div>
      </div>

      {/* Modal de Exclusão de Avaliação */}
      <ConfirmModal
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        onConfirm={handleConfirmarExcluirAvaliacao}
        tipo="excluir"
        titulo="Excluir Avaliação Psicopedagógica"
        itemIdentificador={`Avaliação de ${aprendente?.nomeCompleto || ''}`}
        mensagemExtra="Os dados deste formulário serão transferidos para a lixeira de segurança e poderão ser restaurados nas Configurações se necessário."
      />
    </div>
  );
};
