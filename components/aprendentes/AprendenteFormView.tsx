'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ShieldAlert,
  Save,
  School,
  UserCheck
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { Aprendente, Responsavel, ContextoEscolar, StatusAprendente } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AprendenteFormViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
  editId?: string;
}

export const AprendenteFormView: React.FC<AprendenteFormViewProps> = ({
  onNavigate,
  editId,
}) => {
  const [etapaAtual, setEtapaAtual] = useState<1 | 2 | 3>(1);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Form State
  const [codigoInterno, setCodigoInterno] = useState(`AP-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeSocial, setNomeSocial] = useState('');
  const [dataNascimento, setDataNascimento] = useState('2018-05-10');
  const [idadeCalculada, setIdadeCalculada] = useState(7);
  const [pronome, setPronome] = useState('Ele/Dele');
  const [contatoPreferencial, setContatoPreferencial] = useState('');
  const [cidadeUf, setCidadeUf] = useState('São Paulo/SP');
  const [status, setStatus] = useState<StatusAprendente>('avaliacao');
  const [notasInternas, setNotasInternas] = useState('');

  // Responsaveis
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([
    {
      id: 'resp-temp-1',
      nomeCompleto: '',
      parentesco: 'Mãe',
      responsavelLegal: true,
      telefone: '',
      email: '',
      melhorContato: 'WhatsApp no período da tarde',
      autorizacaoConsentimento: {
        status: 'autorizado',
        dataAutorizacao: new Date().toISOString().split('T')[0],
        observacao: 'Consentimento livre e informado registrado.',
      },
    },
  ]);

  // Contexto Escolar
  const [contextoEscolar, setContextoEscolar] = useState<ContextoEscolar>({
    instituicao: '',
    etapaAno: '',
    turno: 'Matutino',
    contatoEscolar: '',
    demandasEscolares: '',
    adaptacoesApoios: '',
  });

  // Calculate age automatically from birthdate
  useEffect(() => {
    if (!dataNascimento) return;
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    setIdadeCalculada(Math.max(0, idade));
  }, [dataNascimento]);

  // Load if editing
  useEffect(() => {
    if (editId) {
      const existing = storage.getAprendenteById(editId);
      if (existing) {
        setCodigoInterno(existing.codigoInterno);
        setNomeCompleto(existing.nomeCompleto);
        setNomeSocial(existing.nomeSocial || '');
        setDataNascimento(existing.dataNascimento);
        setIdadeCalculada(existing.idadeCalculada);
        setPronome(existing.pronome || '');
        setContatoPreferencial(existing.contatoPreferencial);
        setCidadeUf(existing.cidadeUf);
        setStatus(existing.status);
        setNotasInternas(existing.notasInternas || '');
        setResponsaveis(existing.paisResponsaveis);
        setContextoEscolar(existing.contextoEscolar);
      }
    }
  }, [editId]);

  const validarEtapa1 = () => {
    const errs: Record<string, string> = {};
    if (!nomeCompleto.trim()) errs.nomeCompleto = 'Informe o nome completo do aprendente.';
    if (!dataNascimento) errs.dataNascimento = 'Informe a data de nascimento.';
    if (!contatoPreferencial.trim()) errs.contatoPreferencial = 'Informe um contato preferencial.';
    setErros(errs);
    return Object.keys(errs).length === 0;
  };

  const validarEtapa2 = () => {
    const errs: Record<string, string> = {};
    if (responsaveis.length === 0) {
      errs.responsaveis = 'Adicione pelo menos um responsável.';
    } else {
      responsaveis.forEach((r, idx) => {
        if (!r.nomeCompleto.trim()) {
          errs[`resp_${idx}_nome`] = `Informe o nome do responsável ${idx + 1}.`;
        }
        if (!r.telefone.trim()) {
          errs[`resp_${idx}_tel`] = `Informe o telefone do responsável ${idx + 1}.`;
        }
      });
    }
    setErros(errs);
    return Object.keys(errs).length === 0;
  };

  const validarEtapa3 = () => {
    const errs: Record<string, string> = {};
    if (!contextoEscolar.instituicao.trim()) {
      errs.instituicao = 'Informe a instituição de ensino.';
    }
    if (!contextoEscolar.etapaAno.trim()) {
      errs.etapaAno = 'Informe a etapa/ano escolar.';
    }
    setErros(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAvancar = () => {
    if (etapaAtual === 1 && validarEtapa1()) {
      setEtapaAtual(2);
    } else if (etapaAtual === 2 && validarEtapa2()) {
      setEtapaAtual(3);
    }
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarEtapa1() || !validarEtapa2() || !validarEtapa3()) {
      showToast('Por favor, revise os campos obrigatórios com pendências.', 'aviso');
      return;
    }

    const novoAprendente: Aprendente = {
      id: editId || `apr-${Date.now()}`,
      codigoInterno,
      nomeCompleto: nomeCompleto.trim(),
      nomeSocial: nomeSocial.trim() || undefined,
      dataNascimento,
      idadeCalculada,
      pronome: pronome.trim() || undefined,
      contatoPreferencial: contatoPreferencial.trim(),
      cidadeUf: cidadeUf.trim(),
      status,
      paisResponsaveis: responsaveis,
      contextoEscolar,
      notasInternas: notasInternas.trim() || undefined,
      criadoEm: editId ? storage.getAprendenteById(editId)?.criadoEm || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      atualizadoEm: new Date().toISOString().split('T')[0],
    };

    storage.saveAprendente(novoAprendente);
    showToast(`Aprendente ${novoAprendente.nomeCompleto} salvo com sucesso!`, 'sucesso');
    onNavigate('aprendente-detalhe', { id: novoAprendente.id });
  };

  const adicionarResponsavel = () => {
    setResponsaveis([
      ...responsaveis,
      {
        id: `resp-${Date.now()}`,
        nomeCompleto: '',
        parentesco: 'Pai',
        responsavelLegal: false,
        telefone: '',
        email: '',
        melhorContato: 'Telefone ou mensagem',
        autorizacaoConsentimento: {
          status: 'autorizado',
          dataAutorizacao: new Date().toISOString().split('T')[0],
          observacao: 'Autorização informada.',
        },
      },
    ]);
  };

  const removerResponsavel = (index: number) => {
    if (responsaveis.length <= 1) {
      showToast('O aprendente deve possuir ao menos um responsável cadastrado.', 'aviso');
      return;
    }
    setResponsaveis(responsaveis.filter((_, idx) => idx !== index));
  };

  const handleConfirmarExcluirAprendente = () => {
    if (!editId) return;
    storage.deleteAprendente(editId);
    showToast('Aprendente transferido para a lixeira.', 'info');
    onNavigate('aprendentes');
  };

  const atualizarResponsavel = (index: number, campo: keyof Responsavel, valor: any) => {
    const list = [...responsaveis];
    list[index] = { ...list[index], [campo]: valor };
    setResponsaveis(list);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button
            onClick={() => onNavigate('aprendentes')}
            className="text-xs font-semibold text-[#176B73] hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Aprendentes</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#183238] dark:text-white">
            {editId ? 'Editar Cadastro do Aprendente' : 'Novo Cadastro de Aprendente'}
          </h1>
          <p className="text-xs text-[#52676B] dark:text-slate-400">
            Registro estruturado em 3 etapas com foco em acolhimento e dados essenciais.
          </p>
        </div>

        {editId && (
          <button
            type="button"
            onClick={() => setModalExcluirAberto(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors min-h-[40px] flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Aprendente</span>
          </button>
        )}
      </div>

      {/* Stepper Header */}
      <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-4 transition-colors">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button
            type="button"
            onClick={() => setEtapaAtual(1)}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all ${
              etapaAtual === 1
                ? 'bg-[#EEF5F4] dark:bg-[#1e2d3b] text-[#176B73] dark:text-[#00E5FF] font-bold shadow-xs'
                : 'text-[#52676B] dark:text-[#8da4ac] hover:bg-neutral-50 dark:hover:bg-[#182633]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#176B73] text-white text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            <span className="hidden sm:inline">Identificação</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validarEtapa1()) setEtapaAtual(2);
            }}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all ${
              etapaAtual === 2
                ? 'bg-[#EEF5F4] dark:bg-[#1e2d3b] text-[#176B73] dark:text-[#00E5FF] font-bold shadow-xs'
                : 'text-[#52676B] dark:text-[#8da4ac] hover:bg-neutral-50 dark:hover:bg-[#182633]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#8B7BB5] text-white text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            <span className="hidden sm:inline">Pais & Responsáveis</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validarEtapa1() && validarEtapa2()) setEtapaAtual(3);
            }}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all ${
              etapaAtual === 3
                ? 'bg-[#EEF5F4] dark:bg-[#1e2d3b] text-[#176B73] dark:text-[#00E5FF] font-bold shadow-xs'
                : 'text-[#52676B] dark:text-[#8da4ac] hover:bg-neutral-50 dark:hover:bg-[#182633]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#6FA58B] text-white text-[11px] font-bold flex items-center justify-center">
              3
            </span>
            <span className="hidden sm:inline">Contexto Escolar</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSalvar} className="space-y-6">
        {/* ETAPA 1: Identificação */}
        {etapaAtual === 1 && (
          <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-6 space-y-5 animate-in fade-in duration-150 transition-colors">
            <div className="flex items-center gap-2 border-b border-[#EEF5F4] dark:border-[#1e2d3b] pb-3">
              <Users className="w-4 h-4 text-[#176B73] dark:text-[#00E5FF]" />
              <h2 className="text-sm font-bold text-[#183238] dark:text-white">Etapa A — Identificação do Aprendente</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Clara Albuquerque Santos"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] ${
                    erros.nomeCompleto ? 'border-[#B54747]' : 'border-[#EEF5F4] dark:border-[#1e2d3b]'
                  } focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]`}
                />
                {erros.nomeCompleto && (
                  <p className="text-[11px] text-[#B54747] mt-1">{erros.nomeCompleto}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Nome Social (se aplicável)
                </label>
                <input
                  type="text"
                  placeholder="Nome pelo qual prefere ser chamado(a)"
                  value={nomeSocial}
                  onChange={(e) => setNomeSocial(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                />
                <span className="text-[11px] text-[#52676B] dark:text-[#8da4ac] mt-1 block">
                  Idade calculada automaticamente: <strong className="text-[#183238] dark:text-white">{idadeCalculada} anos</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Pronome (opcional)
                </label>
                <select
                  value={pronome}
                  onChange={(e) => setPronome(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                >
                  <option value="Ela/Dela">Ela/Dela</option>
                  <option value="Ele/Dele">Ele/Dele</option>
                  <option value="Elu/Delu">Elu/Delu</option>
                  <option value="Outro/Não especificado">Outro / Não especificado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Código Interno Demonstrativo
                </label>
                <input
                  type="text"
                  value={codigoInterno}
                  onChange={(e) => setCodigoInterno(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white font-mono focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Contato Preferencial *
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={contatoPreferencial}
                  onChange={(e) => setContatoPreferencial(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] ${
                    erros.contatoPreferencial ? 'border-[#B54747]' : 'border-[#EEF5F4] dark:border-[#1e2d3b]'
                  } focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]`}
                />
                {erros.contatoPreferencial && (
                  <p className="text-[11px] text-[#B54747] mt-1">{erros.contatoPreferencial}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Cidade / UF
                </label>
                <input
                  type="text"
                  placeholder="São Paulo/SP"
                  value={cidadeUf}
                  onChange={(e) => setCidadeUf(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Etapa do Acompanhamento
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusAprendente)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                >
                  <option value="avaliacao">Avaliação Inicial</option>
                  <option value="acompanhamento">Em Acompanhamento Contínuo</option>
                  <option value="pausado">Atendimento Pausado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                Notas Iniciais do Acolhimento (Interno ao Profissional)
              </label>
              <textarea
                rows={2}
                placeholder="Anotações preliminares sobre a primeira acolhida ou impressões profissionais..."
                value={notasInternas}
                onChange={(e) => setNotasInternas(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
              />
            </div>
          </div>
        )}

        {/* ETAPA 2: Pais e Responsáveis */}
        {etapaAtual === 2 && (
          <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-6 space-y-5 animate-in fade-in duration-150 transition-colors">
            <div className="flex items-center justify-between border-b border-[#EEF5F4] dark:border-[#1e2d3b] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#8B7BB5] dark:text-[#a78bfa]" />
                <h2 className="text-sm font-bold text-[#183238] dark:text-white">Etapa B — Núcleo Familiar e Responsáveis</h2>
              </div>
              <button
                type="button"
                onClick={adicionarResponsavel}
                className="text-xs font-semibold text-[#176B73] dark:text-[#00E5FF] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Mais um Responsável</span>
              </button>
            </div>

            {/* Minimização LGPD Banner — Escuro no tema Dark */}
            <div className="bg-[#f0f8f8] dark:bg-[#0c1822] border border-[#d4ecec] dark:border-[#193240] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#183238] dark:text-[#a0c0c6] transition-colors">
              <ShieldAlert className="w-4 h-4 text-[#176B73] dark:text-[#00E5FF] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#183238] dark:text-white">Minimização de Dados:</strong> Colete apenas os contatos estritamente necessários para a condução do acompanhamento psicopedagógico e comunicações de emergência.
              </p>
            </div>

            {responsaveis.map((resp, idx) => (
              <div key={resp.id} className="p-4 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#176B73] dark:text-[#00E5FF]">
                    Responsável #{idx + 1}
                  </span>
                  {responsaveis.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerResponsavel(idx)}
                      className="text-xs text-[#B54747] dark:text-[#f87171] hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                      Nome Completo do Responsável *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mariana Duarte"
                      value={resp.nomeCompleto}
                      onChange={(e) => atualizarResponsavel(idx, 'nomeCompleto', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#121c25] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                    />
                    {erros[`resp_${idx}_nome`] && (
                      <p className="text-[11px] text-[#B54747] mt-1">{erros[`resp_${idx}_nome`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                      Parentesco ou Relação
                    </label>
                    <select
                      value={resp.parentesco}
                      onChange={(e) => atualizarResponsavel(idx, 'parentesco', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#121c25] text-[#183238] dark:text-white focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                    >
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Avó/Avô">Avó / Avô</option>
                      <option value="Tio/Tia">Tio / Tia</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={resp.telefone}
                      onChange={(e) => atualizarResponsavel(idx, 'telefone', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#121c25] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                    />
                    {erros[`resp_${idx}_tel`] && (
                      <p className="text-[11px] text-[#B54747] mt-1">{erros[`resp_${idx}_tel`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      placeholder="responsavel@exemplo.com"
                      value={resp.email}
                      onChange={(e) => atualizarResponsavel(idx, 'email', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#121c25] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                      Melhor forma e horário de contato
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: WhatsApp após as 17h, preferencialmente terças e quintas"
                      value={resp.melhorContato}
                      onChange={(e) => atualizarResponsavel(idx, 'melhorContato', e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-white dark:bg-[#121c25] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`legal_${idx}`}
                      checked={resp.responsavelLegal}
                      onChange={(e) => atualizarResponsavel(idx, 'responsavelLegal', e.target.checked)}
                      className="rounded text-[#176B73] focus:ring-[#238B8D]"
                    />
                    <label htmlFor={`legal_${idx}`} className="text-xs text-[#183238] dark:text-[#c4e8eb] cursor-pointer">
                      Este responsável possui autoridade legal para assinatura de consentimentos e decisões pedagógicas.
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ETAPA 3: Contexto Escolar */}
        {etapaAtual === 3 && (
          <div className="bg-white dark:bg-[#121c25] rounded-2xl border border-[#EEF5F4] dark:border-[#1e2d3b] p-6 space-y-5 animate-in fade-in duration-150 transition-colors">
            <div className="flex items-center gap-2 border-b border-[#EEF5F4] dark:border-[#1e2d3b] pb-3">
              <School className="w-4 h-4 text-[#6FA58B] dark:text-[#34d399]" />
              <h2 className="text-sm font-bold text-[#183238] dark:text-white">Etapa C — Contexto Escolar e Apoios</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Instituição de Ensino *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Escola Estadual Machado de Assis"
                  value={contextoEscolar.instituicao}
                  onChange={(e) => setContextoEscolar({ ...contextoEscolar, instituicao: e.target.value })}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] ${
                    erros.instituicao ? 'border-[#B54747]' : 'border-[#EEF5F4] dark:border-[#1e2d3b]'
                  } focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]`}
                />
                {erros.instituicao && (
                  <p className="text-[11px] text-[#B54747] mt-1">{erros.instituicao}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Etapa / Ano Escolar *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 3º ano do Ensino Fundamental I"
                  value={contextoEscolar.etapaAno}
                  onChange={(e) => setContextoEscolar({ ...contextoEscolar, etapaAno: e.target.value })}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] ${
                    erros.etapaAno ? 'border-[#B54747]' : 'border-[#EEF5F4] dark:border-[#1e2d3b]'
                  } focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]`}
                />
                {erros.etapaAno && (
                  <p className="text-[11px] text-[#B54747] mt-1">{erros.etapaAno}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Turno
                </label>
                <select
                  value={contextoEscolar.turno}
                  onChange={(e) => setContextoEscolar({ ...contextoEscolar, turno: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                >
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Integral">Integral</option>
                  <option value="Noturno">Noturno</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Professor(a) ou Contato Escolar
                </label>
                <input
                  type="text"
                  placeholder="Ex: Profª Tatiana (Coordenação)"
                  value={contextoEscolar.contatoEscolar || ''}
                  onChange={(e) => setContextoEscolar({ ...contextoEscolar, contatoEscolar: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Demandas Observadas no Contexto Escolar
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva observações relatadas pela escola (atenção, socialização, ritmo de escrita, tarefas)..."
                  value={contextoEscolar.demandasEscolares}
                  onChange={(e) => setContextoEscolar({ ...contextoEscolar, demandasEscolares: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#183238] dark:text-[#c4e8eb] mb-1">
                  Adaptações Pedagógicas ou Apoios já Utilizados
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tempo estendido em provas, assento à frente, material com apoio visual..."
                  value={contextoEscolar.adaptacoesApoios}
                  onChange={(e) => setContextoEscolar({ ...contextoEscolar, adaptacoesApoios: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EEF5F4] dark:border-[#1e2d3b] bg-[#F7FAFA] dark:bg-[#0c141c] text-[#183238] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#52676B] focus:outline-hidden focus:border-[#238B8D] dark:focus:border-[#00E5FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons in Wizard */}
        <div className="flex items-center justify-between pt-2">
          {etapaAtual > 1 ? (
            <button
              type="button"
              onClick={() => setEtapaAtual((prev) => (prev - 1) as 1 | 2)}
              className="px-4 py-2.5 text-xs font-semibold text-[#52676B] dark:text-[#8da4ac] hover:text-[#183238] dark:hover:text-white bg-white dark:bg-[#121c25] border border-[#EEF5F4] dark:border-[#1e2d3b] rounded-xl transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Etapa Anterior</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {etapaAtual < 3 ? (
              <button
                type="button"
                onClick={handleAvancar}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] dark:bg-[#008B94] dark:hover:bg-[#00A3AD] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[44px]"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] dark:bg-[#008B94] dark:hover:bg-[#00A3AD] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Cadastro do Aprendente</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Modal de Exclusão de Aprendente */}
      <ConfirmModal
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        onConfirm={handleConfirmarExcluirAprendente}
        tipo="excluir"
        titulo="Excluir Cadastro do Aprendente"
        itemIdentificador={nomeCompleto || 'Este aprendente'}
        mensagemExtra="O aprendente e seu histórico serão transferidos para a lixeira e poderão ser restaurados a qualquer momento caso necessário."
      />
    </div>
  );
};
