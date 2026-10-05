'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Clock,
  Eye,
  CheckSquare,
  Square,
  HelpCircle,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { RelatorioPsicopedagogico, RelatorioSecoes, Aprendente } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface RelatorioWizardViewProps {
  aprendenteId?: string;
  relatorioId?: string;
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const RelatorioWizardView: React.FC<RelatorioWizardViewProps> = ({
  aprendenteId,
  relatorioId,
  onNavigate,
}) => {
  const [etapa, setEtapa] = useState<number>(1);
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([]);
  const [aprendenteSelId, setAprendenteSelId] = useState<string>(aprendenteId || 'apr-2');
  const [salvando, setSalvando] = useState(false);
  const [ultimoSalvoHora, setUltimoSalvoHora] = useState('');
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Report State
  const [titulo, setTitulo] = useState('Relatório Psicopedagógico de Acompanhamento');
  const [status, setStatus] = useState<'rascunho' | 'em_revisao' | 'finalizado' | 'enviado'>('rascunho');

  const [secoesAtivas, setSecoesAtivas] = useState<RelatorioSecoes>({
    capa: true,
    identificacaoAprendente: true,
    identificacaoResponsaveis: true,
    demandaMotivo: true,
    periodoContexto: true,
    procedimentosInstrumentos: true,
    antecedentesHistorico: true,
    observacoesProcesso: true,
    perfilAprendizagem: true,
    aspectosObservados: true,
    potencialidadesBarreiras: true,
    sinteseDescritiva: true,
    recomendacoesPraticas: true,
    planoAcompanhamento: true,
    limitacoesEticas: true,
    registroAtendimentoLivre: true,
    identificacaoProfissional: true,
  });

  const [conteudo, setConteudo] = useState({
    demandaMotivo: 'Investigação do perfil de aprendizagem, autonomia nos estudos e adaptação curricular.',
    periodoContexto: 'Período avaliado: de 01/02/2026 a 25/03/2026, compreendendo 6 sessões de atendimento e reuniões escolares.',
    procedimentosInstrumentos: 'Entrevista Operativa Centrada na Aprendizagem (EOCA), Provas Piagetianas de conservação, leitura compartilhada e jogos de raciocínio.',
    antecedentesHistorico: 'Desenvolvimento psicomotor típico relatado em anamnese; queixa recente de hesitação em tarefas escritas.',
    observacoesProcesso: 'Participativo e reflexivo. Beneficia-se de pausas ativas e instruções segmentadas por etapas visuais.',
    perfilAprendizagem: 'Predileção por abordagens concretas e recursos gráficos. Canal preferencial auditivo e manipulativo.',
    aspectosObservados: 'Atenção sustentada adequada para a faixa etária com estímulos estruturados. Boa regulação socioemocional.',
    potencialidadesBarreiras: 'Potencialidades: Criatividade e curiosidade. Barreiras: Insegurança inicial perante textos dissertativos longos.',
    sinteseDescritiva: 'Identifica-se processo evolutivo promissor com resposta muito positiva à mediação psicopedagógica orientada.',
    recomendacoesFamilia: 'Manter rotina visual de estudos em casa e estimular a leitura compartilhada de narrativas sem cobrança formal de desempenho.',
    recomendacoesEscola: 'Disponibilizar enunciados com apoio visual e fragmentar prazos de entrega de trabalhos em etapas menores.',
    planoAcompanhamento: 'Manutenção de sessões semanais de intervenção psicopedagógica clínica com reavaliação em 90 dias.',
    limitacoesEticas: 'Documento psicopedagógico emitido para fins pedagógicos e de desenvolvimento, resguardado pelo sigilo profissional.',
    registroAtendimentoLivre: '',
    identificacaoProfissional: {
      nome: 'Dra. Gabriela Antunes Ferreira',
      registroProfissional: 'Psicopedagoga Clínica - ABPp nº 14.892/SP',
      instituicaoConsultorio: 'Espaço Integrado de Desenvolvimento e Aprendizagem',
      cidadeData: 'São Paulo, 30 de Março de 2026',
    },
  });

  useEffect(() => {
    const list = storage.getAprendentes();
    setAprendentes(list);

    if (relatorioId) {
      const rel = storage.getRelatorioById(relatorioId);
      if (rel) {
        setAprendenteSelId(rel.aprendenteId);
        setTitulo(rel.titulo);
        setStatus(rel.status as any);
        setSecoesAtivas({
          ...rel.secoesAtivas,
          registroAtendimentoLivre: rel.secoesAtivas.registroAtendimentoLivre ?? true,
        });
        setConteudo({
          ...rel.conteudo,
          registroAtendimentoLivre: rel.conteudo.registroAtendimentoLivre || '',
        });
      }
    } else {
      setAprendenteSelId((prev) => (prev ? prev : aprendenteId || list[0]?.id || ''));
    }
  }, [relatorioId, aprendenteId]);

  const totalEtapas = 13;

  const toggleSecao = (campo: keyof RelatorioSecoes) => {
    setSecoesAtivas((prev) => ({ ...prev, [campo]: !prev[campo] }));
  };

  const handleSalvarRascunho = (novoStatus?: 'rascunho' | 'em_revisao' | 'finalizado' | 'enviado') => {
    setSalvando(true);
    const existing = relatorioId ? storage.getRelatorioById(relatorioId) : null;
    const finalStatus = novoStatus || status;

    const salvoRelatorio: RelatorioPsicopedagogico = {
      id: existing ? existing.id : `rel-${Date.now()}`,
      codigoDocumento: existing ? existing.codigoDocumento : `REL-2026-${Math.floor(100 + Math.random() * 900)}`,
      aprendenteId: aprendenteSelId,
      titulo,
      dataCriacao: existing ? existing.dataCriacao : new Date().toISOString().split('T')[0],
      dataFinalizacao:
        finalStatus === 'finalizado' || finalStatus === 'enviado'
          ? (existing?.dataFinalizacao || new Date().toISOString().split('T')[0])
          : undefined,
      status: finalStatus,
      secoesAtivas,
      conteudo,
    };

    storage.saveRelatorio(salvoRelatorio);
    setTimeout(() => {
      setSalvando(false);
      setUltimoSalvoHora(new Date().toLocaleTimeString('pt-BR'));
      showToast(
        finalStatus === 'finalizado'
          ? 'Relatório finalizado com sucesso!'
          : finalStatus === 'enviado'
          ? 'Relatório marcado como enviado!'
          : 'Relatório salvo com sucesso localmente.',
        'sucesso'
      );
      if (finalStatus === 'finalizado' || finalStatus === 'enviado') {
        onNavigate('relatorio-visualizar', { id: salvoRelatorio.id });
      }
    }, 400);
  };

  const handleConfirmarExcluir = () => {
    if (!relatorioId) return;
    storage.deleteRelatorio(relatorioId);
    showToast('Relatório transferido para a lixeira.', 'info');
    onNavigate('relatorios');
  };

  const aprendenteAtual = aprendentes.find((a) => a.id === aprendenteSelId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('relatorios')}
            className="text-xs font-semibold text-[#176B73] hover:underline flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Lista de Relatórios</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183238]">
              Criador de Relatório Psicopedagógico
            </h1>
          </div>
          <p className="text-xs text-[#52676B] mt-0.5">
            Elaboração em etapas guiadas com autosave, separação de fatos e orientações aplicáveis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="flex items-center gap-1 text-[#52676B]">
              <Clock className="w-3.5 h-3.5 text-[#238B8D]" />
              <span>{salvando ? 'Salvando...' : ultimoSalvoHora ? `Salvo às ${ultimoSalvoHora}` : 'Autosave ativo'}</span>
            </div>
          </div>
          <button
            onClick={() => handleSalvarRascunho('rascunho')}
            className="px-3.5 py-2 text-xs font-semibold text-[#176B73] bg-[#EEF5F4] hover:bg-[#d4ecec] rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Rascunho</span>
          </button>
          {relatorioId && (
            <button
              type="button"
              onClick={() => setModalExcluirAberto(true)}
              title="Excluir este relatório"
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar and Step Indicator */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#183238]">
            Etapa {etapa} de {totalEtapas}
          </span>
          <span className="text-[#52676B] font-mono">
            {Math.round((etapa / totalEtapas) * 100)}% concluído
          </span>
        </div>
        <div className="w-full h-2 bg-[#EEF5F4] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#176B73] to-[#238B8D] transition-all duration-300"
            style={{ width: `${(etapa / totalEtapas) * 100}%` }}
          />
        </div>
      </div>

      {/* Wizard Step Content */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-6 space-y-5">
        {/* Etapa 1: Selecionar Aprendente e Título */}
        {etapa === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              1. Selecionar Aprendente e Título do Documento
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Aprendente Vinculado *
              </label>
              <select
                value={aprendenteSelId}
                onChange={(e) => setAprendenteSelId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              >
                {aprendentes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nomeCompleto} ({a.codigoInterno} - {a.idadeCalculada} anos)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Título do Relatório *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Período do Acompanhamento / Avaliação
              </label>
              <input
                type="text"
                value={conteudo.periodoContexto}
                onChange={(e) => setConteudo({ ...conteudo, periodoContexto: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>

            {/* Espaço Livre para Relato da Sessão de Hoje */}
            <div className="bg-[#f0f9fa] dark:bg-[#0f1d24] border border-[#d4ecec] dark:border-[#1b3540] rounded-xl p-4 space-y-2 mt-3">
              <label className="block text-xs font-bold text-[#007a82] dark:text-[#00E5FF]">
                ✍️ Registro Livre da Sessão / Como foi o Atendimento (O que aconteceu na sessão)
              </label>
              <p className="text-[11px] text-[#52676B] dark:text-slate-300">
                Espaço para você escrever com suas próprias palavras como foi o atendimento de hoje, sem formulários ou textos pré-preenchidos:
              </p>
              <textarea
                rows={4}
                value={conteudo.registroAtendimentoLivre || ''}
                onChange={(e) => setConteudo({ ...conteudo, registroAtendimentoLivre: e.target.value })}
                placeholder="Ex: Na sessão de hoje, iniciamos com atividade lúdica de acolhimento. O aprendente demonstrou grande entusiasmo com os desafios visomotores e compartilhou espontaneamente suas experiências recentes..."
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#0e1720] text-[#183238] dark:text-white focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 2: Seleção Modular de Seções */}
        {etapa === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              2. Seleção Modular de Seções Ativas no Documento
            </h2>
            <p className="text-xs text-[#52676B]">
              Marque quais blocos devem constar na versão final e impressa do relatório:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { k: 'capa', label: 'Capa Discreta e Profissional' },
                { k: 'identificacaoAprendente', label: 'Identificação do Aprendente' },
                { k: 'identificacaoResponsaveis', label: 'Identificação dos Pais / Responsáveis' },
                { k: 'demandaMotivo', label: 'Demanda e Motivo do Encaminhamento' },
                { k: 'periodoContexto', label: 'Período, Contexto e Fontes de Informação' },
                { k: 'procedimentosInstrumentos', label: 'Procedimentos e Instrumentos Utilizados' },
                { k: 'antecedentesHistorico', label: 'Antecedentes e História Relevante' },
                { k: 'observacoesProcesso', label: 'Observações Durante o Processo' },
                { k: 'perfilAprendizagem', label: 'Perfil de Aprendizagem e Aspectos Pedagógicos' },
                { k: 'aspectosObservados', label: 'Aspectos Cognitivos, Linguísticos e Motores' },
                { k: 'potencialidadesBarreiras', label: 'Potencialidades e Barreiras' },
                { k: 'sinteseDescritiva', label: 'Síntese Descritiva e Compreensiva' },
                { k: 'recomendacoesPraticas', label: 'Recomendações Práticas (Família e Escola)' },
                { k: 'planoAcompanhamento', label: 'Plano de Acompanhamento e Metas' },
                { k: 'limitacoesEticas', label: 'Limitações Éticas e Sigilo' },
                { k: 'identificacaoProfissional', label: 'Assinatura e Identificação Profissional' },
              ].map((item) => {
                const ativo = (secoesAtivas as any)[item.k];
                return (
                  <button
                    key={item.k}
                    type="button"
                    onClick={() => toggleSecao(item.k as any)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                      ativo
                        ? 'border-[#238B8D]/30 bg-[#EEF5F4]/60 text-[#176B73] font-medium'
                        : 'border-[#EEF5F4] bg-[#F7FAFA] text-[#52676B]'
                    }`}
                  >
                    {ativo ? (
                      <CheckSquare className="w-4 h-4 text-[#176B73] shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-[#52676B] shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Etapa 3: Demanda e Motivo */}
        {etapa === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              3. Demanda e Motivo do Encaminhamento
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Descrição da Demanda Inicial
              </label>
              <textarea
                rows={4}
                value={conteudo.demandaMotivo}
                onChange={(e) => setConteudo({ ...conteudo, demandaMotivo: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
              <span className="text-[11px] text-[#52676B] mt-1 block">
                {conteudo.demandaMotivo.length} caracteres
              </span>
            </div>
          </div>
        )}

        {/* Etapa 4: Procedimentos e Instrumentos */}
        {etapa === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              4. Procedimentos e Instrumentos Utilizados
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Técnicas, instrumentos diagnósticos e recursos de intervenção
              </label>
              <textarea
                rows={4}
                value={conteudo.procedimentosInstrumentos}
                onChange={(e) => setConteudo({ ...conteudo, procedimentosInstrumentos: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 5: Histórico Relevante */}
        {etapa === 5 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              5. Antecedentes e História Relevante
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Dados do desenvolvimento e histórico prévio de aprendizagem
              </label>
              <textarea
                rows={4}
                value={conteudo.antecedentesHistorico}
                onChange={(e) => setConteudo({ ...conteudo, antecedentesHistorico: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 6: Observações durante o processo */}
        {etapa === 6 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              6. Observações Durante o Processo
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Comportamento, vínculo, resposta à mediação e postura
              </label>
              <textarea
                rows={4}
                value={conteudo.observacoesProcesso}
                onChange={(e) => setConteudo({ ...conteudo, observacoesProcesso: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 7: Perfil de Aprendizagem */}
        {etapa === 7 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              7. Perfil de Aprendizagem e Aspectos Pedagógicos
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Modalidades de aprendizagem, canais de processamento e estilo cognitivo
              </label>
              <textarea
                rows={4}
                value={conteudo.perfilAprendizagem}
                onChange={(e) => setConteudo({ ...conteudo, perfilAprendizagem: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 8: Aspectos Observados */}
        {etapa === 8 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              8. Aspectos Cognitivos, Linguísticos e Psicomotores
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Evidências qualitativas de leitura, escrita, raciocínio lógico e funções executivas
              </label>
              <textarea
                rows={4}
                value={conteudo.aspectosObservados}
                onChange={(e) => setConteudo({ ...conteudo, aspectosObservados: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 9: Potencialidades e Barreiras */}
        {etapa === 9 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              9. Potencialidades e Barreiras Observadas
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Recursos próprios, fatores protetivos e desafios a serem transpostos
              </label>
              <textarea
                rows={4}
                value={conteudo.potencialidadesBarreiras}
                onChange={(e) => setConteudo({ ...conteudo, potencialidadesBarreiras: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 10: Síntese Descritiva (Sem diagnósticos automáticos) */}
        {etapa === 10 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              <ShieldCheck className="w-4 h-4 text-[#176B73]" />
              <h2>10. Síntese Descritiva e Compreensiva (Sem Rótulos)</h2>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Conclusão articulada dos achados psicopedagógicos
              </label>
              <textarea
                rows={4}
                value={conteudo.sinteseDescritiva}
                onChange={(e) => setConteudo({ ...conteudo, sinteseDescritiva: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 11: Recomendações Práticas (Família e Escola) */}
        {etapa === 11 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              11. Orientações e Recomendações Práticas
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#176B73] mb-1">
                Recomendações e Orientações para a Família
              </label>
              <textarea
                rows={3}
                value={conteudo.recomendacoesFamilia}
                onChange={(e) => setConteudo({ ...conteudo, recomendacoesFamilia: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B7BB5] mb-1">
                Recomendações Pedagógicas para a Escola
              </label>
              <textarea
                rows={3}
                value={conteudo.recomendacoesEscola}
                onChange={(e) => setConteudo({ ...conteudo, recomendacoesEscola: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>
          </div>
        )}

        {/* Etapa 12: Plano de Acompanhamento e Identificação Profissional */}
        {etapa === 12 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              12. Plano de Acompanhamento e Identificação Profissional
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#183238] mb-1">
                Plano de Acompanhamento e Metas de Curto/Médio Prazo
              </label>
              <textarea
                rows={2}
                value={conteudo.planoAcompanhamento}
                onChange={(e) => setConteudo({ ...conteudo, planoAcompanhamento: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#183238] mb-1">
                  Profissional Responsável
                </label>
                <input
                  type="text"
                  value={conteudo.identificacaoProfissional.nome}
                  onChange={(e) =>
                    setConteudo({
                      ...conteudo,
                      identificacaoProfissional: {
                        ...conteudo.identificacaoProfissional,
                        nome: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] mb-1">
                  Registro Profissional (Demonstrativo)
                </label>
                <input
                  type="text"
                  value={conteudo.identificacaoProfissional.registroProfissional}
                  onChange={(e) =>
                    setConteudo({
                      ...conteudo,
                      identificacaoProfissional: {
                        ...conteudo.identificacaoProfissional,
                        registroProfissional: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Etapa 13: Revisão Final e Status */}
        {etapa === 13 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-sm font-bold text-[#183238] border-b border-[#EEF5F4] pb-2">
              13. Revisão Final e Confirmação de Emissão
            </h2>

            <div className="bg-[#F7FAFA] p-4 rounded-xl border border-[#EEF5F4] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#52676B]">Aprendente:</span>
                <strong className="text-[#183238]">{aprendenteAtual?.nomeCompleto}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52676B]">Título:</span>
                <strong className="text-[#183238]">{titulo}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52676B]">Responsável:</span>
                <strong className="text-[#183238]">{conteudo.identificacaoProfissional.nome}</strong>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#183238] mb-2">
                Definir Status de Publicação:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('rascunho')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    status === 'rascunho'
                      ? 'bg-[#EEF5F4] dark:bg-[#182633] text-[#176B73] dark:text-[#00E5FF] border-[#238B8D] dark:border-[#00E5FF]'
                      : 'border-[#EEF5F4] dark:border-[#1e2d3b] text-[#52676B] dark:text-slate-300'
                  }`}
                >
                  📝 Rascunho
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('em_revisao')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    status === 'em_revisao'
                      ? 'bg-[#ece8f6] dark:bg-[#201a2e] text-[#8B7BB5] dark:text-[#c4b5fd] border-[#8B7BB5]'
                      : 'border-[#EEF5F4] dark:border-[#1e2d3b] text-[#52676B] dark:text-slate-300'
                  }`}
                >
                  🔍 Em Revisão
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('finalizado')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    status === 'finalizado'
                      ? 'bg-[#e2f0e9] dark:bg-[#13271f] text-[#5c8f78] dark:text-[#86efac] border-[#6FA58B]'
                      : 'border-[#EEF5F4] dark:border-[#1e2d3b] text-[#52676B] dark:text-slate-300'
                  }`}
                >
                  ✅ Pronto / Finalizado
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('enviado')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    status === 'enviado'
                      ? 'bg-[#e0f7fa] dark:bg-[#0c2e35] text-[#008B94] dark:text-[#38edff] border-[#008B94]'
                      : 'border-[#EEF5F4] dark:border-[#1e2d3b] text-[#52676B] dark:text-slate-300'
                  }`}
                >
                  📤 Enviado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls between Steps */}
      <div className="flex items-center justify-between pt-2">
        {etapa > 1 ? (
          <button
            type="button"
            onClick={() => setEtapa((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2.5 text-xs font-semibold text-[#52676B] hover:text-[#183238] bg-white border border-[#EEF5F4] rounded-xl transition-colors flex items-center gap-1.5 min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Etapa Anterior</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {etapa < totalEtapas ? (
            <button
              type="button"
              onClick={() => setEtapa((prev) => Math.min(totalEtapas, prev + 1))}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <span>Próxima Etapa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSalvarRascunho(status)}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir e Visualizar em A4</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Exclusão de Relatório */}
      <ConfirmModal
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        onConfirm={handleConfirmarExcluir}
        tipo="excluir"
        titulo="Excluir Relatório Psicopedagógico"
        itemIdentificador={titulo}
        mensagemExtra="O documento será movido para a lixeira e poderá ser restaurado nas configurações se necessário."
      />
    </div>
  );
};
