'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  FileText,
  Clock,
  Calendar,
  Layers,
  FileSpreadsheet,
  Lock,
  ArrowLeft,
  Edit2,
  Plus,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronRight,
  TrendingUp,
  FolderOpen,
  Printer,
  Trash2,
  X,
  Save,
  Check
} from 'lucide-react';
import { storage } from '@/lib/storage';
import {
  Aprendente,
  Sessao,
  Anamnese,
  AvaliacaoPsicopedagogica,
  RelatorioPsicopedagogico,
  RegistroEvolucaoDominio
} from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AprendenteDetailViewProps {
  aprendenteId: string;
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const AprendenteDetailView: React.FC<AprendenteDetailViewProps> = ({
  aprendenteId,
  onNavigate,
}) => {
  const [aprendente, setAprendente] = useState<Aprendente | undefined>();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [anamnese, setAnamnese] = useState<Anamnese | undefined>();
  const [avaliacao, setAvaliacao] = useState<AvaliacaoPsicopedagogica | undefined>();
  const [relatorios, setRelatorios] = useState<RelatorioPsicopedagogico[]>([]);
  const [evolucao, setEvolucao] = useState<RegistroEvolucaoDominio[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<
    'resumo' | 'timeline' | 'evolucao' | 'formularios' | 'relatorios' | 'documentos' | 'notas'
  >('resumo');
  const [comentarioEvolucao, setComentarioEvolucao] = useState(
    'Avanço consistente observado na postura metacognitiva e regulação do tempo de estudo.'
  );
  const [notasTexto, setNotasTexto] = useState('');

  // Session Edit / Creation Modal State
  const [modalSessaoAberta, setModalSessaoAberta] = useState(false);
  const [sessaoEditando, setSessaoEditando] = useState<Sessao | null>(null);
  const [sessaoForm, setSessaoForm] = useState<Partial<Sessao>>({
    data: new Date().toISOString().split('T')[0],
    duracaoMinutos: 50,
    modalidade: 'presencial_consultorio',
    local: 'Consultório Principal',
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
  const [modalExcluirSessao, setModalExcluirSessao] = useState<{ aberto: boolean; sessao?: Sessao }>({
    aberto: false,
  });
  const [modalExcluirAprendente, setModalExcluirAprendente] = useState(false);
  const [modalExcluirRelatorio, setModalExcluirRelatorio] = useState<{ aberto: boolean; relatorio?: RelatorioPsicopedagogico }>({
    aberto: false,
  });
  const [modalExcluirFormulario, setModalExcluirFormulario] = useState<{ aberto: boolean; tipo?: 'anamnese' | 'avaliacao' }>({
    aberto: false,
  });

  const handleConfirmarExcluirAprendente = () => {
    if (!aprendente) return;
    storage.deleteAprendente(aprendente.id);
    showToast(`Aprendente ${aprendente.nomeCompleto} movido para a lixeira.`, 'info');
    onNavigate('aprendentes');
  };

  const handleConfirmarExcluirRelatorio = () => {
    if (!modalExcluirRelatorio.relatorio) return;
    storage.deleteRelatorio(modalExcluirRelatorio.relatorio.id);
    setRelatorios(storage.getRelatorios().filter((r) => r.aprendenteId === aprendenteId));
    setModalExcluirRelatorio({ aberto: false });
    showToast('Relatório transferido para a lixeira.', 'info');
  };

  const handleConfirmarExcluirFormulario = () => {
    if (!modalExcluirFormulario.tipo || !aprendente) return;
    if (modalExcluirFormulario.tipo === 'anamnese') {
      storage.deleteAnamnese(aprendente.id);
      setAnamnese(undefined);
      showToast('Anamnese excluída e transferida para a lixeira.', 'info');
    } else if (modalExcluirFormulario.tipo === 'avaliacao') {
      storage.deleteAvaliacao(aprendente.id);
      setAvaliacao(undefined);
      showToast('Avaliação excluída e transferida para a lixeira.', 'info');
    }
    setModalExcluirFormulario({ aberto: false });
  };

  const carregarTudo = useCallback(() => {
    const apr = storage.getAprendenteById(aprendenteId);
    setAprendente(apr);
    if (apr) {
      setNotasTexto(apr.notasInternas || '');
      setSessoes(storage.getSessoesByAprendente(apr.id));
      setAnamnese(storage.getAnamneseByAprendente(apr.id));
      setAvaliacao(storage.getAvaliacaoByAprendente(apr.id));
      setRelatorios(storage.getRelatorios().filter((r) => r.aprendenteId === apr.id));
      setEvolucao(storage.getEvolucao(apr.id));
    }
  }, [aprendenteId]);

  const handleSalvarNotas = () => {
    if (!aprendente) return;
    const atualizado: Aprendente = {
      ...aprendente,
      notasInternas: notasTexto,
      atualizadoEm: new Date().toISOString().split('T')[0],
    };
    storage.saveAprendente(atualizado);
    setAprendente(atualizado);
    showToast('Notas confidenciais salvas com sucesso!', 'sucesso');
  };

  useEffect(() => {
    carregarTudo();
    window.addEventListener('praxis_storage_updated', carregarTudo);
    return () => window.removeEventListener('praxis_storage_updated', carregarTudo);
  }, [carregarTudo]);

  const handleAbrirNovaSessao = () => {
    if (!aprendente) return;
    setSessaoEditando(null);
    setSessaoForm({
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
    setModalSessaoAberta(true);
  };

  const handleAbrirEditarSessao = (ses: Sessao) => {
    setSessaoEditando(ses);
    setSessaoForm({ ...ses });
    setModalSessaoAberta(true);
  };

  const handleSalvarSessao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aprendente) return;
    if (!sessaoForm.objetivo?.trim()) {
      showToast('Por favor, informe o objetivo ou nome da sessão.', 'aviso');
      return;
    }

    const novaOuAtualizada: Sessao = {
      id: sessaoEditando ? sessaoEditando.id : `ses-${Date.now()}`,
      aprendenteId: aprendente.id,
      data: sessaoForm.data || new Date().toISOString().split('T')[0],
      duracaoMinutos: Number(sessaoForm.duracaoMinutos) || 50,
      modalidade: sessaoForm.modalidade || 'presencial_consultorio',
      local: sessaoForm.local || 'Consultório Principal',
      objetivo: sessaoForm.objetivo.trim(),
      atividades: sessaoForm.atividades || '',
      comportamentoObservado: sessaoForm.comportamentoObservado || '',
      estrategiasEficazes: sessaoForm.estrategiasEficazes || '',
      dificuldadesEncontradas: sessaoForm.dificuldadesEncontradas || '',
      avancosPercebidos: sessaoForm.avancosPercebidos || '',
      orientacoesFamiliaEscola: sessaoForm.orientacoesFamiliaEscola || '',
      proximosPassos: sessaoForm.proximosPassos || '',
      status: sessaoForm.status || 'finalizado',
      anexos: sessaoEditando?.anexos || [],
    };

    storage.saveSessao(novaOuAtualizada);
    showToast(
      sessaoEditando ? 'Sessão atualizada com sucesso na linha do tempo!' : 'Nova sessão registrada com sucesso!',
      'sucesso'
    );
    setModalSessaoAberta(false);
    setSessaoEditando(null);
    carregarTudo();
  };

  const handleExcluirSessao = () => {
    if (!modalExcluirSessao.sessao) return;
    storage.deleteSessao(modalExcluirSessao.sessao.id);
    showToast('Sessão removida.', 'info');
    setModalExcluirSessao({ aberto: false });
    carregarTudo();
  };

  if (!aprendente) {
    return (
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-12 text-center">
        <Users className="w-12 h-12 text-[#52676B]/40 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#183238]">Aprendente não encontrado</h2>
        <p className="text-xs text-[#52676B] mt-1 mb-4">
          O registro solicitado pode ter sido excluído ou arquivado.
        </p>
        <button
          onClick={() => onNavigate('aprendentes')}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl transition-colors"
        >
          Voltar para a Lista
        </button>
      </div>
    );
  }

  const initials = aprendente.nomeCompleto
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const resp = aprendente.paisResponsaveis.find((r) => r.responsavelLegal) || aprendente.paisResponsaveis[0];

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Link and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('aprendentes')}
            className="text-xs font-semibold text-[#176B73] hover:underline flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Lista de Aprendentes</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF5F4] text-[#176B73] font-bold text-base flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183238]">
                  {aprendente.nomeCompleto}
                </h1>
                <span className="text-xs font-mono text-[#52676B] bg-[#F7FAFA] px-2 py-0.5 rounded-md border border-[#EEF5F4]">
                  {aprendente.codigoInterno}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#52676B] mt-0.5">
                <span>{aprendente.idadeCalculada} anos</span>
                <span aria-hidden="true">·</span>
                <span>{aprendente.contextoEscolar.etapaAno}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize font-medium text-[#176B73]">
                  {aprendente.status === 'avaliacao' ? 'Avaliação Inicial' : 'Em Acompanhamento'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('aprendente-novo', { id: aprendente.id })}
            title="Editar Cadastro e Dados do Paciente"
            className="px-3.5 py-2 text-xs font-semibold text-[#008B94] dark:text-[#00E5FF] bg-[#EEF5F4] dark:bg-[#182633] hover:bg-[#d4ecec] dark:hover:bg-[#223544] border border-[#d4ecec] dark:border-[#223544] rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar Paciente</span>
          </button>

          <button
            onClick={() => {
              showToast('Preparando impressão/PDF da Ficha...', 'info');
              setTimeout(() => window.print(), 350);
            }}
            title="Exportar em PDF ou Imprimir Ficha do Aprendente"
            className="px-3.5 py-2 text-xs font-semibold text-[#52676B] hover:text-[#183238] bg-white border border-[#EEF5F4] rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 no-print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={() => onNavigate('anamnese', { id: aprendente.id })}
            className="px-3.5 py-2 text-xs font-semibold text-[#176B73] bg-[#EEF5F4] hover:bg-[#d4ecec] rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Anamnese</span>
          </button>

          <button
            onClick={() => onNavigate('sessoes', { id: aprendente.id })}
            className="px-3.5 py-2 text-xs font-semibold text-[#176B73] bg-[#EEF5F4] hover:bg-[#d4ecec] rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Registrar Sessão</span>
          </button>

          <button
            onClick={() => onNavigate('relatorio-novo', { aprendenteId: aprendente.id })}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors min-h-[40px] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Relatório</span>
          </button>

          <button
            onClick={() => setModalExcluirAprendente(true)}
            title="Excluir este aprendente e transferir para a lixeira"
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Paciente</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Segmented Bar) */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-1.5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'resumo', label: 'Resumo Geral', icon: Users },
            { id: 'timeline', label: 'Linha do Tempo', icon: Clock },
            { id: 'evolucao', label: 'Evolução & Domínios', icon: TrendingUp },
            { id: 'formularios', label: 'Formulários', icon: FileSpreadsheet },
            { id: 'relatorios', label: 'Relatórios', icon: FileText },
            { id: 'documentos', label: 'Documentos', icon: FolderOpen },
            { id: 'notas', label: 'Notas Internas', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = abaAtiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#EEF5F4] text-[#176B73] font-bold shadow-xs'
                    : 'text-[#52676B] hover:text-[#183238] hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#176B73]' : 'text-[#52676B]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: Resumo */}
      {abaAtiva === 'resumo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Main Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Núcleo Familiar */}
            <div className="bg-white rounded-2xl border border-[#EEF5F4] p-5 space-y-3">
              <h2 className="text-sm font-bold text-[#183238] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B7BB5]" />
                <span>Pais e Responsáveis Legais</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {aprendente.paisResponsaveis.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#183238]">{r.nomeCompleto}</span>
                      <span className="text-[11px] text-[#8B7BB5] font-semibold">{r.parentesco}</span>
                    </div>
                    <p className="text-[#52676B]">{r.telefone} · {r.email || 'Sem e-mail'}</p>
                    <p className="text-[11px] text-[#52676B] italic">{r.melhorContato}</p>
                    {r.autorizacaoConsentimento && (
                      <div className="pt-1.5 border-t border-[#EEF5F4] flex items-center gap-1.5 text-[10px] text-[#5c8f78]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Consentimento registrado em {r.autorizacaoConsentimento.dataAutorizacao}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contexto Escolar */}
            <div className="bg-white rounded-2xl border border-[#EEF5F4] p-5 space-y-3">
              <h2 className="text-sm font-bold text-[#183238] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6FA58B]" />
                <span>Contexto Escolar e Apoios</span>
              </h2>
              <div className="text-xs space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F7FAFA] p-3 rounded-xl border border-[#EEF5F4]">
                  <div>
                    <span className="text-[11px] text-[#52676B] block">Escola</span>
                    <strong className="text-[#183238] font-semibold">{aprendente.contextoEscolar.instituicao}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#52676B] block">Etapa / Ano</span>
                    <strong className="text-[#183238] font-semibold">{aprendente.contextoEscolar.etapaAno}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#52676B] block">Turno</span>
                    <strong className="text-[#183238] font-semibold">{aprendente.contextoEscolar.turno}</strong>
                  </div>
                </div>

                {aprendente.contextoEscolar.demandasEscolares && (
                  <div className="p-3 rounded-xl border border-[#EEF5F4]">
                    <span className="text-[11px] font-semibold text-[#183238] block mb-0.5">
                      Demandas apontadas pela escola:
                    </span>
                    <p className="text-[#52676B] leading-relaxed">
                      {aprendente.contextoEscolar.demandasEscolares}
                    </p>
                  </div>
                )}

                {aprendente.contextoEscolar.adaptacoesApoios && (
                  <div className="p-3 rounded-xl border border-[#EEF5F4]">
                    <span className="text-[11px] font-semibold text-[#183238] block mb-0.5">
                      Adaptações e apoios em vigor:
                    </span>
                    <p className="text-[#52676B] leading-relaxed">
                      {aprendente.contextoEscolar.adaptacoesApoios}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Status Summary & Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#EEF5F4] p-5 space-y-4">
              <h2 className="text-sm font-bold text-[#183238]">Prontuário Rápido</h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EEF5F4]">
                  <span className="text-[#52676B]">Sessões Realizadas</span>
                  <strong className="text-[#183238] tabular-nums font-bold text-sm">{sessoes.length}</strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#EEF5F4]">
                  <span className="text-[#52676B]">Anamnese</span>
                  <span className={`font-semibold ${anamnese ? 'text-[#5c8f78]' : 'text-[#A86B00]'}`}>
                    {anamnese ? (anamnese.status === 'finalizado' ? 'Concluída' : 'Em Rascunho') : 'Pendente'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#EEF5F4]">
                  <span className="text-[#52676B]">Avaliação Diagnóstica</span>
                  <span className={`font-semibold ${avaliacao ? 'text-[#5c8f78]' : 'text-[#52676B]'}`}>
                    {avaliacao ? 'Realizada' : 'Não iniciada'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#52676B]">Relatórios Emitidos</span>
                  <strong className="text-[#183238] tabular-nums font-bold text-sm">{relatorios.length}</strong>
                </div>
              </div>
            </div>

            {/* Acolhimento Reminder */}
            <div className="bg-[#f0f8f8] dark:bg-[#0c1822] border border-[#d4ecec] dark:border-[#193240] rounded-2xl p-4 text-xs text-[#183238] dark:text-[#a0c0c6] space-y-2 transition-colors">
              <h3 className="font-bold text-[#176B73] dark:text-[#00E5FF] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Diretriz Profissional Ética</span>
              </h3>
              <p className="text-[#52676B] dark:text-[#8da4ac] leading-relaxed">
                As informações registradas têm finalidade exclusivamente pedagógica e terapêutica de apoio ao desenvolvimento, sem pretensão classificatória ou diagnóstica definitiva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Linha do Tempo */}
      {abaAtiva === 'timeline' && (
        <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-5 sm:p-6 space-y-6 animate-in fade-in duration-150 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#183238] dark:text-white">Linha do Tempo dos Atendimentos</h2>
              <p className="text-xs text-[#52676B] dark:text-slate-400">
                Registro sequencial de anamneses, sessões de intervenção e relatórios emitidos. Todas as sessões são totalmente editáveis.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAbrirNovaSessao}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Sessão</span>
            </button>
          </div>

          <div className="relative border-l-2 border-[#EEF5F4] dark:border-[#1e2d3b] ml-4 pl-6 space-y-6">
            {sessoes.length === 0 && (
              <p className="text-xs text-[#52676B] dark:text-slate-400 py-4">Nenhuma sessão registrada ainda.</p>
            )}

            {sessoes.map((ses) => (
              <div key={ses.id} className="relative group">
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#008B94] dark:bg-[#00E5FF] border-4 border-white dark:border-[#121c25] shadow-xs" />
                <div className="bg-[#F7FAFA] dark:bg-[#0e1720] border border-[#EEF5F4] dark:border-[#1e2d3b] rounded-2xl p-4 sm:p-5 space-y-2.5 hover:border-[#238B8D]/40 dark:hover:border-[#00E5FF]/40 transition-colors shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1e2d3b] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#183238] dark:text-white">
                        Sessão em {ses.data} ({ses.duracaoMinutos} min)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EEF5F4] dark:bg-[#182633] text-[#008B94] dark:text-[#00E5FF] font-semibold capitalize">
                        {ses.modalidade.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Botões de Ação da Sessão na Linha do Tempo */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAbrirEditarSessao(ses)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#008B94] hover:text-[#007a82] dark:text-[#00E5FF] bg-white dark:bg-[#182633] hover:bg-teal-50 dark:hover:bg-[#203444] border border-[#d4ecec] dark:border-[#223544] rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        title="Editar data, nome, atividades e dados desta sessão"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalExcluirSessao({ aberto: true, sessao: ses })}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Excluir sessão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#008B94] dark:text-[#00E5FF]">
                    Foco / Objetivo: <span className="font-normal text-[#183238] dark:text-slate-200">{ses.objetivo}</span>
                  </p>

                  {ses.atividades && (
                    <p className="text-xs text-[#52676B] dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-700 dark:text-slate-200">Atividades:</strong> {ses.atividades}
                    </p>
                  )}

                  {ses.comportamentoObservado && (
                    <p className="text-xs text-[#52676B] dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-700 dark:text-slate-200">Comportamento:</strong> {ses.comportamentoObservado}
                    </p>
                  )}

                  {ses.avancosPercebidos && (
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 p-2 rounded-lg">
                      <strong>Avanços percebidos:</strong> {ses.avancosPercebidos}
                    </p>
                  )}

                  {ses.orientacoesFamiliaEscola && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#121c25] p-2 rounded-lg border border-slate-100 dark:border-[#1e2d3b]">
                      <strong>Orientações / Próximos passos:</strong> {ses.orientacoesFamiliaEscola}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Evolução e Domínios */}
      {abaAtiva === 'evolucao' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#EEF5F4] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EEF5F4] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#183238]">
                  Evolução Qualitativa por Domínios de Acompanhamento
                </h2>
                <p className="text-xs text-[#52676B]">
                  Representação descritiva de evidências observadas ao longo do processo psicopedagógico (sem notas clínicas diagnósticas).
                </p>
              </div>
              <span className="text-xs font-mono text-[#52676B]">
                Comparativo: Ciclo Inicial vs Ciclo Recente
              </span>
            </div>

            {/* SVG Visual Chart: Radar & Domain Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Custom SVG Radar Chart */}
              <div className="flex flex-col items-center justify-center p-4 bg-[#F7FAFA] rounded-2xl border border-[#EEF5F4]">
                <h3 className="text-xs font-bold text-[#183238] mb-2">
                  Mapa Poligonal de Domínios Observados
                </h3>
                <svg viewBox="0 0 400 400" className="w-full max-w-[320px] h-auto">
                  {/* Concentric Polygons */}
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const r = lvl * 28;
                    const points = [0, 1, 2, 3, 4, 5, 6]
                      .map((i) => {
                        const angle = (Math.PI * 2 * i) / 7 - Math.PI / 2;
                        return `${200 + r * Math.cos(angle)},${200 + r * Math.sin(angle)}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={lvl}
                        points={points}
                        fill="none"
                        stroke="#cdd9da"
                        strokeWidth="1"
                        strokeDasharray={lvl === 5 ? 'none' : '3 3'}
                      />
                    );
                  })}

                  {/* Axes */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const angle = (Math.PI * 2 * i) / 7 - Math.PI / 2;
                    return (
                      <line
                        key={i}
                        x1="200"
                        y1="200"
                        x2={200 + 140 * Math.cos(angle)}
                        y2={200 + 140 * Math.sin(angle)}
                        stroke="#e2eceb"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Initial Cycle Area (Lavanda / Secondary) */}
                  <polygon
                    points={[
                      [200, 200 - 2 * 28],
                      [200 + 2 * 28 * Math.cos((Math.PI * 2) / 7 - Math.PI / 2), 200 + 2 * 28 * Math.sin((Math.PI * 2) / 7 - Math.PI / 2)],
                      [200 + 3 * 28 * Math.cos((Math.PI * 4) / 7 - Math.PI / 2), 200 + 3 * 28 * Math.sin((Math.PI * 4) / 7 - Math.PI / 2)],
                      [200 + 2 * 28 * Math.cos((Math.PI * 6) / 7 - Math.PI / 2), 200 + 2 * 28 * Math.sin((Math.PI * 6) / 7 - Math.PI / 2)],
                      [200 + 1 * 28 * Math.cos((Math.PI * 8) / 7 - Math.PI / 2), 200 + 1 * 28 * Math.sin((Math.PI * 8) / 7 - Math.PI / 2)],
                      [200 + 3 * 28 * Math.cos((Math.PI * 10) / 7 - Math.PI / 2), 200 + 3 * 28 * Math.sin((Math.PI * 10) / 7 - Math.PI / 2)],
                      [200 + 4 * 28 * Math.cos((Math.PI * 12) / 7 - Math.PI / 2), 200 + 4 * 28 * Math.sin((Math.PI * 12) / 7 - Math.PI / 2)],
                    ].map((p) => p.join(',')).join(' ')}
                    fill="#8B7BB5"
                    fillOpacity="0.25"
                    stroke="#8B7BB5"
                    strokeWidth="2"
                  />

                  {/* Current Cycle Area (Azul-petróleo / Primary) */}
                  <polygon
                    points={[
                      [200, 200 - 4 * 28],
                      [200 + 4 * 28 * Math.cos((Math.PI * 2) / 7 - Math.PI / 2), 200 + 4 * 28 * Math.sin((Math.PI * 2) / 7 - Math.PI / 2)],
                      [200 + 4 * 28 * Math.cos((Math.PI * 4) / 7 - Math.PI / 2), 200 + 4 * 28 * Math.sin((Math.PI * 4) / 7 - Math.PI / 2)],
                      [200 + 4 * 28 * Math.cos((Math.PI * 6) / 7 - Math.PI / 2), 200 + 4 * 28 * Math.sin((Math.PI * 6) / 7 - Math.PI / 2)],
                      [200 + 4 * 28 * Math.cos((Math.PI * 8) / 7 - Math.PI / 2), 200 + 4 * 28 * Math.sin((Math.PI * 8) / 7 - Math.PI / 2)],
                      [200 + 4 * 28 * Math.cos((Math.PI * 10) / 7 - Math.PI / 2), 200 + 4 * 28 * Math.sin((Math.PI * 10) / 7 - Math.PI / 2)],
                      [200 + 5 * 28 * Math.cos((Math.PI * 12) / 7 - Math.PI / 2), 200 + 5 * 28 * Math.sin((Math.PI * 12) / 7 - Math.PI / 2)],
                    ].map((p) => p.join(',')).join(' ')}
                    fill="#176B73"
                    fillOpacity="0.35"
                    stroke="#176B73"
                    strokeWidth="2.5"
                  />
                </svg>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#8B7BB5]" />
                    <span className="text-[#52676B]">Ciclo Inicial (Set/2025)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#176B73]" />
                    <span className="text-[#183238] font-bold">Ciclo Atual (Mar/2026)</span>
                  </div>
                </div>
              </div>

              {/* Textual Description for Accessibility (WCAG 2.2) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#183238] uppercase tracking-wider text-[#176B73]">
                  Descrição Textual dos Domínios Observados (Acessibilidade)
                </h3>

                <div className="space-y-2 text-xs">
                  {[
                    { dom: 'Leitura e Compreensão', status: 'Evoluiu de leitura mecânica para elaboração autônoma de resumos.' },
                    { dom: 'Produção Textual', status: 'Avanço na estrutura narrativa e uso de mapas mentais prévios.' },
                    { dom: 'Raciocínio Lógico-Matemático', status: 'Conquista de autonomia na resolução de frações e problemas.' },
                    { dom: 'Atenção e Autorregulação', status: 'Adoção autônoma de pausas ativas e blocos Pomodoro adaptados.' },
                    { dom: 'Organização e Funções Executivas', status: 'Quadro visual consolidado; materiais prontos com antecedência.' },
                    { dom: 'Comunicação e Expressão', status: 'Maior proatividade para esclarecer dúvidas com professores.' },
                    { dom: 'Habilidades Psicomotoras', status: 'Excelente coordenação visomotora e traçado geométrico preciso.' },
                  ].map((d, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]">
                      <strong className="text-[#183238] block">{d.dom}</strong>
                      <span className="text-[#52676B] text-[11px]">{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contextual Professional Comment */}
            <div className="pt-4 border-t border-[#EEF5F4] space-y-2">
              <label className="block text-xs font-bold text-[#183238]">
                Parecer Descritivo do Período (Anotação de Evolução)
              </label>
              <textarea
                rows={2}
                value={comentarioEvolucao}
                onChange={(e) => setComentarioEvolucao(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
              <button
                type="button"
                onClick={() => showToast('Comentário de evolução salvo com sucesso!', 'sucesso')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl transition-colors"
              >
                Salvar Comentário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Formulários */}
      {abaAtiva === 'formularios' && (
        <div className="bg-white rounded-2xl border border-[#EEF5F4] p-6 space-y-4 animate-in fade-in duration-150">
          <h2 className="text-base font-bold text-[#183238]">Formulários Psicopedagógicos Vinculados</h2>
          <p className="text-xs text-[#52676B]">
            Instrumentos de anamnese, acompanhamento escolar e avaliações aplicadas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => onNavigate('anamnese', { id: aprendente.id })}
              className="p-4 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#121c25] hover:border-[#176B73]/40 dark:hover:border-[#00E5FF]/40 transition-colors cursor-pointer space-y-2 group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#183238] dark:text-white group-hover:text-[#176B73] dark:group-hover:text-[#00E5FF]">
                  Anamnese Psicopedagógica Completa
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EEF5F4] dark:bg-[#182633] text-[#176B73] dark:text-[#00E5FF] capitalize">
                  {anamnese ? anamnese.status : 'Iniciar'}
                </span>
              </div>
              <p className="text-xs text-[#52676B] dark:text-slate-400">
                15 seções com separação de relato da família e hipóteses de intervenção.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1e2d3b]">
                <div className="text-[11px] text-[#176B73] dark:text-[#00E5FF] font-semibold flex items-center gap-1">
                  <span>Abrir Formulário</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
                {anamnese && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalExcluirFormulario({ aberto: true, tipo: 'anamnese' });
                    }}
                    title="Excluir Anamnese"
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            </div>

            <div
              onClick={() => onNavigate('avaliacao', { id: aprendente.id })}
              className="p-4 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#121c25] hover:border-[#176B73]/40 dark:hover:border-[#00E5FF]/40 transition-colors cursor-pointer space-y-2 group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#183238] dark:text-white group-hover:text-[#176B73] dark:group-hover:text-[#00E5FF]">
                  Síntese de Avaliação Psicopedagógica
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#e2f0e9] dark:bg-emerald-950/50 text-[#5c8f78] dark:text-emerald-400">
                  {avaliacao ? 'Preenchido' : 'Iniciar'}
                </span>
              </div>
              <p className="text-xs text-[#52676B] dark:text-slate-400">
                Objetivos, procedimentos, barreiras, potencialidades e recomendações.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1e2d3b]">
                <div className="text-[11px] text-[#176B73] dark:text-[#00E5FF] font-semibold flex items-center gap-1">
                  <span>Visualizar Avaliação</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
                {avaliacao && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalExcluirFormulario({ aberto: true, tipo: 'avaliacao' });
                    }}
                    title="Excluir Avaliação"
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Relatórios */}
      {abaAtiva === 'relatorios' && (
        <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-6 space-y-4 animate-in fade-in duration-150 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#183238] dark:text-white">Relatórios deste Aprendente</h2>
              <p className="text-xs text-[#52676B] dark:text-slate-400">Documentos estruturados para família e escola</p>
            </div>
            <button
              onClick={() => onNavigate('relatorio-novo', { aprendenteId: aprendente.id })}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Relatório</span>
            </button>
          </div>

          {relatorios.length === 0 ? (
            <p className="text-xs text-[#52676B] dark:text-slate-400 py-6 text-center">Nenhum relatório emitido para este aprendente.</p>
          ) : (
            <div className="space-y-3">
              {relatorios.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onNavigate('relatorio-visualizar', { id: rel.id })}
                  className="p-4 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#0e1720] hover:bg-[#F7FAFA] dark:hover:bg-[#182633] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-[#183238] dark:text-white group-hover:text-[#008B94] dark:group-hover:text-[#00E5FF] truncate">
                      {rel.titulo}
                    </h3>
                    <p className="text-[11px] text-[#52676B] dark:text-slate-400 font-mono mt-0.5">
                      {rel.codigoDocumento} · Criado em {rel.dataCriacao}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EEF5F4] dark:bg-[#182633] text-[#176B73] dark:text-[#00E5FF] capitalize">
                      {rel.status === 'finalizado' ? 'Finalizado' : rel.status === 'em_revisao' ? 'Em Revisão' : rel.status === 'enviado' ? 'Enviado' : 'Rascunho'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('relatorio-novo', { id: rel.id, aprendenteId: aprendente.id });
                      }}
                      title="Editar Relatório"
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f3040] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalExcluirRelatorio({ aberto: true, relatorio: rel });
                      }}
                      title="Excluir Relatório"
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Documentos / Anexos */}
      {abaAtiva === 'documentos' && (
        <div className="bg-white rounded-2xl border border-[#EEF5F4] p-6 space-y-4 animate-in fade-in duration-150">
          <h2 className="text-base font-bold text-[#183238]">Documentos e Encaminhamentos</h2>
          <p className="text-xs text-[#52676B]">
            Placeholders de arquivos demonstrativos recebidos da escola e equipe multidisciplinar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { nome: 'relatorio_escolar_anterior.pdf', data: '15/01/2026', tam: '184 KB' },
              { nome: 'parecer_fonoaudiologico_demo.pdf', data: '02/02/2026', tam: '240 KB' },
              { nome: 'avaliacao_oftalmologica_normal.pdf', data: '10/12/2025', tam: '95 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] flex items-center justify-between text-xs">
                <div>
                  <strong className="text-[#183238] block">{doc.nome}</strong>
                  <span className="text-[11px] text-[#52676B]">{doc.data} · {doc.tam}</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast(`Download demonstrativo de ${doc.nome}`, 'info')}
                  className="px-2.5 py-1 text-xs font-semibold text-[#176B73] hover:underline"
                >
                  Baixar (Demo)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Notas Internas */}
      {abaAtiva === 'notas' && (
        <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-6 space-y-4 animate-in fade-in duration-150 transition-colors shadow-xs">
          <div className="flex items-center gap-2 text-[#A86B00] dark:text-amber-400">
            <Lock className="w-4 h-4" />
            <h2 className="text-sm font-bold text-[#183238] dark:text-white">Notas Confidenciais do Profissional</h2>
          </div>
          <p className="text-xs text-[#52676B] dark:text-slate-400 leading-relaxed">
            Este conteúdo é exclusivo para anotações reflexivas do psicopedagogo e nunca é incluído em relatórios ou impressões compartilhadas com terceiros.
          </p>

          <textarea
            rows={5}
            value={notasTexto}
            onChange={(e) => setNotasTexto(e.target.value)}
            placeholder="Digite aqui as notas confidenciais e hipóteses de trabalho sobre este paciente..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] leading-relaxed"
          />

          <button
            type="button"
            onClick={handleSalvarNotas}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl transition-colors shadow-xs"
          >
            Salvar Notas
          </button>
        </div>
      )}

      {/* Modal para Adicionar ou Editar Sessão na Linha do Tempo */}
      {modalSessaoAberta && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#121c25] rounded-3xl border border-slate-200 dark:border-[#1e2d3b] shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1e2d3b] mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{sessaoEditando ? '✏️ Editar Sessão na Linha do Tempo' : '✨ Nova Sessão de Atendimento'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Edite a data, o nome/objetivo, o que aconteceu na sessão e todas as observações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalSessaoAberta(false);
                  setSessaoEditando(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182633] rounded-xl transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarSessao} className="space-y-4">
              {/* Data, Duração e Modalidade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data da Sessão *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessaoForm.data || ''}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, data: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    value={sessaoForm.duracaoMinutos || 50}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, duracaoMinutos: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Modalidade
                  </label>
                  <select
                    value={sessaoForm.modalidade || 'presencial_consultorio'}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, modalidade: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  >
                    <option value="presencial_consultorio">Presencial (Consultório)</option>
                    <option value="presencial_escola">Presencial (Escola)</option>
                    <option value="online">Online (Remoto)</option>
                  </select>
                </div>
              </div>

              {/* Nome / Objetivo da Sessão */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome / Foco / Objetivo da Sessão *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sessão 3 - Acolhimento, mediação de leitura e raciocínio lógico"
                  value={sessaoForm.objetivo || ''}
                  onChange={(e) => setSessaoForm({ ...sessaoForm, objetivo: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              {/* Local e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Local do Atendimento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Consultório Principal - Sala A"
                    value={sessaoForm.local || ''}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, local: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status da Sessão
                  </label>
                  <select
                    value={sessaoForm.status || 'finalizado'}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, status: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  >
                    <option value="finalizado">✅ Finalizada / Realizada</option>
                    <option value="revisado">🔍 Revisada</option>
                    <option value="rascunho">📝 Rascunho / Em Aberto</option>
                  </select>
                </div>
              </div>

              {/* Atividades e O que aconteceu */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ✍️ O que aconteceu na sessão / Atividades e procedimentos realizados
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva as dinâmicas, materiais, jogos lúdicos e o desenrolar do atendimento de hoje..."
                  value={sessaoForm.atividades || ''}
                  onChange={(e) => setSessaoForm({ ...sessaoForm, atividades: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] leading-relaxed font-sans"
                />
              </div>

              {/* Comportamento e Engajamento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Comportamento e postura observados
                </label>
                <textarea
                  rows={2}
                  placeholder="Postura do aprendente perante desafios, receptividade às intervenções, foco..."
                  value={sessaoForm.comportamentoObservado || ''}
                  onChange={(e) => setSessaoForm({ ...sessaoForm, comportamentoObservado: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              {/* Estratégias e Dificuldades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#008B94] dark:text-[#00E5FF] mb-1">
                    Estratégias que funcionaram
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Recursos facilitadores, pausas, mediação visual..."
                    value={sessaoForm.estrategiasEficazes || ''}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, estrategiasEficazes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    Dificuldades ou resistências encontradas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Momentos de cansaço, dispersão ou bloqueios..."
                    value={sessaoForm.dificuldadesEncontradas || ''}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, dificuldadesEncontradas: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Avanços e Orientações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    Avanços percebidos nesta sessão
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conquistas, maior autonomia ou melhor regulação..."
                    value={sessaoForm.avancosPercebidos || ''}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, avancosPercebidos: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Orientações à família ou escola
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Combinações para casa ou ambiente escolar..."
                    value={sessaoForm.orientacoesFamiliaEscola || ''}
                    onChange={(e) => setSessaoForm({ ...sessaoForm, orientacoesFamiliaEscola: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Próximos Passos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Próximos passos planejados
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dar continuidade com jogos de memória operacional na próxima semana"
                  value={sessaoForm.proximosPassos || ''}
                  onChange={(e) => setSessaoForm({ ...sessaoForm, proximosPassos: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1e2d3b]">
                {sessaoEditando ? (
                  <button
                    type="button"
                    onClick={() => {
                      const s = sessaoEditando;
                      setModalSessaoAberta(false);
                      setModalExcluirSessao({ aberto: true, sessao: s });
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
                    onClick={() => {
                      setModalSessaoAberta(false);
                      setSessaoEditando(null);
                    }}
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

      {/* Modal de Exclusão de Sessão */}
      <ConfirmModal
        isOpen={modalExcluirSessao.aberto}
        onClose={() => setModalExcluirSessao({ aberto: false })}
        onConfirm={handleExcluirSessao}
        tipo="excluir"
        titulo="Excluir Sessão da Linha do Tempo"
        itemIdentificador={`Sessão do dia ${modalExcluirSessao.sessao?.data || ''}`}
        mensagemExtra="Esta sessão será transferida para a lixeira."
      />

      {/* Modal de Exclusão de Paciente (Aprendente) */}
      <ConfirmModal
        isOpen={modalExcluirAprendente}
        onClose={() => setModalExcluirAprendente(false)}
        onConfirm={handleConfirmarExcluirAprendente}
        tipo="excluir"
        titulo="Excluir Prontuário do Paciente"
        itemIdentificador={aprendente?.nomeCompleto || ''}
        mensagemExtra="O paciente será movido para a lixeira. Todo o histórico, sessões e relatórios ficam preservados e podem ser recuperados na lixeira caso necessário."
      />

      {/* Modal de Exclusão de Relatório */}
      <ConfirmModal
        isOpen={modalExcluirRelatorio.aberto}
        onClose={() => setModalExcluirRelatorio({ aberto: false })}
        onConfirm={handleConfirmarExcluirRelatorio}
        tipo="excluir"
        titulo="Excluir Relatório Psicopedagógico"
        itemIdentificador={modalExcluirRelatorio.relatorio?.titulo || ''}
        mensagemExtra="O relatório será movido para a lixeira e poderá ser restaurado nas configurações."
      />

      {/* Modal de Exclusão de Formulário */}
      <ConfirmModal
        isOpen={modalExcluirFormulario.aberto}
        onClose={() => setModalExcluirFormulario({ aberto: false })}
        onConfirm={handleConfirmarExcluirFormulario}
        tipo="excluir"
        titulo={`Excluir ${modalExcluirFormulario.tipo === 'anamnese' ? 'Anamnese' : 'Avaliação'}`}
        itemIdentificador={`${modalExcluirFormulario.tipo === 'anamnese' ? 'Anamnese' : 'Avaliação'} de ${aprendente?.nomeCompleto || ''}`}
        mensagemExtra="Os dados deste formulário serão movidos para a lixeira."
      />
    </div>
  );
};
