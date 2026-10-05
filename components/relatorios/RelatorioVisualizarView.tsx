'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  Copy,
  Edit2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  ListOrdered,
  Save,
  Send,
  Clock,
  Sparkles,
  Check,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { RelatorioPsicopedagogico, Aprendente } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { PsicofichaLogo } from '@/components/ui/PsicofichaLogo';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface RelatorioVisualizarViewProps {
  relatorioId: string;
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const RelatorioVisualizarView: React.FC<RelatorioVisualizarViewProps> = ({
  relatorioId,
  onNavigate,
}) => {
  const [relatorio, setRelatorio] = useState<RelatorioPsicopedagogico | undefined>(undefined);
  const [aprendente, setAprendente] = useState<Aprendente | undefined>(undefined);

  const [mostrarSumario, setMostrarSumario] = useState(false);
  const [ocultarVazios, setOcultarVazios] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [abaVisualizacao, setAbaVisualizacao] = useState<'parecer' | 'sessao_livre' | 'editar'>('parecer');
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Free session notes state
  const [registroLivre, setRegistroLivre] = useState('');
  const [salvandoLivre, setSalvandoLivre] = useState(false);

  // Full Edit Form State
  const [formEdit, setFormEdit] = useState({
    titulo: '',
    codigoDocumento: '',
    status: 'rascunho' as 'rascunho' | 'em_revisao' | 'finalizado' | 'enviado',
    dataCriacao: '',
    dataFinalizacao: '',
    demandaMotivo: '',
    periodoContexto: '',
    procedimentosInstrumentos: '',
    antecedentesHistorico: '',
    observacoesProcesso: '',
    perfilAprendizagem: '',
    aspectosObservados: '',
    potencialidadesBarreiras: '',
    sinteseDescritiva: '',
    recomendacoesFamilia: '',
    recomendacoesEscola: '',
    planoAcompanhamento: '',
    limitacoesEticas: '',
    identificacaoProfissionalNome: '',
    identificacaoProfissionalRegistro: '',
    identificacaoProfissionalCidadeData: '',
    identificacaoProfissionalInstituicao: '',
  });

  useEffect(() => {
    const rel = storage.getRelatorioById(relatorioId);
    if (rel) {
      setRelatorio(rel);
      setRegistroLivre(rel.conteudo?.registroAtendimentoLivre || '');
      setFormEdit({
        titulo: rel.titulo || '',
        codigoDocumento: rel.codigoDocumento || '',
        status: (rel.status === 'arquivado' ? 'rascunho' : rel.status) as any,
        dataCriacao: rel.dataCriacao || '',
        dataFinalizacao: rel.dataFinalizacao || '',
        demandaMotivo: rel.conteudo?.demandaMotivo || '',
        periodoContexto: rel.conteudo?.periodoContexto || '',
        procedimentosInstrumentos: rel.conteudo?.procedimentosInstrumentos || '',
        antecedentesHistorico: rel.conteudo?.antecedentesHistorico || '',
        observacoesProcesso: rel.conteudo?.observacoesProcesso || '',
        perfilAprendizagem: rel.conteudo?.perfilAprendizagem || '',
        aspectosObservados: rel.conteudo?.aspectosObservados || '',
        potencialidadesBarreiras: rel.conteudo?.potencialidadesBarreiras || '',
        sinteseDescritiva: rel.conteudo?.sinteseDescritiva || '',
        recomendacoesFamilia: rel.conteudo?.recomendacoesFamilia || '',
        recomendacoesEscola: rel.conteudo?.recomendacoesEscola || '',
        planoAcompanhamento: rel.conteudo?.planoAcompanhamento || '',
        limitacoesEticas: rel.conteudo?.limitacoesEticas || '',
        identificacaoProfissionalNome: rel.conteudo?.identificacaoProfissional?.nome || '',
        identificacaoProfissionalRegistro: rel.conteudo?.identificacaoProfissional?.registroProfissional || '',
        identificacaoProfissionalCidadeData: rel.conteudo?.identificacaoProfissional?.cidadeData || '',
        identificacaoProfissionalInstituicao: rel.conteudo?.identificacaoProfissional?.instituicaoConsultorio || '',
      });
      const apr = storage.getAprendenteById(rel.aprendenteId);
      setAprendente(apr);
    }
  }, [relatorioId]);

  if (!relatorio || !aprendente) {
    return (
      <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-12 text-center">
        <FileText className="w-12 h-12 text-[#52676B]/40 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#183238] dark:text-white">Relatório não localizado</h2>
        <p className="text-xs text-[#52676B] dark:text-slate-400 mt-1 mb-4">
          O documento solicitado não foi encontrado no armazenamento local.
        </p>
        <button
          onClick={() => onNavigate('relatorios')}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl transition-colors"
        >
          Voltar para Biblioteca
        </button>
      </div>
    );
  }

  const handleAlterarStatus = (novoStatus: 'rascunho' | 'em_revisao' | 'finalizado' | 'enviado') => {
    const dataFinal =
      novoStatus === 'finalizado' || novoStatus === 'enviado'
        ? relatorio.dataFinalizacao || new Date().toISOString().split('T')[0]
        : undefined;

    const atualizado: RelatorioPsicopedagogico = {
      ...relatorio,
      status: novoStatus,
      dataFinalizacao: dataFinal,
    };

    storage.saveRelatorio(atualizado);
    setRelatorio(atualizado);
    setFormEdit((prev) => ({
      ...prev,
      status: novoStatus,
      dataFinalizacao: dataFinal || '',
    }));

    const labels = {
      rascunho: 'Rascunho',
      em_revisao: 'Em Revisão',
      finalizado: 'Pronto / Finalizado',
      enviado: 'Enviado',
    };
    showToast(`Status do relatório alterado para: ${labels[novoStatus]}!`, 'sucesso');
  };

  const handleSalvarEdicaoCompleta = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!relatorio) return;

    const dataFinal =
      formEdit.status === 'finalizado' || formEdit.status === 'enviado'
        ? formEdit.dataFinalizacao || new Date().toISOString().split('T')[0]
        : undefined;

    const atualizado: RelatorioPsicopedagogico = {
      ...relatorio,
      titulo: formEdit.titulo.trim() || relatorio.titulo,
      codigoDocumento: formEdit.codigoDocumento.trim() || relatorio.codigoDocumento,
      status: formEdit.status,
      dataCriacao: formEdit.dataCriacao || relatorio.dataCriacao,
      dataFinalizacao: dataFinal,
      conteudo: {
        ...relatorio.conteudo,
        demandaMotivo: formEdit.demandaMotivo,
        periodoContexto: formEdit.periodoContexto,
        procedimentosInstrumentos: formEdit.procedimentosInstrumentos,
        antecedentesHistorico: formEdit.antecedentesHistorico,
        observacoesProcesso: formEdit.observacoesProcesso,
        perfilAprendizagem: formEdit.perfilAprendizagem,
        aspectosObservados: formEdit.aspectosObservados,
        potencialidadesBarreiras: formEdit.potencialidadesBarreiras,
        sinteseDescritiva: formEdit.sinteseDescritiva,
        recomendacoesFamilia: formEdit.recomendacoesFamilia,
        recomendacoesEscola: formEdit.recomendacoesEscola,
        planoAcompanhamento: formEdit.planoAcompanhamento,
        limitacoesEticas: formEdit.limitacoesEticas,
        registroAtendimentoLivre: registroLivre,
        identificacaoProfissional: {
          nome: formEdit.identificacaoProfissionalNome,
          registroProfissional: formEdit.identificacaoProfissionalRegistro,
          instituicaoConsultorio: formEdit.identificacaoProfissionalInstituicao,
          cidadeData: formEdit.identificacaoProfissionalCidadeData,
        },
      },
    };

    storage.saveRelatorio(atualizado);
    setRelatorio(atualizado);
    showToast('Relatório atualizado e salvo com sucesso!', 'sucesso');
    setAbaVisualizacao('parecer');
  };

  const handleSalvarRegistroLivre = () => {
    setSalvandoLivre(true);
    const atualizado: RelatorioPsicopedagogico = {
      ...relatorio,
      conteudo: {
        ...relatorio.conteudo,
        registroAtendimentoLivre: registroLivre,
      },
    };
    storage.saveRelatorio(atualizado);
    setRelatorio(atualizado);
    setTimeout(() => {
      setSalvandoLivre(false);
      showToast('Registro da sessão salvo com sucesso no relatório!', 'sucesso');
    }, 300);
  };

  const handleImprimirOuExportarPDF = () => {
    setExportando(true);
    showToast('Preparando documento A4 para impressão/PDF...', 'info');
    setTimeout(() => {
      setExportando(false);
      window.print();
    }, 400);
  };

  const handleDuplicar = () => {
    const clonado: RelatorioPsicopedagogico = {
      ...relatorio,
      id: `rel-${Date.now()}`,
      codigoDocumento: `REL-2026-${Math.floor(100 + Math.random() * 900)}`,
      titulo: `${relatorio.titulo} (Cópia)`,
      status: 'rascunho',
      dataCriacao: new Date().toISOString().split('T')[0],
      dataFinalizacao: undefined,
    };
    storage.saveRelatorio(clonado);
    showToast(`Relatório duplicado como "${clonado.titulo}"!`, 'sucesso');
    onNavigate('relatorio-visualizar', { id: clonado.id });
  };

  const handleConfirmarExcluir = () => {
    if (!relatorio) return;
    storage.deleteRelatorio(relatorio.id);
    showToast(`Relatório "${relatorio.titulo}" transferido para a lixeira.`, 'info');
    onNavigate('relatorios');
  };

  const resp = aprendente.paisResponsaveis.find((r) => r.responsavelLegal) || aprendente.paisResponsaveis[0];
  const secoes = relatorio.secoesAtivas;
  const conteudo = relatorio.conteudo;

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar (Hidden in Print) */}
      <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-4 flex flex-col gap-4 no-print shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => onNavigate('relatorios')}
              className="p-2 text-[#52676B] dark:text-slate-300 hover:text-[#183238] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1e2d3b] rounded-xl transition-colors shrink-0"
              title="Voltar à Biblioteca"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#183238] dark:text-white truncate">
                {relatorio.titulo}
              </h1>
              <p className="text-[11px] text-[#52676B] dark:text-slate-400 font-mono truncate">
                {relatorio.codigoDocumento} · {aprendente.nomeCompleto}
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit + Duplicate + PDF + Excluir */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setAbaVisualizacao(abaVisualizacao === 'editar' ? 'parecer' : 'editar')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[36px] ${
                abaVisualizacao === 'editar'
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                  : 'text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] dark:hover:bg-[#38edff]'
              }`}
              title="Editar todos os campos e seções do relatório"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{abaVisualizacao === 'editar' ? 'Ver Parecer A4' : 'Editar Relatório'}</span>
            </button>

            <button
              onClick={() => onNavigate('relatorio-novo', { id: relatorio.id, aprendenteId: relatorio.aprendenteId })}
              className="px-3 py-1.5 text-xs font-semibold text-[#52676B] dark:text-slate-300 hover:text-[#183238] dark:hover:text-white bg-[#F7FAFA] dark:bg-[#182633] hover:bg-neutral-100 dark:hover:bg-[#1f3040] border border-[#EEF5F4] dark:border-[#223544] rounded-xl transition-colors flex items-center gap-1.5 min-h-[36px]"
              title="Abrir no assistente guiado por etapas"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#008B94] dark:text-[#00E5FF]" />
              <span className="hidden sm:inline">Assistente Guiado</span>
            </button>

            <button
              onClick={handleDuplicar}
              className="px-3 py-1.5 text-xs font-semibold text-[#52676B] dark:text-slate-300 hover:text-[#183238] dark:hover:text-white bg-[#F7FAFA] dark:bg-[#182633] hover:bg-neutral-100 dark:hover:bg-[#1f3040] border border-[#EEF5F4] dark:border-[#223544] rounded-xl transition-colors flex items-center gap-1.5 min-h-[36px]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicar</span>
            </button>

            <button
              onClick={handleImprimirOuExportarPDF}
              disabled={exportando}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#183238] dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#1e2d3b] dark:hover:bg-[#283b4c] border border-slate-200 dark:border-[#283b4c] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[36px]"
            >
              <Printer className="w-4 h-4" />
              <span>{exportando ? 'Processando...' : 'Exportar PDF'}</span>
            </button>

            <button
              onClick={() => setModalExcluirAberto(true)}
              title="Excluir este relatório e transferir para a lixeira"
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors flex items-center gap-1.5 min-h-[36px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          </div>
        </div>

        {/* Status Selector Bar (Directly editable by user) */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#1e2d3b] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200 shrink-0">
              Status do Relatório:
            </span>

            {/* Desktop / Tablet Buttons */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5">
              {[
                { key: 'rascunho', label: 'Rascunho', icon: '📝', bgActive: 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-600' },
                { key: 'em_revisao', label: 'Em Revisão', icon: '🔍', bgActive: 'bg-purple-100 text-purple-900 border-purple-400 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-600' },
                { key: 'finalizado', label: 'Pronto / Finalizado', icon: '✅', bgActive: 'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600' },
                { key: 'enviado', label: 'Enviado', icon: '📤', bgActive: 'bg-cyan-100 text-cyan-900 border-cyan-400 dark:bg-[#0c2e35] dark:text-cyan-200 dark:border-[#00E5FF]' },
              ].map((st) => {
                const isSelected = relatorio.status === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleAlterarStatus(st.key as any)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? `${st.bgActive} shadow-xs ring-1 ring-current font-bold scale-[1.02]`
                        : 'border-slate-200 dark:border-[#1e2d3b] bg-white dark:bg-[#0e1720] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#182633]'
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Mobile Dropdown for Clean Responsive View */}
            <div className="sm:hidden relative w-full">
              <select
                value={relatorio.status}
                onChange={(e) => handleAlterarStatus(e.target.value as any)}
                className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-white dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              >
                <option value="rascunho">📝 Rascunho</option>
                <option value="em_revisao">🔍 Em Revisão</option>
                <option value="finalizado">✅ Pronto / Finalizado</option>
                <option value="enviado">📤 Enviado</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle: Parecer vs Diário Livre vs Editar Relatório */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0e1720] p-1 rounded-xl border border-slate-200 dark:border-[#1e2d3b] shrink-0 overflow-x-auto max-w-full">
            <button
              onClick={() => setAbaVisualizacao('parecer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                abaVisualizacao === 'parecer'
                  ? 'bg-white dark:bg-[#182633] text-[#007a82] dark:text-[#00E5FF] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Parecer A4</span>
            </button>
            <button
              onClick={() => setAbaVisualizacao('sessao_livre')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                abaVisualizacao === 'sessao_livre'
                  ? 'bg-white dark:bg-[#182633] text-[#007a82] dark:text-[#00E5FF] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>✍️</span>
              <span>Sessão de Hoje</span>
            </button>
            <button
              onClick={() => setAbaVisualizacao('editar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
                abaVisualizacao === 'editar'
                  ? 'bg-white dark:bg-[#182633] text-[#007a82] dark:text-[#00E5FF] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Relatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABA: Diário Livre da Sessão / Como foi o Atendimento */}
      {abaVisualizacao === 'sessao_livre' && (
        <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-slate-200 dark:border-[#1e2d3b] p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-[#1e2d3b] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✍️ Como Foi o Atendimento / O que Aconteceu na Sessão de Hoje</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Espaço livre e desimpedido para descrever com suas próprias palavras o que aconteceu na sessão, sem opções ou formulários pré-fixados.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSalvarRegistroLivre}
                disabled={salvandoLivre}
                className="px-4 py-2 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{salvandoLivre ? 'Salvando...' : 'Salvar Registro da Sessão'}</span>
              </button>
            </div>
          </div>

          <div>
            <textarea
              rows={14}
              value={registroLivre}
              onChange={(e) => setRegistroLivre(e.target.value)}
              placeholder="Escreva aqui livremente como foi o atendimento da sessão de hoje:
- O que aconteceu no início e no acolhimento do aprendente;
- Quais atividades e materiais foram apresentados;
- Como o aprendente reagiu, demonstrou interesse ou resistência;
- Dificuldades observadas e intervenções/estratégias que funcionaram;
- Avanços perceptíveis na sessão de hoje;
- Combinações feitas para o próximo encontro ou orientações aos responsáveis..."
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50/60 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] leading-relaxed transition-colors font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {registroLivre ? `${registroLivre.length} caracteres digitados` : 'Espaço limpo para escrita livre.'} · Fica integrado ao relatório e salvo no armazenamento.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(registroLivre);
                  showToast('Texto copiado para a área de transferência!', 'sucesso');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e2d3b] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182633] transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaVisualizacao('parecer')}
                className="px-3.5 py-1.5 rounded-lg bg-[#008B94] text-white text-xs font-semibold hover:bg-[#007a82] transition-colors"
              >
                Visualizar no Parecer A4
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA: Editar Relatório Completo (Formulário Direto) */}
      {abaVisualizacao === 'editar' && (
        <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-slate-200 dark:border-[#1e2d3b] p-5 sm:p-7 space-y-6 shadow-sm animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-[#1e2d3b] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#008B94] dark:text-[#00E5FF]" />
                <span>Editar Dados do Relatório</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Altere diretamente o título, o status (Rascunho, Pronto, Enviado), datas, parecer descritivo e orientações.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalExcluirAberto(true)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaVisualizacao('parecer')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#182633] hover:bg-slate-200 dark:hover:bg-[#203444] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSalvarEdicaoCompleta()}
                className="px-4 py-2 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSalvarEdicaoCompleta} className="space-y-5">
            {/* Título, Código e Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Relatório *
                </label>
                <input
                  type="text"
                  required
                  value={formEdit.titulo}
                  onChange={(e) => setFormEdit({ ...formEdit, titulo: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status de Publicação *
                </label>
                <select
                  value={formEdit.status}
                  onChange={(e) => setFormEdit({ ...formEdit, status: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                >
                  <option value="rascunho">📝 Rascunho</option>
                  <option value="em_revisao">🔍 Em Revisão</option>
                  <option value="finalizado">✅ Pronto / Finalizado</option>
                  <option value="enviado">📤 Enviado</option>
                </select>
              </div>
            </div>

            {/* Código do Documento e Datas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Código do Documento
                </label>
                <input
                  type="text"
                  value={formEdit.codigoDocumento}
                  onChange={(e) => setFormEdit({ ...formEdit, codigoDocumento: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data de Criação
                </label>
                <input
                  type="date"
                  value={formEdit.dataCriacao}
                  onChange={(e) => setFormEdit({ ...formEdit, dataCriacao: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data de Finalização / Emissão
                </label>
                <input
                  type="date"
                  value={formEdit.dataFinalizacao || ''}
                  onChange={(e) => setFormEdit({ ...formEdit, dataFinalizacao: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>
            </div>

            {/* Demanda e Período */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Demanda e Motivo do Encaminhamento
                </label>
                <textarea
                  rows={3}
                  value={formEdit.demandaMotivo}
                  onChange={(e) => setFormEdit({ ...formEdit, demandaMotivo: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Período, Contexto e Fontes de Informação
                </label>
                <textarea
                  rows={3}
                  value={formEdit.periodoContexto}
                  onChange={(e) => setFormEdit({ ...formEdit, periodoContexto: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>
            </div>

            {/* Procedimentos e Observações do Processo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Procedimentos e Instrumentos Utilizados
                </label>
                <textarea
                  rows={3}
                  value={formEdit.procedimentosInstrumentos}
                  onChange={(e) => setFormEdit({ ...formEdit, procedimentosInstrumentos: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações Durante o Processo
                </label>
                <textarea
                  rows={3}
                  value={formEdit.observacoesProcesso}
                  onChange={(e) => setFormEdit({ ...formEdit, observacoesProcesso: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>
            </div>

            {/* Síntese Descritiva e Conclusões */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Síntese Descritiva e Compreensiva (Conclusão do Parecer)
              </label>
              <textarea
                rows={4}
                value={formEdit.sinteseDescritiva}
                onChange={(e) => setFormEdit({ ...formEdit, sinteseDescritiva: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>

            {/* Recomendações Família e Escola */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#008B94] dark:text-[#00E5FF] mb-1">
                  Recomendações para a Família
                </label>
                <textarea
                  rows={3}
                  value={formEdit.recomendacoesFamilia}
                  onChange={(e) => setFormEdit({ ...formEdit, recomendacoesFamilia: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B7BB5] dark:text-[#c4b5fd] mb-1">
                  Recomendações para a Escola
                </label>
                <textarea
                  rows={3}
                  value={formEdit.recomendacoesEscola}
                  onChange={(e) => setFormEdit({ ...formEdit, recomendacoesEscola: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                />
              </div>
            </div>

            {/* Plano de Acompanhamento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plano de Acompanhamento e Metas
              </label>
              <textarea
                rows={2}
                value={formEdit.planoAcompanhamento}
                onChange={(e) => setFormEdit({ ...formEdit, planoAcompanhamento: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>

            {/* Identificação Profissional */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1e2d3b]">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                Identificação Profissional (Assinatura do Laudo)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Nome do Profissional
                  </label>
                  <input
                    type="text"
                    value={formEdit.identificacaoProfissionalNome}
                    onChange={(e) => setFormEdit({ ...formEdit, identificacaoProfissionalNome: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Registro Profissional (ABPp / CRP / CFEP)
                  </label>
                  <input
                    type="text"
                    value={formEdit.identificacaoProfissionalRegistro}
                    onChange={(e) => setFormEdit({ ...formEdit, identificacaoProfissionalRegistro: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>

            {/* Botões do Rodapé de Edição */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1e2d3b]">
              <button
                type="button"
                onClick={() => setAbaVisualizacao('parecer')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#182633] hover:bg-slate-200 dark:hover:bg-[#203444] rounded-xl transition-colors"
              >
                Descartar e Voltar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Todas as Alterações</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ABA: Documento Parecer A4 Completo */}
      {abaVisualizacao === 'parecer' && (
        <div className="flex justify-center p-1 sm:p-6 bg-[#EEF5F4]/60 dark:bg-[#0b1015] rounded-3xl no-print-bg">
          <article
            id="relatorio-a4-sheet"
            className="a4-sheet w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl rounded-sm p-4 sm:p-8 md:p-14 text-[#183238] text-[13px] leading-relaxed border border-neutral-200 print:shadow-none print:border-none print:p-0"
          >
            {/* Document Header (Consistent across A4) */}
            <header className="border-b-2 border-[#008B94] pb-4 mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <PsicofichaLogo variant="icon" size="md" className="shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#008B94]">
                      Psicoficha — Fichas &amp; Relatórios Clínico-Institucionais
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#183238] leading-tight">
                    {relatorio.titulo}
                  </h1>
                  <p className="text-xs text-[#52676B] mt-0.5">
                    Parecer Técnico Descritivo do Processo de Aprendizagem
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-[11px] text-[#52676B] font-mono shrink-0">
                <p className="font-bold text-[#183238]">{relatorio.codigoDocumento}</p>
                <p>Emissão: {relatorio.dataFinalizacao || relatorio.dataCriacao}</p>
                <div className="mt-1 no-print">
                  <select
                    value={relatorio.status}
                    onChange={(e) => handleAlterarStatus(e.target.value as any)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer uppercase tracking-wider transition-colors ${
                      relatorio.status === 'finalizado'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : relatorio.status === 'enviado'
                        ? 'bg-cyan-100 text-cyan-800 border-cyan-400'
                        : relatorio.status === 'em_revisao'
                        ? 'bg-purple-100 text-purple-800 border-purple-400'
                        : 'bg-amber-100 text-amber-800 border-amber-400'
                    }`}
                    title="Clique para alterar o status do documento"
                  >
                    <option value="rascunho">📝 Rascunho</option>
                    <option value="em_revisao">🔍 Em Revisão</option>
                    <option value="finalizado">✅ Pronto / Finalizado</option>
                    <option value="enviado">📤 Enviado</option>
                  </select>
                </div>
                <div className="mt-1 hidden print:block">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider ${
                      relatorio.status === 'finalizado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : relatorio.status === 'enviado'
                        ? 'bg-cyan-100 text-cyan-800'
                        : relatorio.status === 'em_revisao'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {relatorio.status === 'finalizado'
                      ? 'Pronto / Finalizado'
                      : relatorio.status === 'enviado'
                      ? 'Enviado'
                      : relatorio.status === 'em_revisao'
                      ? 'Em Revisão'
                      : 'Rascunho'}
                  </span>
                </div>
              </div>
            </header>

            {/* Sumário Opcional */}
            {mostrarSumario && (
              <div className="mb-6 p-4 bg-[#F7FAFA] border border-[#EEF5F4] rounded-lg text-xs space-y-1 print-avoid-break">
                <span className="font-bold text-[#183238] uppercase tracking-wider text-[11px] block mb-2">
                  Sumário do Documento
                </span>
                <p className="text-[#52676B]">1. Identificação do Aprendente e Núcleo Familiar</p>
                <p className="text-[#52676B]">2. Demanda e Contexto da Avaliação</p>
                <p className="text-[#52676B]">3. Procedimentos e Instrumentos Utilizados</p>
                <p className="text-[#52676B]">4. Perfil de Aprendizagem e Aspectos Observados</p>
                <p className="text-[#52676B]">5. Síntese Descritiva e Compreensiva</p>
                <p className="text-[#52676B]">6. Orientações Práticas para Família e Escola</p>
                <p className="text-[#52676B]">7. Plano de Acompanhamento e Limitações Éticas</p>
              </div>
            )}

            {/* Seção em Destaque: Registro Livre do Atendimento (quando preenchido) */}
            {conteudo.registroAtendimentoLivre && (
              <section className="mb-6 print-avoid-break bg-[#f0f9fa] border border-[#008B94]/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 border-b border-[#008B94]/20 pb-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#007a82] flex items-center gap-1.5">
                    <span>✍️ Registro Clínico do Atendimento / O que Aconteceu na Sessão</span>
                  </h2>
                  <button
                    onClick={() => setAbaVisualizacao('sessao_livre')}
                    className="no-print text-[11px] font-semibold text-[#008B94] hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar Registro</span>
                  </button>
                </div>
                <div className="text-xs text-[#183238] whitespace-pre-wrap leading-relaxed">
                  {conteudo.registroAtendimentoLivre}
                </div>
              </section>
            )}

            {/* 1. Identificação do Aprendente e Responsáveis */}
            {(secoes.identificacaoAprendente || secoes.identificacaoResponsaveis) && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  1. Identificação do Aprendente e Responsáveis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs bg-[#F7FAFA] p-3 sm:p-4 rounded-lg border border-[#EEF5F4]">
                  <div>
                    <span className="text-[#52676B] block text-[11px]">Nome do Aprendente:</span>
                    <strong className="text-[#183238]">{aprendente.nomeCompleto}</strong>
                  </div>
                  <div>
                    <span className="text-[#52676B] block text-[11px]">Data de Nasc. / Idade:</span>
                    <span className="text-[#183238]">
                      {aprendente.dataNascimento} ({aprendente.idadeCalculada} anos)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#52676B] block text-[11px]">Instituição de Ensino / Etapa:</span>
                    <span className="text-[#183238]">
                      {aprendente.contextoEscolar.instituicao} — {aprendente.contextoEscolar.etapaAno}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#52676B] block text-[11px]">Responsável Principal:</span>
                    <span className="text-[#183238]">
                      {resp ? `${resp.nomeCompleto} (${resp.parentesco})` : 'Não informado'}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* 2. Demanda e Motivo */}
            {secoes.demandaMotivo && conteudo.demandaMotivo && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  2. Demanda e Motivo do Encaminhamento
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.demandaMotivo}
                </p>
              </section>
            )}

            {/* 3. Período e Fontes */}
            {secoes.periodoContexto && conteudo.periodoContexto && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  3. Período, Contexto e Fontes de Informação
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.periodoContexto}
                </p>
              </section>
            )}

            {/* 4. Procedimentos e Instrumentos */}
            {secoes.procedimentosInstrumentos && conteudo.procedimentosInstrumentos && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  4. Procedimentos e Instrumentos Utilizados
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.procedimentosInstrumentos}
                </p>
              </section>
            )}

            {/* 5. Antecedentes e História Relevante */}
            {secoes.antecedentesHistorico && conteudo.antecedentesHistorico && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  5. Antecedentes e História Relevante
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.antecedentesHistorico}
                </p>
              </section>
            )}

            {/* 6. Observações Durante o Processo */}
            {secoes.observacoesProcesso && conteudo.observacoesProcesso && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  6. Observações Durante o Processo de Intervenção
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.observacoesProcesso}
                </p>
              </section>
            )}

            {/* 7. Perfil de Aprendizagem */}
            {secoes.perfilAprendizagem && conteudo.perfilAprendizagem && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  7. Perfil de Aprendizagem e Aspectos Pedagógicos
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.perfilAprendizagem}
                </p>
              </section>
            )}

            {/* 8. Aspectos Observados */}
            {secoes.aspectosObservados && conteudo.aspectosObservados && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  8. Aspectos Cognitivos, Linguísticos e Motores
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.aspectosObservados}
                </p>
              </section>
            )}

            {/* 9. Potencialidades e Barreiras */}
            {secoes.potencialidadesBarreiras && conteudo.potencialidadesBarreiras && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  9. Potencialidades e Barreiras Observadas
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.potencialidadesBarreiras}
                </p>
              </section>
            )}

            {/* 10. Síntese Descritiva e Compreensiva */}
            {secoes.sinteseDescritiva && conteudo.sinteseDescritiva && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  10. Síntese Descritiva e Compreensiva
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed bg-[#F7FAFA] p-3 rounded-lg border-l-4 border-[#176B73]">
                  {conteudo.sinteseDescritiva}
                </p>
              </section>
            )}

            {/* 11. Recomendações Práticas (Família e Escola) */}
            {secoes.recomendacoesPraticas && (
              <section className="mb-6 print-avoid-break space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  11. Recomendações e Orientações Práticas
                </h2>

                {conteudo.recomendacoesFamilia && (
                  <div className="text-xs">
                    <strong className="text-[#176B73] block mb-1">Para a Família / Responsáveis:</strong>
                    <p className="text-justify text-[#183238] leading-relaxed">
                      {conteudo.recomendacoesFamilia}
                    </p>
                  </div>
                )}

                {conteudo.recomendacoesEscola && (
                  <div className="text-xs pt-2">
                    <strong className="text-[#8B7BB5] block mb-1">Para a Instituição Escolar e Professores:</strong>
                    <p className="text-justify text-[#183238] leading-relaxed">
                      {conteudo.recomendacoesEscola}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* 12. Plano de Acompanhamento */}
            {secoes.planoAcompanhamento && conteudo.planoAcompanhamento && (
              <section className="mb-6 print-avoid-break">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#176B73] border-b border-[#EEF5F4] pb-1 mb-2">
                  12. Plano de Acompanhamento e Metas
                </h2>
                <p className="text-justify text-[#183238] leading-relaxed">
                  {conteudo.planoAcompanhamento}
                </p>
              </section>
            )}

            {/* 13. Limitações Éticas */}
            {secoes.limitacoesEticas && conteudo.limitacoesEticas && (
              <section className="mb-8 print-avoid-break text-[11px] text-[#52676B] italic border-t border-[#EEF5F4] pt-3">
                <p>{conteudo.limitacoesEticas}</p>
              </section>
            )}

            {/* 14. Identificação Profissional e Assinatura */}
            {secoes.identificacaoProfissional && (
              <footer className="pt-6 border-t-2 border-[#183238] print-avoid-break mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
                  <div>
                    <p className="text-[#52676B]">{conteudo.identificacaoProfissional.cidadeData}</p>
                    <p className="text-[11px] text-[#8a9d9f] mt-0.5">
                      {conteudo.identificacaoProfissional.instituicaoConsultorio}
                    </p>
                  </div>

                  <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-300">
                    <div className="w-48 border-b border-[#183238] mb-1 mx-auto sm:ml-auto" />
                    <p className="font-bold text-[#183238]">{conteudo.identificacaoProfissional.nome}</p>
                    <p className="text-[11px] text-[#52676B]">
                      {conteudo.identificacaoProfissional.registroProfissional}
                    </p>
                  </div>
                </div>

                {/* Watermark / Legal disclaimer footer */}
                <div className="mt-8 pt-2 border-t border-[#EEF5F4] text-[9px] text-[#52676B]/70 text-center uppercase tracking-wider">
                  Documento técnico emitido pela plataforma Psicoficha · Em conformidade com os princípios éticos da psicopedagogia e diretrizes da ABPp
                </div>
              </footer>
            )}
          </article>
        </div>
      )}
      {/* Modal de Exclusão de Relatório */}
      <ConfirmModal
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        onConfirm={handleConfirmarExcluir}
        tipo="excluir"
        titulo="Excluir Relatório Psicopedagógico"
        itemIdentificador={relatorio?.titulo || ''}
        mensagemExtra="O documento será movido para a lixeira e poderá ser restaurado nas configurações se necessário."
      />
    </div>
  );
};
