'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Anamnese, SecaoAnamnese } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AnamneseFormViewProps {
  aprendenteId: string;
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const AnamneseFormView: React.FC<AnamneseFormViewProps> = ({
  aprendenteId,
  onNavigate,
}) => {
  const aprendente = storage.getAprendenteById(aprendenteId);
  const [anamnese, setAnamnese] = useState<Anamnese | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [ultimoSalvoHora, setUltimoSalvoHora] = useState<string>('');
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>({
    motivoProcura: true,
    queixaPrincipal: true,
  });

  const criarSecaoPadrao = (titulo: string): SecaoAnamnese => ({
    titulo,
    relatoFamilia: '',
    observacaoProfissional: '',
    hipoteseTrabalho: '',
  });

  useEffect(() => {
    if (!aprendenteId) return;
    const existente = storage.getAnamneseByAprendente(aprendenteId);
    if (existente) {
      setAnamnese(existente);
      if (existente.salvoEm) {
        setUltimoSalvoHora(new Date(existente.salvoEm).toLocaleTimeString('pt-BR'));
      }
    } else {
      // Nova anamnese
      const nova: Anamnese = {
        id: `ana-${Date.now()}`,
        aprendenteId,
        atualizadoEm: new Date().toISOString().split('T')[0],
        salvoEm: new Date().toISOString(),
        status: 'rascunho',
        motivoProcura: criarSecaoPadrao('1. Motivo da Procura / Encaminhamento'),
        queixaPrincipal: criarSecaoPadrao('2. Queixa Principal e Expectativas da Família'),
        historiaDesenvolvimento: criarSecaoPadrao('3. História do Desenvolvimento'),
        gestacaoNascimento: criarSecaoPadrao('4. Gestação e Nascimento'),
        saudeMedicacao: criarSecaoPadrao('5. Saúde, Medicamentos e Acompanhamentos'),
        sonoAlimentacaoRotina: criarSecaoPadrao('6. Sono, Alimentação e Rotina'),
        linguagemComunicacao: criarSecaoPadrao('7. Linguagem e Comunicação'),
        aspectosMotores: criarSecaoPadrao('8. Aspectos Motores e Psicomotores'),
        aspectosSocioemocionais: criarSecaoPadrao('9. Aspectos Socioemocionais Observáveis'),
        trajetoriaEscolar: criarSecaoPadrao('10. Trajetória Escolar'),
        leituraEscritaMatematica: criarSecaoPadrao('11. Leitura, Escrita, Matemática e Funções Executivas'),
        relacoesFamiliares: criarSecaoPadrao('12. Relações Familiares e Sociais'),
        recursosPotencialidades: criarSecaoPadrao('13. Recursos, Potencialidades e Fatores de Proteção'),
        observacoesAdicionais: criarSecaoPadrao('14. Observações Adicionais'),
        documentosEncaminhamentos: {
          arquivosDemonstrativos: ['relatorio_escola_demo.pdf'],
          anotacoes: 'Exames e relatórios apresentados no primeiro encontro.',
        },
      };
      setAnamnese(nova);
    }
  }, [aprendenteId]);

  const toggleSecao = (chave: string) => {
    setSecoesAbertas((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  const expandirTodas = (abrir: boolean) => {
    const novo: Record<string, boolean> = {};
    const chaves = [
      'motivoProcura',
      'queixaPrincipal',
      'historiaDesenvolvimento',
      'gestacaoNascimento',
      'saudeMedicacao',
      'sonoAlimentacaoRotina',
      'linguagemComunicacao',
      'aspectosMotores',
      'aspectosSocioemocionais',
      'trajetoriaEscolar',
      'leituraEscritaMatematica',
      'relacoesFamiliares',
      'recursosPotencialidades',
      'observacoesAdicionais',
      'documentosEncaminhamentos',
    ];
    chaves.forEach((k) => (novo[k] = abrir));
    setSecoesAbertas(novo);
  };

  const atualizarSecao = (
    chave: keyof Anamnese,
    subcampo: keyof SecaoAnamnese,
    valor: string
  ) => {
    if (!anamnese) return;
    const secaoAtual = anamnese[chave] as SecaoAnamnese;
    const atualizada = {
      ...anamnese,
      [chave]: {
        ...secaoAtual,
        [subcampo]: valor,
      },
    };
    setAnamnese(atualizada);

    // Autosave debounced
    salvarComAutosave(atualizada);
  };

  const salvarComAutosave = (dadosParaSalvar: Anamnese) => {
    setSalvando(true);
    storage.saveAnamnese(dadosParaSalvar);
    setTimeout(() => {
      setSalvando(false);
      setUltimoSalvoHora(new Date().toLocaleTimeString('pt-BR'));
    }, 400);
  };

  const handleSalvarManual = (novoStatus?: 'rascunho' | 'revisado' | 'finalizado') => {
    if (!anamnese) return;
    const dados = { ...anamnese };
    if (novoStatus) dados.status = novoStatus;
    storage.saveAnamnese(dados);
    setAnamnese(dados);
    setUltimoSalvoHora(new Date().toLocaleTimeString('pt-BR'));
    showToast(
      novoStatus === 'finalizado'
        ? 'Anamnese marcada como finalizada!'
        : 'Anamnese salva localmente com sucesso!',
      'sucesso'
    );
  };

  const handleConfirmarExcluirAnamnese = () => {
    if (!aprendente) return;
    storage.deleteAnamnese(aprendente.id);
    showToast(`Anamnese de ${aprendente.nomeCompleto} movida para a lixeira.`, 'info');
    onNavigate('aprendente-detalhe', { id: aprendente.id });
  };

  if (!anamnese || !aprendente) {
    return (
      <div className="p-8 text-center text-xs text-[#52676B]">
        Carregando anamnese...
      </div>
    );
  }

  const listaSecoes: { chave: keyof Anamnese; titulo: string; sensivel?: boolean }[] = [
    { chave: 'motivoProcura', titulo: '1. Motivo da Procura / Encaminhamento' },
    { chave: 'queixaPrincipal', titulo: '2. Queixa Principal e Expectativas da Família' },
    { chave: 'historiaDesenvolvimento', titulo: '3. História do Desenvolvimento' },
    { chave: 'gestacaoNascimento', titulo: '4. Gestação e Nascimento (Marcos do Desenvolvimento)' },
    { chave: 'saudeMedicacao', titulo: '5. Saúde, Medicamentos e Condições Preexistentes', sensivel: true },
    { chave: 'sonoAlimentacaoRotina', titulo: '6. Sono, Alimentação e Rotina Diária' },
    { chave: 'linguagemComunicacao', titulo: '7. Linguagem e Comunicação' },
    { chave: 'aspectosMotores', titulo: '8. Aspectos Motores e Psicomotores' },
    { chave: 'aspectosSocioemocionais', titulo: '9. Aspectos Socioemocionais e Comportamentais' },
    { chave: 'trajetoriaEscolar', titulo: '10. Trajetória Escolar e Adaptações Anteriores' },
    { chave: 'leituraEscritaMatematica', titulo: '11. Leitura, Escrita, Matemática e Funções Executivas' },
    { chave: 'relacoesFamiliares', titulo: '12. Relações Familiares, Sociais e Contexto' },
    { chave: 'recursosPotencialidades', titulo: '13. Recursos, Interesses e Fatores de Proteção' },
    { chave: 'observacoesAdicionais', titulo: '14. Observações Adicionais do Encontro' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('aprendente-detalhe', { id: aprendente.id })}
            className="text-xs font-semibold text-[#176B73] hover:underline flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Perfil de {aprendente.nomeCompleto}</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183238]">
              Anamnese Psicopedagógica
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF5F4] text-[#176B73] capitalize">
              {anamnese.status}
            </span>
          </div>
          <p className="text-xs text-[#52676B] mt-0.5">
            Aprendente: <strong>{aprendente.nomeCompleto}</strong> ({aprendente.idadeCalculada} anos) · {aprendente.codigoInterno}
          </p>
        </div>

        {/* Autosave Indicator and Actions */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="flex items-center gap-1.5 text-[#52676B]">
              <Clock className="w-3.5 h-3.5 text-[#238B8D]" />
              <span>
                {salvando ? 'Salvando localmente...' : ultimoSalvoHora ? `Salvo às ${ultimoSalvoHora}` : 'Autosave ativo'}
              </span>
            </div>
            <span className="text-[10px] text-[#8a9d9f]">Persistência local segura</span>
          </div>

          <button
            type="button"
            onClick={() => setModalExcluirAberto(true)}
            title="Excluir esta Anamnese"
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Anamnese</span>
          </button>

          <button
            onClick={() => handleSalvarManual('revisado')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Rascunho</span>
          </button>
        </div>
      </div>

      {/* Distinction Guide Card (Ethics & Pedagogy) */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-[#183238] mb-1.5">
          <HelpCircle className="w-4 h-4 text-[#8B7BB5]" />
          <span>Guia de Registro Neutro e Não Estigmatizante</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
          <div className="p-2.5 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4]">
            <strong className="text-[#176B73] block mb-0.5">1. Relato da Família:</strong>
            <span className="text-[#52676B]">
              O que os pais expressam em suas palavras, sem correções ou julgamentos morais.
            </span>
          </div>
          <div className="p-2.5 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4]">
            <strong className="text-[#8B7BB5] block mb-0.5">2. Observação Profissional:</strong>
            <span className="text-[#52676B]">
              Fatos comportamentais e evidências observadas diretamente pelo profissional.
            </span>
          </div>
          <div className="p-2.5 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4]">
            <strong className="text-[#6FA58B] block mb-0.5">3. Hipótese de Trabalho:</strong>
            <span className="text-[#52676B]">
              Ideias preliminares para orientar a testagem sem fechar diagnósticos precipitados.
            </span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Controls */}
      <div className="flex items-center justify-between text-xs text-[#52676B] px-1">
        <span>15 Seções Estruturadas</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => expandirTodas(true)}
            className="hover:text-[#176B73] font-medium"
          >
            Expandir Todas
          </button>
          <span aria-hidden="true">·</span>
          <button
            onClick={() => expandirTodas(false)}
            className="hover:text-[#176B73] font-medium"
          >
            Recolher Todas
          </button>
        </div>
      </div>

      {/* 15 Collapsible Sections */}
      <div className="space-y-4">
        {listaSecoes.map((item) => {
          const secao = (anamnese as any)[item.chave] as SecaoAnamnese;
          const aberta = secoesAbertas[item.chave as string];

          return (
            <div
              key={item.chave}
              className="bg-white rounded-2xl border border-[#EEF5F4] overflow-hidden transition-all shadow-xs"
            >
              {/* Section Header Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleSecao(item.chave as string)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-[#F7FAFA] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#183238]">{item.titulo}</span>
                  {item.sensivel && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                      Dado Sensível
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[#52676B]">
                  {secao?.relatoFamilia && (
                    <span className="hidden sm:inline text-[11px] text-[#5c8f78]">Preenchido</span>
                  )}
                  {aberta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Collapsible Body */}
              {aberta && (
                <div className="p-5 pt-0 border-t border-[#EEF5F4] bg-[#F7FAFA]/40 space-y-4">
                  {item.sensivel && (
                    <div className="bg-amber-50 dark:bg-[#1a1612] border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>
                        Informações de saúde e medicamentos exigem especial zelo e minimização de exposição.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#176B73] mb-1">
                      Relato dos Responsáveis / Família
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Descreva o que a família relatou espontaneamente a respeito deste tópico..."
                      value={secao?.relatoFamilia || ''}
                      onChange={(e) => atualizarSecao(item.chave, 'relatoFamilia', e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-white focus:outline-hidden focus:border-[#238B8D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#8B7BB5] mb-1">
                      Observação Técnica do Profissional
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Observações diretas, atitudes e comportamentos observados durante a entrevista..."
                      value={secao?.observacaoProfissional || ''}
                      onChange={(e) => atualizarSecao(item.chave, 'observacaoProfissional', e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-white focus:outline-hidden focus:border-[#8B7BB5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6FA58B] mb-1">
                      Hipótese de Trabalho ou Ponto de Investigação
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Questões a serem investigadas nas próximas sessões de testagem e mediação..."
                      value={secao?.hipoteseTrabalho || ''}
                      onChange={(e) => atualizarSecao(item.chave, 'hipoteseTrabalho', e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-white focus:outline-hidden focus:border-[#6FA58B]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Seção 15: Documentos e Encaminhamentos */}
        <div className="bg-white rounded-2xl border border-[#EEF5F4] p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#183238]">
            <FileSpreadsheet className="w-4 h-4 text-[#176B73]" />
            <span>15. Documentos e Encaminhamentos Recebidos (Demonstrativo)</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#183238]">
              Anotações sobre relatórios de terceiros ou encaminhamentos médicos/escolares
            </label>
            <textarea
              rows={3}
              placeholder="Descreva laudos, pareceres escolares ou relatórios fonoaudiológicos demonstrativos consultados..."
              value={anamnese.documentosEncaminhamentos?.anotacoes || ''}
              onChange={(e) => {
                const updated = {
                  ...anamnese,
                  documentosEncaminhamentos: {
                    ...anamnese.documentosEncaminhamentos,
                    anotacoes: e.target.value,
                  },
                };
                setAnamnese(updated);
                salvarComAutosave(updated);
              }}
              className="w-full text-xs p-3 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save & Finalize Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-4">
        <div className="text-xs text-[#52676B] dark:text-slate-400">
          Status atual: <strong className="text-[#183238] dark:text-white uppercase">{anamnese.status}</strong>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalExcluirAberto(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5 min-h-[44px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Anamnese</span>
          </button>
          <button
            onClick={() => handleSalvarManual('revisado')}
            className="px-4 py-2 text-xs font-semibold text-[#176B73] dark:text-[#00E5FF] bg-[#EEF5F4] dark:bg-[#182633] hover:bg-[#d4ecec] dark:hover:bg-[#203444] rounded-xl transition-colors min-h-[44px]"
          >
            Salvar como Revisado
          </button>
          <button
            onClick={() => handleSalvarManual('finalizado')}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] dark:bg-[#008B94] dark:hover:bg-[#00A3AD] rounded-xl shadow-xs transition-colors min-h-[44px]"
          >
            Finalizar Anamnese
          </button>
        </div>
      </div>

      {/* Modal de Exclusão de Anamnese */}
      <ConfirmModal
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        onConfirm={handleConfirmarExcluirAnamnese}
        tipo="excluir"
        titulo="Excluir Anamnese Psicopedagógica"
        itemIdentificador={`Anamnese de ${aprendente?.nomeCompleto || ''}`}
        mensagemExtra="Os dados deste formulário serão transferidos para a lixeira de segurança e poderão ser restaurados nas Configurações se necessário."
      />
    </div>
  );
};
