'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  Eye,
  Copy,
  ChevronRight,
  RotateCcw,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Aprendente, StatusAprendente } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/ToastContainer';

interface AprendentesListViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
  initialQuery?: string;
}

export const AprendentesListView: React.FC<AprendentesListViewProps> = ({
  onNavigate,
  initialQuery = '',
}) => {
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([]);
  const [termoBusca, setTermoBusca] = useState(initialQuery);
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [faixaEtariaFiltro, setFaixaEtariaFiltro] = useState<string>('todas');
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  // Modais de segurança
  const [modalExcluir, setModalExcluir] = useState<{ aberto: boolean; item?: Aprendente }>({
    aberto: false,
  });
  const [modalArquivar, setModalArquivar] = useState<{ aberto: boolean; item?: Aprendente }>({
    aberto: false,
  });

  const carregarDados = () => {
    setAprendentes(storage.getAprendentes());
  };

  useEffect(() => {
    carregarDados();
    window.addEventListener('praxis_storage_updated', carregarDados);
    return () => window.removeEventListener('praxis_storage_updated', carregarDados);
  }, []);

  // Fechar menus de ação ao clicar fora
  useEffect(() => {
    const handleClose = () => setMenuAbertoId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const aprendentesFiltrados = useMemo(() => {
    return aprendentes.filter((apr) => {
      // Busca
      const query = termoBusca.toLowerCase().trim();
      const matchBusca =
        !query ||
        apr.nomeCompleto.toLowerCase().includes(query) ||
        apr.codigoInterno.toLowerCase().includes(query) ||
        apr.paisResponsaveis.some((r) => r.nomeCompleto.toLowerCase().includes(query));

      // Filtro Status
      const matchStatus =
        statusFiltro === 'todos'
          ? apr.status !== 'arquivado'
          : statusFiltro === 'arquivados'
          ? apr.status === 'arquivado'
          : apr.status === statusFiltro;

      // Filtro Faixa Etária
      let matchIdade = true;
      if (faixaEtariaFiltro === 'infantil') matchIdade = apr.idadeCalculada <= 6;
      else if (faixaEtariaFiltro === 'fundamental1') matchIdade = apr.idadeCalculada >= 7 && apr.idadeCalculada <= 10;
      else if (faixaEtariaFiltro === 'fundamental2') matchIdade = apr.idadeCalculada >= 11 && apr.idadeCalculada <= 14;
      else if (faixaEtariaFiltro === 'medio') matchIdade = apr.idadeCalculada >= 15;

      return matchBusca && matchStatus && matchIdade;
    });
  }, [aprendentes, termoBusca, statusFiltro, faixaEtariaFiltro]);

  const handleExcluirConfirmado = () => {
    if (!modalExcluir.item) return;
    const ok = storage.deleteAprendente(modalExcluir.item.id);
    if (ok) {
      showToast(`Aprendente ${modalExcluir.item.nomeCompleto} movido para a lixeira.`, 'info', 'Desfazer', () => {
        storage.restoreFromLixeira(modalExcluir.item!.id);
        showToast('Registro restaurado com sucesso!', 'sucesso');
      });
    }
  };

  const handleArquivarConfirmado = () => {
    if (!modalArquivar.item) return;
    const item = { ...modalArquivar.item, status: 'arquivado' as StatusAprendente };
    storage.saveAprendente(item);
    showToast(`Aprendente ${item.nomeCompleto} arquivado com sucesso.`, 'sucesso');
  };

  const handleDuplicarFormulario = (apr: Aprendente) => {
    showToast(`Estrutura de formulário de ${apr.nomeCompleto} clonada para rascunho.`, 'sucesso');
    onNavigate('anamnese', { id: apr.id });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#183238]">Aprendentes</h1>
          <p className="text-xs text-[#52676B] mt-0.5">
            Cadastro, prontuário compreensivo e acompanhamento longitudinal dos atendimentos.
          </p>
        </div>

        <button
          onClick={() => onNavigate('aprendente-novo')}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Aprendente</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#52676B]" />
          <input
            type="text"
            placeholder="Buscar por nome, código ou responsável..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7FAFA] border border-[#EEF5F4] rounded-xl focus:outline-hidden focus:border-[#238B8D] transition-colors"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F7FAFA] border border-[#EEF5F4] rounded-xl text-[#183238] focus:outline-hidden focus:border-[#238B8D]"
          >
            <option value="todos">Status: Ativos e Avaliação</option>
            <option value="acompanhamento">Em Acompanhamento</option>
            <option value="avaliacao">Avaliação Inicial</option>
            <option value="pausado">Pausados</option>
            <option value="arquivados">Arquivados</option>
          </select>

          <select
            value={faixaEtariaFiltro}
            onChange={(e) => setFaixaEtariaFiltro(e.target.value)}
            className="text-xs py-2 px-3 bg-[#F7FAFA] border border-[#EEF5F4] rounded-xl text-[#183238] focus:outline-hidden focus:border-[#238B8D]"
          >
            <option value="todas">Faixa Etária: Todas</option>
            <option value="infantil">Até 6 anos (Ed. Infantil)</option>
            <option value="fundamental1">7 a 10 anos (Fund. I)</option>
            <option value="fundamental2">11 a 14 anos (Fund. II)</option>
            <option value="medio">15+ anos (Ensino Médio)</option>
          </select>

          {(termoBusca || statusFiltro !== 'todos' || faixaEtariaFiltro !== 'todas') && (
            <button
              onClick={() => {
                setTermoBusca('');
                setStatusFiltro('todos');
                setFaixaEtariaFiltro('todas');
              }}
              className="text-xs text-[#176B73] hover:underline font-semibold px-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Table View (Desktop) and Card View (Mobile) */}
      {aprendentesFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EEF5F4] p-12 text-center">
          <Users className="w-12 h-12 text-[#52676B]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#183238]">Nenhum aprendente encontrado</h3>
          <p className="text-xs text-[#52676B] max-w-sm mx-auto mt-1 mb-5">
            Tente ajustar os termos da busca ou os filtros aplicados para localizar o registro.
          </p>
          <button
            onClick={() => {
              setTermoBusca('');
              setStatusFiltro('todos');
              setFaixaEtariaFiltro('todas');
            }}
            className="px-4 py-2 text-xs font-semibold text-[#176B73] bg-[#EEF5F4] hover:bg-[#d4ecec] rounded-xl transition-colors"
          >
            Redefinir Filtros
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table (Visible on lg screens) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-[#EEF5F4] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-[#183238]">
              <thead className="bg-[#F7FAFA] border-b border-[#EEF5F4] text-[#52676B] uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-5">Aprendente</th>
                  <th scope="col" className="py-3.5 px-4">Idade & Escolaridade</th>
                  <th scope="col" className="py-3.5 px-4">Responsável Legal</th>
                  <th scope="col" className="py-3.5 px-4">Status</th>
                  <th scope="col" className="py-3.5 px-4">Última Atualização</th>
                  <th scope="col" className="py-3.5 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF5F4]">
                {aprendentesFiltrados.map((apr) => {
                  const resp = apr.paisResponsaveis.find((r) => r.responsavelLegal) || apr.paisResponsaveis[0];
                  const initials = apr.nomeCompleto
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('');

                  let statusBadge = 'Em acompanhamento';
                  let statusBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
                  if (apr.status === 'avaliacao') {
                    statusBadge = 'Avaliação inicial';
                    statusBg = 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-[#00E5FF]';
                  } else if (apr.status === 'pausado') {
                    statusBadge = 'Pausado';
                    statusBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
                  } else if (apr.status === 'arquivado') {
                    statusBadge = 'Arquivado';
                    statusBg = 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  }

                  return (
                    <tr
                      key={apr.id}
                      className="hover:bg-[#F7FAFA] transition-colors cursor-pointer group"
                      onClick={() => onNavigate('aprendente-detalhe', { id: apr.id })}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EEF5F4] text-[#176B73] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#176B73] group-hover:text-white transition-colors">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#183238] text-sm group-hover:text-[#176B73] transition-colors">
                              {apr.nomeCompleto}
                            </div>
                            <div className="text-[11px] text-[#52676B] font-mono mt-0.5">
                              {apr.codigoInterno}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#183238]">{apr.idadeCalculada} anos</div>
                        <div className="text-[11px] text-[#52676B] truncate max-w-[200px]">
                          {apr.contextoEscolar.etapaAno}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#183238]">{resp ? resp.nomeCompleto : 'Não informado'}</div>
                        <div className="text-[11px] text-[#52676B]">{resp ? resp.telefone : apr.contatoPreferencial}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${statusBg}`}>
                          {statusBadge}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-[#52676B] tabular-nums">
                        {apr.atualizadoEm}
                      </td>

                      <td className="py-4 px-5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate('aprendente-novo', { id: apr.id })}
                            title="Editar Dados do Aprendente"
                            className="p-1.5 text-[#008B94] hover:text-[#007a82] dark:text-[#00E5FF] hover:bg-[#EEF5F4] dark:hover:bg-[#182633] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => onNavigate('aprendente-detalhe', { id: apr.id })}
                            title="Ver Perfil Completo"
                            className="p-1.5 text-[#52676B] hover:text-[#176B73] hover:bg-[#EEF5F4] rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAbertoId(menuAbertoId === apr.id ? null : apr.id);
                            }}
                            aria-label="Mais opções"
                            className="p-1.5 text-[#52676B] hover:text-[#183238] hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Dropdown de Ações */}
                        {menuAbertoId === apr.id && (
                          <div className="absolute right-5 mt-1 w-48 bg-white border border-[#EEF5F4] rounded-xl shadow-xl p-1.5 z-30 text-left animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                onNavigate('anamnese', { id: apr.id });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#183238] hover:bg-[#EEF5F4] rounded-lg transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#176B73]" />
                              <span>Abrir Anamnese</span>
                            </button>
                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                onNavigate('sessoes', { id: apr.id });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#183238] hover:bg-[#EEF5F4] rounded-lg transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#238B8D]" />
                              <span>Ver Sessões</span>
                            </button>
                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                handleDuplicarFormulario(apr);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#183238] hover:bg-[#EEF5F4] rounded-lg transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#8B7BB5]" />
                              <span>Duplicar Modelo</span>
                            </button>
                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                setModalArquivar({ aberto: true, item: apr });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>Arquivar Aprendente</span>
                            </button>
                            <button
                              onClick={() => {
                                setMenuAbertoId(null);
                                setModalExcluir({ aberto: true, item: apr });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#B54747] hover:bg-[#fee2e2]/40 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir (Lixeira)</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Visible below lg screens) */}
          <div className="lg:hidden space-y-3">
            {aprendentesFiltrados.map((apr) => {
              const resp = apr.paisResponsaveis.find((r) => r.responsavelLegal) || apr.paisResponsaveis[0];
              const initials = apr.nomeCompleto
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <div
                  key={apr.id}
                  onClick={() => onNavigate('aprendente-detalhe', { id: apr.id })}
                  className="bg-white p-4 rounded-2xl border border-[#EEF5F4] shadow-xs active:bg-[#F7FAFA] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF5F4] text-[#176B73] font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#183238] text-sm leading-tight">
                          {apr.nomeCompleto}
                        </h3>
                        <p className="text-[11px] text-[#52676B] font-mono mt-0.5">
                          {apr.codigoInterno} · {apr.idadeCalculada} anos
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EEF5F4] text-[#176B73] shrink-0">
                      {apr.status === 'avaliacao' ? 'Avaliação' : 'Acompanhamento'}
                    </span>
                  </div>

                  <div className="text-xs text-[#52676B] space-y-1 mb-3 pt-2 border-t border-[#EEF5F4]">
                    <div>
                      Escola: <strong className="text-[#183238] font-normal">{apr.contextoEscolar.instituicao}</strong>
                    </div>
                    {resp && (
                      <div>
                        Responsável: <strong className="text-[#183238] font-normal">{resp.nomeCompleto} ({resp.telefone})</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EEF5F4] dark:border-[#1e2d3b] text-xs">
                    <span className="text-[11px] text-[#52676B] dark:text-slate-400">Atualizado em {apr.atualizadoEm}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('aprendente-novo', { id: apr.id });
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#008B94] dark:text-[#00E5FF] bg-teal-50 dark:bg-[#182633] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalExcluir({ aberto: true, item: apr });
                        }}
                        title="Excluir Aprendente"
                        className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold text-[#176B73] dark:text-[#00E5FF] flex items-center gap-1">
                        <span>Ver Perfil</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modais de Confirmação Segura */}
      <ConfirmModal
        isOpen={modalExcluir.aberto}
        onClose={() => setModalExcluir({ aberto: false })}
        onConfirm={handleExcluirConfirmado}
        tipo="excluir"
        titulo="Mover Aprendente para a Lixeira"
        itemIdentificador={modalExcluir.item?.nomeCompleto || ''}
        mensagemExtra="O aprendente e seu histórico serão transferidos para a lixeira demonstrativa local. Você poderá restaurá-lo a qualquer momento na tela de Configurações."
      />

      <ConfirmModal
        isOpen={modalArquivar.aberto}
        onClose={() => setModalArquivar({ aberto: false })}
        onConfirm={handleArquivarConfirmado}
        tipo="arquivar"
        titulo="Arquivar Registro do Aprendente"
        itemIdentificador={modalArquivar.item?.nomeCompleto || ''}
        mensagemExtra="O aprendente será marcado como arquivado e não aparecerá nas listagens rotineiras, ficando preservado para consultas futuras."
      />
    </div>
  );
};
