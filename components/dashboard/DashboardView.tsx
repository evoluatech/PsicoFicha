'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  Plus,
  RotateCcw,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Aprendente, Sessao, RelatorioPsicopedagogico, LembreteConsulta } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { PsicofichaLogo } from '@/components/ui/PsicofichaLogo';

interface DashboardViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioPsicopedagogico[]>([]);
  const [lembretes, setLembretes] = useState<LembreteConsulta[]>([]);
  const [profNome, setProfNome] = useState('Dra. Gabriela Andrade');
  const [simularVazio, setSimularVazio] = useState(false);
  const [saudacao, setSaudacao] = useState('Olá');
  const [dataFormatada, setDataFormatada] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const carregar = () => {
      setAprendentes(storage.getAprendentes());
      setSessoes(storage.getSessoes());
      setRelatorios(storage.getRelatorios());
      setLembretes(storage.getLembretes());
      const p = storage.getProfissional();
      if (p && p.nome) setProfNome(p.nome);
    };

    carregar();

    const hoje = new Date();
    const hora = hoje.getHours();
    let s = 'Bom dia';
    if (hora >= 12 && hora < 18) s = 'Boa tarde';
    if (hora >= 18) s = 'Boa noite';
    setSaudacao(s);

    setDataFormatada(
      hoje.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );

    window.addEventListener('praxis_storage_updated', carregar);
    return () => window.removeEventListener('praxis_storage_updated', carregar);
  }, []);

  const ativos = simularVazio ? [] : aprendentes.filter((a) => a.status === 'acompanhamento' || a.status === 'avaliacao');
  const relatoriosFinalizados = simularVazio ? [] : relatorios.filter((r) => r.status === 'finalizado');
  const relatoriosRascunho = simularVazio ? [] : relatorios.filter((r) => r.status === 'rascunho' || r.status === 'em_revisao');
  const proximosLembretes = simularVazio ? [] : lembretes.filter((l) => l.status === 'agendado');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Psicoficha Welcome & Clinical Context Card */}
      <div className="bg-gradient-to-r from-[#0b1015] via-[#101920] to-[#14232c] border border-[#1e2d3b] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 sm:gap-4 z-10 min-w-0">
          <PsicofichaLogo variant="icon" size="lg" className="shrink-0 drop-shadow-md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-[#00E5FF] uppercase tracking-wider mb-0.5 truncate">
              <span suppressHydrationWarning>{isMounted ? dataFormatada : ''}</span>
              {isMounted && dataFormatada && <span>·</span>}
              <span className="truncate">Psicoficha Clínico</span>
            </div>
            <h1
              suppressHydrationWarning
              className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate"
            >
              {isMounted ? saudacao : 'Olá'}, {profNome.split(' ')[0]} {profNome.split(' ').slice(1).join(' ')}
            </h1>
            <p className="text-xs text-[#8da4ac] mt-0.5 max-w-xl truncate sm:whitespace-normal">
              Gestão clínica e institucional de fichas, sessões, anamnese e relatórios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('aprendente-novo')}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2 text-xs font-bold text-[#0b1015] bg-[#00E5FF] hover:bg-[#38edff] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ficha</span>
          </button>
          <button
            onClick={() => setSimularVazio(!simularVazio)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-[#223544] bg-[#121c25]/80 text-[#8da4ac] hover:text-white transition-colors min-h-[38px]"
          >
            {simularVazio ? 'Restaurar' : 'Simular Vazio'}
          </button>
        </div>
      </div>

      {/* Metric Cards (Zero-Pill Discipline, Subtle 1px borders) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div
          onClick={() => onNavigate('aprendentes')}
          className="bg-white dark:bg-[#121c25] p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1e2d3b] shadow-xs hover:border-[#238B8D]/40 dark:hover:border-[#00E5FF]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-[#8da4ac] truncate">Aprendentes</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-50 dark:bg-[#182633] flex items-center justify-center text-[#007a82] dark:text-[#00E5FF] group-hover:bg-[#008B94] group-hover:text-white transition-colors shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {ativos.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] mt-1 truncate">
            {aprendentes.filter((a) => a.status === 'avaliacao').length} em avaliação
          </p>
        </div>

        <div
          onClick={() => onNavigate('relatorios')}
          className="bg-white dark:bg-[#121c25] p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1e2d3b] shadow-xs hover:border-[#8B7BB5]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-[#8da4ac] truncate">Relatórios</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 dark:bg-[#201a2e] flex items-center justify-center text-purple-600 dark:text-[#c4b5fd] group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {relatoriosRascunho.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] mt-1 truncate">
            {relatoriosFinalizados.length} finalizados
          </p>
        </div>

        <div
          onClick={() => onNavigate('lembretes')}
          className="bg-white dark:bg-[#121c25] p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1e2d3b] shadow-xs hover:border-[#6FA58B]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-[#8da4ac] truncate">Consultas</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 dark:bg-[#13271f] flex items-center justify-center text-emerald-600 dark:text-[#86efac] group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {proximosLembretes.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] mt-1 truncate">Alarmes programados</p>
        </div>

        <div
          onClick={() => onNavigate('sessoes', { id: 'apr-2' })}
          className="bg-white dark:bg-[#121c25] p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1e2d3b] shadow-xs hover:border-[#238B8D]/40 dark:hover:border-[#00E5FF]/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-[#8da4ac] truncate">Sessões</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-50 dark:bg-[#182633] flex items-center justify-center text-[#007a82] dark:text-[#00E5FF] group-hover:bg-[#008B94] group-hover:text-white transition-colors shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {simularVazio ? 0 : sessoes.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] mt-1 truncate">Histórico clínico</p>
        </div>
      </div>

      {/* Incomplete Forms Alert */}
      {!simularVazio && (
        <div className="bg-amber-50 dark:bg-[#1a1612] border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-3.5 transition-colors">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs min-w-0">
            <h2 className="font-bold text-amber-950 dark:text-amber-300 text-sm">
              Anamnese com preenchimento pendente
            </h2>
            <p className="text-amber-900/90 dark:text-slate-300 mt-1 leading-relaxed">
              O registro de <strong className="font-bold text-amber-950 dark:text-white">Helena Duarte Ribeiro</strong> possui seções da anamnese em rascunho. Recomendamos concluir as observações de prontidão antes da próxima sessão.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => onNavigate('anamnese', { id: 'apr-1' })}
                className="text-xs font-bold text-[#007a82] hover:text-[#008B94] dark:text-[#00E5FF] dark:hover:text-[#38edff] hover:underline flex items-center gap-1.5 transition-colors"
              >
                <span>Continuar preenchimento</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: "Continuar de onde parou" + Próximas Sessões */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column (2 cols): Continuar de onde parou + Gráfico de Atividade Recente */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Continuar de onde parou */}
          <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-slate-200 dark:border-[#1e2d3b] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Continuar de onde parou</h2>
                <p className="text-xs text-slate-500 dark:text-[#8da4ac]">Documentos e atendimentos recentes</p>
              </div>
              <button
                onClick={() => onNavigate('aprendentes')}
                className="text-xs font-semibold text-[#007a82] dark:text-[#00E5FF] hover:underline"
              >
                Ver todos
              </button>
            </div>

            {simularVazio || aprendentes.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 dark:bg-[#0e1720] rounded-xl border border-dashed border-slate-200 dark:border-[#1e2d3b]">
                <FolderOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nenhum registro ativo no momento</h3>
                <p className="text-xs text-slate-500 dark:text-[#8da4ac] max-w-sm mx-auto mt-1 mb-4">
                  Cadastre seu primeiro aprendente para registrar anamneses, sessões e relatórios psicopedagógicos.
                </p>
                <button
                  onClick={() => onNavigate('aprendente-novo')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] rounded-xl transition-colors"
                >
                  Cadastrar Primeiro Aprendente
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {aprendentes.slice(0, 3).map((apr) => (
                  <div
                    key={apr.id}
                    className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] hover:bg-slate-50 dark:hover:bg-[#182633] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 dark:bg-[#182633] text-[#007a82] dark:text-[#00E5FF] font-bold text-xs flex items-center justify-center shrink-0">
                        {apr.nomeCompleto.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {apr.nomeCompleto}
                          </h3>
                          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] font-mono shrink-0">
                            {apr.codigoInterno}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] mt-0.5 truncate">
                          <span>{apr.idadeCalculada} anos</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{apr.contextoEscolar.etapaAno}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigate('aprendente-detalhe', { id: apr.id })}
                        className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#007a82] dark:text-[#00E5FF] bg-teal-50 dark:bg-[#00E5FF]/10 hover:bg-teal-100 dark:hover:bg-[#00E5FF]/20 rounded-lg transition-colors"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gráfico de Atividade Recente (SVG Acessível) */}
          <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-slate-200 dark:border-[#1e2d3b] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Atividade das Últimas Semanas</h2>
                <p className="text-xs text-slate-500 dark:text-[#8da4ac]">Distribuição de sessões e relatórios</p>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] font-mono">1º Trimestre / 2026</span>
            </div>

            {/* Accessible Responsive Bar Chart */}
            <div className="w-full h-40 sm:h-44 flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 px-1 sm:px-2 border-b border-slate-200 dark:border-[#1e2d3b] overflow-x-auto">
              {[
                { label: 'Sem 01', sessoes: 4, relatorios: 1 },
                { label: 'Sem 02', sessoes: 6, relatorios: 2 },
                { label: 'Sem 03', sessoes: 5, relatorios: 1 },
                { label: 'Sem 04', sessoes: 7, relatorios: 3 },
                { label: 'Sem 05', sessoes: 6, relatorios: 2 },
                { label: 'Sem 06', sessoes: 8, relatorios: 4 },
                { label: 'Sem 07', sessoes: 7, relatorios: 2 },
              ].map((item, idx) => {
                const maxVal = 10;
                const hSessoes = (item.sessoes / maxVal) * 100;
                const hRelatorios = (item.relatorios / maxVal) * 100;

                return (
                  <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-28 sm:h-32">
                      {/* Sessões bar */}
                      <div
                        style={{ height: `${hSessoes}%` }}
                        title={`${item.label}: ${item.sessoes} sessões`}
                        className="w-1/2 max-w-[12px] sm:max-w-[14px] bg-[#008B94] dark:bg-[#00E5FF] rounded-t-sm group-hover:opacity-80 transition-all"
                      />
                      {/* Relatórios bar */}
                      <div
                        style={{ height: `${hRelatorios}%` }}
                        title={`${item.label}: ${item.relatorios} relatórios`}
                        className="w-1/2 max-w-[12px] sm:max-w-[14px] bg-purple-500 dark:bg-[#b9a9df] rounded-t-sm group-hover:opacity-80 transition-all"
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-[#8da4ac]">{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 text-xs text-slate-500 dark:text-[#8da4ac]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#008B94] dark:bg-[#00E5FF]" />
                <span>Sessões Registradas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-purple-500 dark:bg-[#b9a9df]" />
                <span>Relatórios & Devolutivas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Próximas Sessões + Atalhos Rápidos */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-slate-200 dark:border-[#1e2d3b] p-4 sm:p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Ações Rápidas</h2>
            <p className="text-xs text-slate-500 dark:text-[#8da4ac] mb-3 sm:mb-4">Atalhos para fluxos rotineiros</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('aprendente-novo')}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] hover:bg-slate-50 dark:hover:bg-[#182633] transition-all text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-[#182633] text-[#007a82] dark:text-[#00E5FF] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">Novo Aprendente</span>
                    <span className="text-[11px] text-slate-500 dark:text-[#8da4ac] block truncate">Cadastro em 3 etapas</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('relatorio-novo')}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] hover:bg-slate-50 dark:hover:bg-[#182633] transition-all text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-[#201a2e] text-purple-600 dark:text-[#c4b5fd] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">Novo Relatório</span>
                    <span className="text-[11px] text-slate-500 dark:text-[#8da4ac] block truncate">Estrutura modular descritiva</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={() => onNavigate('sessoes', { id: 'apr-2' })}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] hover:bg-slate-50 dark:hover:bg-[#182633] transition-all text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-[#182633] text-[#007a82] dark:text-[#00E5FF] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">Registrar Sessão</span>
                    <span className="text-[11px] text-slate-500 dark:text-[#8da4ac] block truncate">Objetivos e observações</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Agenda & Próximas Sessões */}
          <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-slate-200 dark:border-[#1e2d3b] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Consultas Programadas</h2>
                <p className="text-xs text-slate-500 dark:text-[#8da4ac]">Agenda de atendimentos</p>
              </div>
              <button
                onClick={() => onNavigate('lembretes')}
                className="text-xs font-semibold text-[#007a82] dark:text-[#00E5FF] hover:underline"
              >
                Abrir agenda
              </button>
            </div>

            {proximosLembretes.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-[#8da4ac] text-center py-6">
                Nenhum compromisso agendado para os próximos dias.
              </p>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {proximosLembretes.slice(0, 3).map((lem) => (
                  <div
                    key={lem.id}
                    onClick={() => onNavigate('lembretes', { id: lem.id })}
                    className="p-3 rounded-xl border border-slate-200 dark:border-[#1e2d3b] hover:border-[#238B8D]/40 dark:hover:border-[#00E5FF]/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">{lem.horarioInicio}</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac]">{lem.data}</span>
                    </div>
                    <p className="text-xs font-medium text-[#007a82] dark:text-[#00E5FF] truncate">
                      {lem.nomeAprendente}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8da4ac] mt-1">
                      <span className="capitalize">
                        {lem.tipoCompromisso === 'sessao_individual'
                          ? 'Sessão Individual'
                          : lem.tipoCompromisso === 'devolutiva_pais'
                          ? 'Devolutiva aos Pais'
                          : 'Reunião Escolar'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lem.duracaoMinutos} min</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
