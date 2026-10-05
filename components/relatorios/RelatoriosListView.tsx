'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Printer,
  ChevronRight,
  Filter
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { RelatorioPsicopedagogico, Aprendente } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface RelatoriosListViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const RelatoriosListView: React.FC<RelatoriosListViewProps> = ({ onNavigate }) => {
  const [relatorios, setRelatorios] = useState<RelatorioPsicopedagogico[]>([]);
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [modalExcluir, setModalExcluir] = useState<{ aberto: boolean; relatorio?: RelatorioPsicopedagogico }>({
    aberto: false,
  });

  const carregar = () => {
    setRelatorios(storage.getRelatorios());
    setAprendentes(storage.getAprendentes());
  };

  useEffect(() => {
    carregar();
    window.addEventListener('praxis_storage_updated', carregar);
    return () => window.removeEventListener('praxis_storage_updated', carregar);
  }, []);

  const relatoriosFiltrados = relatorios.filter((rel) => {
    const apr = aprendentes.find((a) => a.id === rel.aprendenteId);
    const nomeApr = apr ? apr.nomeCompleto.toLowerCase() : '';
    const matchBusca =
      !busca ||
      rel.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      rel.codigoDocumento.toLowerCase().includes(busca.toLowerCase()) ||
      nomeApr.includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === 'todos'
        ? rel.status !== 'arquivado'
        : filtroStatus === 'arquivados'
        ? rel.status === 'arquivado'
        : rel.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  const handleDuplicar = (rel: RelatorioPsicopedagogico) => {
    const clonado: RelatorioPsicopedagogico = {
      ...rel,
      id: `rel-${Date.now()}`,
      codigoDocumento: `REL-2026-${Math.floor(100 + Math.random() * 900)}`,
      titulo: `${rel.titulo} (Cópia)`,
      status: 'rascunho',
      dataCriacao: new Date().toISOString().split('T')[0],
      dataFinalizacao: undefined,
    };
    storage.saveRelatorio(clonado);
    showToast(`Relatório duplicado como "${clonado.titulo}"!`, 'sucesso');
  };

  const handleExcluirConfirmado = () => {
    if (!modalExcluir.relatorio) return;
    storage.deleteRelatorio(modalExcluir.relatorio.id);
    showToast('Relatório transferido para a lixeira.', 'info');
  };

  const handleAlterarStatusRelatorio = (
    rel: RelatorioPsicopedagogico,
    novoStatus: 'rascunho' | 'em_revisao' | 'finalizado' | 'enviado' | 'arquivado'
  ) => {
    const dataFinal =
      novoStatus === 'finalizado' || novoStatus === 'enviado'
        ? rel.dataFinalizacao || new Date().toISOString().split('T')[0]
        : undefined;

    const atualizado: RelatorioPsicopedagogico = {
      ...rel,
      status: novoStatus,
      dataFinalizacao: dataFinal,
    };

    storage.saveRelatorio(atualizado);
    setRelatorios(storage.getRelatorios());

    const labels = {
      rascunho: 'Rascunho',
      em_revisao: 'Em Revisão',
      finalizado: 'Pronto / Finalizado',
      enviado: 'Enviado',
      arquivado: 'Arquivado',
    };
    showToast(`Status de "${rel.titulo}" alterado para ${labels[novoStatus]}!`, 'sucesso');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#183238]">
            Biblioteca de Relatórios Psicopedagógicos
          </h1>
          <p className="text-xs text-[#52676B] mt-0.5">
            Elaboração modular de laudos, pareceres, devolutivas e planos de acompanhamento.
          </p>
        </div>

        <button
          onClick={() => onNavigate('relatorio-novo')}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Relatório</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#52676B]" />
          <input
            type="text"
            placeholder="Buscar por título, código ou aprendente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7FAFA] border border-[#EEF5F4] rounded-xl focus:outline-hidden focus:border-[#238B8D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F7FAFA] border border-[#EEF5F4] rounded-xl text-[#183238] focus:outline-hidden focus:border-[#238B8D]"
          >
            <option value="todos">Status: Ativos (Todos)</option>
            <option value="finalizado">Prontos / Finalizados</option>
            <option value="enviado">Enviados</option>
            <option value="em_revisao">Em Revisão</option>
            <option value="rascunho">Rascunhos</option>
            <option value="arquivados">Arquivados</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {relatoriosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EEF5F4] p-12 text-center">
          <FileText className="w-12 h-12 text-[#52676B]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#183238]">Nenhum relatório encontrado</h3>
          <p className="text-xs text-[#52676B] max-w-sm mx-auto mt-1 mb-5">
            Crie um novo relatório utilizando o assistente por etapas com dados demonstrativos.
          </p>
          <button
            onClick={() => onNavigate('relatorio-novo')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl transition-colors"
          >
            Criar Primeiro Relatório
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {relatoriosFiltrados.map((rel) => {
            const apr = aprendentes.find((a) => a.id === rel.aprendenteId);

            let statusBadge = 'Pronto';
            let statusStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
            if (rel.status === 'em_revisao') {
              statusBadge = 'Em Revisão';
              statusStyle = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
            } else if (rel.status === 'rascunho') {
              statusBadge = 'Rascunho';
              statusStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
            } else if (rel.status === 'enviado') {
              statusBadge = 'Enviado';
              statusStyle = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300';
            } else if (rel.status === 'arquivado') {
              statusBadge = 'Arquivado';
              statusStyle = 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            }

            return (
              <div
                key={rel.id}
                className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-5 shadow-xs hover:border-[#238B8D]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div
                  onClick={() => onNavigate('relatorio-visualizar', { id: rel.id })}
                  className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EEF5F4] dark:bg-[#182633] text-[#176B73] dark:text-[#00E5FF] flex items-center justify-center shrink-0 group-hover:bg-[#176B73] group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#183238] dark:text-white group-hover:text-[#176B73] dark:group-hover:text-[#00E5FF] transition-colors truncate">
                        {rel.titulo}
                      </h3>
                    </div>
                    <p className="text-xs text-[#52676B] dark:text-slate-400 mt-0.5">
                      Aprendente: <strong className="text-[#183238] dark:text-white">{apr ? apr.nomeCompleto : 'Não vinculado'}</strong>
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#52676B] dark:text-slate-400 font-mono mt-1">
                      <span>{rel.codigoDocumento}</span>
                      <span aria-hidden="true">·</span>
                      <span>Criado em {rel.dataCriacao}</span>
                      {rel.dataFinalizacao && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Finalizado em {rel.dataFinalizacao}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <div className="relative">
                    <select
                      value={rel.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleAlterarStatusRelatorio(rel, e.target.value as any)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-hidden transition-all ${statusStyle} border-current/20`}
                      title="Clique para alterar o status do relatório"
                    >
                      <option value="rascunho">📝 Rascunho</option>
                      <option value="em_revisao">🔍 Em Revisão</option>
                      <option value="finalizado">✅ Pronto</option>
                      <option value="enviado">📤 Enviado</option>
                      <option value="arquivado">📁 Arquivado</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onNavigate('relatorio-novo', { id: rel.id, aprendenteId: rel.aprendenteId })}
                    title="Editar Relatório"
                    className="p-2 text-[#008B94] hover:text-[#007a82] dark:text-[#00E5FF] hover:bg-[#EEF5F4] dark:hover:bg-[#182633] rounded-xl transition-colors min-h-[40px] flex items-center gap-1 text-xs font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => onNavigate('relatorio-visualizar', { id: rel.id })}
                    title="Visualizar / Imprimir em A4"
                    className="p-2 text-[#176B73] bg-[#EEF5F4] hover:bg-[#d4ecec] dark:bg-[#182633] dark:text-slate-200 dark:hover:bg-[#223544] rounded-xl transition-colors min-h-[40px] flex items-center gap-1 text-xs font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>

                  <button
                    onClick={() => handleDuplicar(rel)}
                    title="Duplicar Relatório"
                    className="p-2 text-[#52676B] dark:text-slate-400 hover:text-[#183238] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#182633] rounded-xl transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setModalExcluir({ aberto: true, relatorio: rel })}
                    title="Excluir"
                    className="p-2 text-[#52676B] dark:text-slate-400 hover:text-[#B54747] hover:bg-[#fee2e2]/40 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Exclusão */}
      <ConfirmModal
        isOpen={modalExcluir.aberto}
        onClose={() => setModalExcluir({ aberto: false })}
        onConfirm={handleExcluirConfirmado}
        tipo="excluir"
        titulo="Mover Relatório para a Lixeira"
        itemIdentificador={modalExcluir.relatorio?.titulo || ''}
      />
    </div>
  );
};
