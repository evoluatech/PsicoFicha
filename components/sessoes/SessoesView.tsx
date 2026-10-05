'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  MapPin,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  Save,
  X,
  FileText,
  Filter
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Sessao, Aprendente } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface SessoesViewProps {
  aprendenteId?: string;
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const SessoesView: React.FC<SessoesViewProps> = ({
  aprendenteId,
  onNavigate,
}) => {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([]);
  const [aprendenteSelecionadoId, setAprendenteSelecionadoId] = useState<string>(aprendenteId || 'apr-2');
  const [modalAberto, setModalAberto] = useState(false);
  const [sessaoEditando, setSessaoEditando] = useState<Sessao | null>(null);
  const [modalExcluir, setModalExcluir] = useState<{ aberto: boolean; sessao?: Sessao }>({ aberto: false });

  // Form State
  const [formData, setFormData] = useState<Partial<Sessao>>({
    data: new Date().toISOString().split('T')[0],
    duracaoMinutos: 50,
    modalidade: 'presencial_consultorio',
    local: 'Consultório Principal - Sala A',
    objetivo: '',
    atividades: '',
    comportamentoObservado: '',
    estrategiasEficazes: '',
    dificuldadesEncontradas: '',
    avancosPercebidos: '',
    orientacoesFamiliaEscola: '',
    proximosPassos: '',
    status: 'finalizado',
  });

  const carregarDados = useCallback(() => {
    const todosApr = storage.getAprendentes();
    setAprendentes(todosApr);
    const idAlvo = aprendenteSelecionadoId || (todosApr[0]?.id ?? '');
    setSessoes(storage.getSessoesByAprendente(idAlvo));
  }, [aprendenteSelecionadoId]);

  useEffect(() => {
    carregarDados();
    window.addEventListener('praxis_storage_updated', carregarDados);
    return () => window.removeEventListener('praxis_storage_updated', carregarDados);
  }, [carregarDados]);

  const aprendenteAtual = aprendentes.find((a) => a.id === aprendenteSelecionadoId);

  const abrirModalNova = () => {
    setSessaoEditando(null);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      duracaoMinutos: 50,
      modalidade: 'presencial_consultorio',
      local: 'Consultório Principal - Sala A',
      objetivo: '',
      atividades: '',
      comportamentoObservado: '',
      estrategiasEficazes: '',
      dificuldadesEncontradas: '',
      avancosPercebidos: '',
      orientacoesFamiliaEscola: '',
      proximosPassos: '',
      status: 'finalizado',
    });
    setModalAberto(true);
  };

  const abrirModalEditar = (ses: Sessao) => {
    setSessaoEditando(ses);
    setFormData(ses);
    setModalAberto(true);
  };

  const handleSalvarSessao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objetivo?.trim()) {
      showToast('Por favor, informe o objetivo da sessão.', 'aviso');
      return;
    }

    const novaOuAtualizada: Sessao = {
      id: sessaoEditando ? sessaoEditando.id : `ses-${Date.now()}`,
      aprendenteId: aprendenteSelecionadoId,
      data: formData.data || new Date().toISOString().split('T')[0],
      duracaoMinutos: Number(formData.duracaoMinutos) || 50,
      modalidade: formData.modalidade || 'presencial_consultorio',
      local: formData.local || 'Consultório Principal',
      objetivo: formData.objetivo.trim(),
      atividades: formData.atividades?.trim() || '',
      comportamentoObservado: formData.comportamentoObservado?.trim() || '',
      estrategiasEficazes: formData.estrategiasEficazes?.trim() || '',
      dificuldadesEncontradas: formData.dificuldadesEncontradas?.trim() || '',
      avancosPercebidos: formData.avancosPercebidos?.trim() || '',
      orientacoesFamiliaEscola: formData.orientacoesFamiliaEscola?.trim() || '',
      proximosPassos: formData.proximosPassos?.trim() || '',
      anexos: sessaoEditando?.anexos || [],
      status: formData.status || 'finalizado',
    };

    storage.saveSessao(novaOuAtualizada);
    setModalAberto(false);
    showToast(
      sessaoEditando ? 'Sessão atualizada com sucesso!' : 'Nova sessão registrada com sucesso!',
      'sucesso'
    );
  };

  const handleExcluirConfirmado = () => {
    if (!modalExcluir.sessao) return;
    storage.deleteSessao(modalExcluir.sessao.id);
    showToast('Sessão transferida para a lixeira.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('aprendentes')}
            className="text-xs font-semibold text-[#176B73] hover:underline flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Aprendentes</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#183238]">
            Registro de Sessões Psicopedagógicas
          </h1>
          <p className="text-xs text-[#52676B] mt-0.5">
            Acompanhamento longitudinal de objetivos, mediações, avanços e orientações aos responsáveis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Aprendente */}
          <select
            value={aprendenteSelecionadoId}
            onChange={(e) => setAprendenteSelecionadoId(e.target.value)}
            className="text-xs py-2 px-3 bg-white border border-[#EEF5F4] rounded-xl text-[#183238] focus:outline-hidden focus:border-[#238B8D] font-medium"
          >
            {aprendentes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nomeCompleto} ({a.codigoInterno})
              </option>
            ))}
          </select>

          <button
            onClick={abrirModalNova}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[40px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Sessão</span>
          </button>
        </div>
      </div>

      {/* Timeline List of Sessions */}
      <div className="space-y-4">
        {sessoes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EEF5F4] p-12 text-center">
            <Clock className="w-12 h-12 text-[#52676B]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#183238]">Nenhuma sessão registrada</h3>
            <p className="text-xs text-[#52676B] max-w-sm mx-auto mt-1 mb-4">
              Registre a primeira sessão para documentar os procedimentos e a evolução psicopedagógica.
            </p>
            <button
              onClick={abrirModalNova}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl transition-colors"
            >
              Registrar Primeira Sessão
            </button>
          </div>
        ) : (
          sessoes.map((ses) => (
            <div
              key={ses.id}
              className="bg-white rounded-2xl border border-[#EEF5F4] p-5 shadow-xs space-y-3 hover:border-[#238B8D]/30 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF5F4] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5F4] text-[#176B73] flex items-center justify-center font-bold text-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#183238]">
                      Sessão em {ses.data} ({ses.duracaoMinutos} minutos)
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#52676B] mt-0.5">
                      <span className="capitalize">{ses.modalidade.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ses.local}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EEF5F4] text-[#176B73] capitalize">
                    {ses.status}
                  </span>
                  <button
                    onClick={() => abrirModalEditar(ses)}
                    title="Editar Sessão"
                    className="p-1.5 text-[#52676B] hover:text-[#176B73] hover:bg-[#EEF5F4] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setModalExcluir({ aberto: true, sessao: ses })}
                    title="Excluir Sessão"
                    className="p-1.5 text-[#52676B] hover:text-[#B54747] hover:bg-[#fee2e2]/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Session Core Details */}
              <div className="text-xs space-y-2">
                <div>
                  <strong className="text-[#176B73] block mb-0.5">Objetivo Pedagógico:</strong>
                  <p className="text-[#183238] font-medium">{ses.objetivo}</p>
                </div>

                {ses.atividades && (
                  <div>
                    <strong className="text-[#52676B] block mb-0.5">Atividades Realizadas:</strong>
                    <p className="text-[#183238] leading-relaxed">{ses.atividades}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {ses.estrategiasEficazes && (
                    <div className="p-3 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4]">
                      <strong className="text-[#238B8D] block mb-0.5">Estratégias que Funcionaram:</strong>
                      <p className="text-[#52676B] leading-relaxed">{ses.estrategiasEficazes}</p>
                    </div>
                  )}

                  {ses.dificuldadesEncontradas && (
                    <div className="p-3 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4]">
                      <strong className="text-[#A86B00] block mb-0.5">Dificuldades Observadas:</strong>
                      <p className="text-[#52676B] leading-relaxed">{ses.dificuldadesEncontradas}</p>
                    </div>
                  )}
                </div>

                {ses.avancosPercebidos && (
                  <div className="p-3 bg-[#e2f0e9]/50 rounded-xl border border-[#6FA58B]/20">
                    <strong className="text-[#5c8f78] block mb-0.5">Avanços Percebidos:</strong>
                    <p className="text-[#183238] leading-relaxed">{ses.avancosPercebidos}</p>
                  </div>
                )}

                {ses.orientacoesFamiliaEscola && (
                  <div>
                    <strong className="text-[#52676B] block mb-0.5">Orientações à Família / Escola:</strong>
                    <p className="text-[#183238] leading-relaxed">{ses.orientacoesFamiliaEscola}</p>
                  </div>
                )}

                {ses.proximosPassos && (
                  <div>
                    <strong className="text-[#52676B] block mb-0.5">Próximos Passos:</strong>
                    <p className="text-[#183238] leading-relaxed">{ses.proximosPassos}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Registro / Edição de Sessão */}
      {modalAberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#121c25] rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1e2d3b] max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2d3b] mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#008B94] dark:text-[#00E5FF]" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {sessaoEditando ? '✏️ Editar Registro de Sessão' : '✨ Novo Registro de Sessão'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182633] transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarSessao} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duração (min) *</label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    value={formData.duracaoMinutos}
                    onChange={(e) => setFormData({ ...formData, duracaoMinutos: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Modalidade</label>
                  <select
                    value={formData.modalidade}
                    onChange={(e) => setFormData({ ...formData, modalidade: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  >
                    <option value="presencial_consultorio">Presencial (Consultório)</option>
                    <option value="presencial_escola">Presencial (Escola)</option>
                    <option value="online">Online (Remoto)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Foco / Objetivo Central da Sessão *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Introduzir técnicas de leitura compreensiva e autoexplicação"
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Local do Atendimento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Consultório Principal - Sala A"
                    value={formData.local || ''}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status da Sessão
                  </label>
                  <select
                    value={formData.status || 'finalizado'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  >
                    <option value="finalizado">✅ Finalizada / Realizada</option>
                    <option value="revisado">🔍 Revisada</option>
                    <option value="rascunho">📝 Rascunho / Em Aberto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Atividades e Procedimentos Realizados (O que aconteceu na sessão)
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva materiais, jogos, mediações e o que foi realizado..."
                  value={formData.atividades}
                  onChange={(e) => setFormData({ ...formData, atividades: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#008B94] dark:text-[#00E5FF] mb-1">
                    Estratégias que Funcionaram
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Recursos que facilitaram a atenção e engajamento..."
                    value={formData.estrategiasEficazes}
                    onChange={(e) => setFormData({ ...formData, estrategiasEficazes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    Dificuldades Encontradas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Barreiras ou momentos de fadiga/dispersão..."
                    value={formData.dificuldadesEncontradas}
                    onChange={(e) => setFormData({ ...formData, dificuldadesEncontradas: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  Avanços Percebidos
                </label>
                <textarea
                  rows={2}
                  placeholder="Conquistas, maior autonomia ou iniciativa observada..."
                  value={formData.avancosPercebidos}
                  onChange={(e) => setFormData({ ...formData, avancosPercebidos: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Orientações à Família / Escola
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Manter quadro visual no quarto"
                    value={formData.orientacoesFamiliaEscola}
                    onChange={(e) => setFormData({ ...formData, orientacoesFamiliaEscola: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Próximos Passos
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Testar provas operatórias na próxima sessão"
                    value={formData.proximosPassos}
                    onChange={(e) => setFormData({ ...formData, proximosPassos: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1e2d3b]">
                {sessaoEditando ? (
                  <button
                    type="button"
                    onClick={() => {
                      const s = sessaoEditando;
                      setModalAberto(false);
                      setModalExcluir({ aberto: true, sessao: s });
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Sessão</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#182633] hover:bg-slate-200 dark:hover:bg-[#203444] rounded-xl transition-colors min-h-[40px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl shadow-xs transition-colors min-h-[40px] flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{sessaoEditando ? 'Salvar Alterações da Sessão' : 'Registrar Sessão'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão Segura */}
      <ConfirmModal
        isOpen={modalExcluir.aberto}
        onClose={() => setModalExcluir({ aberto: false })}
        onConfirm={handleExcluirConfirmado}
        tipo="excluir"
        titulo="Excluir Registro de Sessão"
        itemIdentificador={`Sessão do dia ${modalExcluir.sessao?.data || ''}`}
        mensagemExtra="O registro será enviado para a lixeira local e poderá ser restaurado nas Configurações se necessário."
      />
    </div>
  );
};
