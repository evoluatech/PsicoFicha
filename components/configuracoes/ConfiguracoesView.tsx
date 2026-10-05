'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  UserCheck,
  Bell,
  Printer,
  Moon,
  Sun,
  Monitor,
  Check,
  Save,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  Database,
  ShieldCheck,
  Mail,
  UserPlus,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  FileJson,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { ConfiguracoesApp } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { showToast } from '@/components/ui/ToastContainer';
import { useTheme } from '@/hooks/use-theme';
import { useFirebase } from '@/components/firebase/FirebaseProvider';

interface ConfiguracoesViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = () => {
  const { setTheme: setAppTheme, themePreference } = useTheme();
  const {
    user,
    loading: firebaseLoading,
    connected: firebaseConnected,
    syncing,
    lastSynced,
    openAuthModal,
    signInWithGoogle,
    signOut,
    syncAllToCloud,
    reloadFromCloud,
  } = useFirebase();
  const [config, setConfig] = useState<ConfiguracoesApp>(storage.getConfiguracoes());

  // Dados do profissional
  const [nomeProfissional, setNomeProfissional] = useState('Dra. Gabriela Andrade');
  const [registroProfissional, setRegistroProfissional] = useState('ABPp 14.892/SP');
  const [instituicao, setInstituicao] = useState('Consultório Psicopedagógico Aprender');
  const [cidade, setCidade] = useState('São Paulo - SP');
  const [especialidade, setEspecialidade] = useState('Psicopedagogia Clínica & Institucional');
  const [telefone, setTelefone] = useState('(11) 98765-4321');
  const [storageUsage, setStorageUsage] = useState({ usadoKb: 0, percentualEstimado: 0 });
  const [lixeira, setLixeira] = useState<Array<{ tipo: string; id: string; titulo: string; removidoEm: string }>>([]);

  const carregarDadosSeguranca = () => {
    setStorageUsage(storage.getStorageUsage());
    setLixeira(storage.getLixeira());
  };

  useEffect(() => {
    const atual = storage.getConfiguracoes();
    setConfig(atual);
    carregarDadosSeguranca();

    // Carregar dados salvos do profissional
    const prof = storage.getProfissional();
    if (prof) {
      if (prof.nome) setNomeProfissional(prof.nome);
      if (prof.registro) setRegistroProfissional(prof.registro);
      if (prof.instituicao) setInstituicao(prof.instituicao);
      if (prof.cidade) setCidade(prof.cidade);
      if (prof.especialidade) setEspecialidade(prof.especialidade);
      if (prof.telefone) setTelefone(prof.telefone);
    }
  }, []);

  const handleExportarBackup = () => {
    try {
      const json = storage.exportarBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dataIso = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `psicoficha_backup_completo_${dataIso}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Cópia de segurança JSON exportada com sucesso!', 'sucesso');
    } catch {
      showToast('Erro ao exportar backup de dados.', 'erro');
    }
  };

  const handleImportarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      if (!conteudo) return;
      const ok = storage.importarBackupJson(conteudo);
      if (ok) {
        carregarDadosSeguranca();
        showToast('Backup importado com sucesso! Todos os prontuários foram restaurados.', 'sucesso');
      } else {
        showToast('Arquivo JSON de backup inválido ou corrompido.', 'erro');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestaurarDaLixeira = (id: string, titulo: string) => {
    const ok = storage.restoreFromLixeira(id);
    if (ok) {
      carregarDadosSeguranca();
      showToast(`"${titulo}" restaurado com sucesso!`, 'sucesso');
    } else {
      showToast('Não foi possível restaurar o item.', 'erro');
    }
  };

  const handleEsvaziarLixeira = () => {
    storage.emptyLixeira();
    carregarDadosSeguranca();
    showToast('Lixeira esvaziada com sucesso.', 'info');
  };

  const handleRestaurarDemonstracao = () => {
    if (window.confirm('Deseja recarregar os dados demonstrativos padrão da clínica? Dados locais não sincronizados serão substituídos.')) {
      storage.restaurarDadosDemonstracao();
      carregarDadosSeguranca();
      showToast('Dados de demonstração restaurados com sucesso!', 'sucesso');
    }
  };

  const handleSalvarConfig = (campo: keyof ConfiguracoesApp, valor: any) => {
    if (campo === 'tema') {
      setAppTheme(valor);
    }
    const atualizada = { ...config, [campo]: valor };
    storage.saveConfiguracoes(atualizada);
    setConfig(atualizada);
    showToast('Preferência atualizada com sucesso!', 'sucesso');
  };

  const handleSalvarProfissional = (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      nome: nomeProfissional.trim(),
      registro: registroProfissional.trim(),
      instituicao: instituicao.trim(),
      cidade: cidade.trim(),
      especialidade: especialidade.trim(),
      telefone: telefone.trim(),
    };
    try {
      storage.saveProfissional(dados);
      showToast(
        user
          ? 'Dados do profissional salvos e sincronizados com a nuvem!'
          : 'Dados do profissional salvos com sucesso localmente!',
        'sucesso'
      );
    } catch {
      showToast('Erro ao salvar dados do profissional.', 'erro');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          Personalize a aparência, notificações e dados para emissão de documentos.
        </p>
      </div>

      {/* 1. Tema e Aparência Visual */}
      <div className="rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors bg-white dark:bg-[#121c25] border-slate-200 dark:border-[#1e2d3b] shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#007a82] dark:text-[#00E5FF]" />
          <span>Tema & Conforto Visual</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Claro */}
          <button
            onClick={() => handleSalvarConfig('tema', 'claro')}
            className={`p-3.5 rounded-xl border flex flex-col items-start gap-2 transition-all text-left ${
              themePreference === 'claro'
                ? 'border-[#008B94] bg-teal-50 text-[#007a82] font-bold shadow-xs ring-1 ring-[#008B94]'
                : 'border-slate-200 dark:border-[#223544] bg-white dark:bg-[#0e1720] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white">Tema Claro</span>
              </div>
              {themePreference === 'claro' && <Check className="w-3.5 h-3.5 text-[#008B94]" />}
            </div>
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
              Tons suaves e ergonômicos para leitura prolongada.
            </span>
          </button>

          {/* Escuro */}
          <button
            onClick={() => handleSalvarConfig('tema', 'escuro')}
            className={`p-3.5 rounded-xl border flex flex-col items-start gap-2 transition-all text-left ${
              themePreference === 'escuro'
                ? 'border-[#00E5FF] bg-[#14232c] text-[#00E5FF] font-bold shadow-xs ring-1 ring-[#00E5FF]'
                : 'border-slate-200 dark:border-[#223544] bg-white dark:bg-[#0e1720] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#00E5FF]" />
                <span className="font-bold text-[#007a82] dark:text-[#00E5FF]">Tema Escuro</span>
              </div>
              {themePreference === 'escuro' && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
            </div>
            <span className="text-[11px] font-normal text-slate-600 dark:text-[#a5f3fc]/90 leading-relaxed">
              Obsidiana e ciano elétrico para descanso visual.
            </span>
          </button>

          {/* Sistema */}
          <button
            onClick={() => handleSalvarConfig('tema', 'sistema')}
            className={`p-3.5 rounded-xl border flex flex-col items-start gap-2 transition-all text-left ${
              themePreference === 'sistema'
                ? 'border-[#008B94] dark:border-[#00E5FF] bg-teal-50 dark:bg-[#14232c] text-[#007a82] dark:text-[#00E5FF] font-bold shadow-xs ring-1 ring-[#008B94] dark:ring-[#00E5FF]'
                : 'border-slate-200 dark:border-[#223544] bg-white dark:bg-[#0e1720] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#008B94] dark:text-[#00E5FF]" />
                <span className="font-bold text-slate-900 dark:text-white">Automático</span>
              </div>
              {themePreference === 'sistema' && <Check className="w-3.5 h-3.5 text-[#008B94] dark:text-[#00E5FF]" />}
            </div>
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
              Acompanha o padrão configurado no seu aparelho.
            </span>
          </button>
        </div>

        {/* Tamanho da Fonte */}
        <div className="pt-3 border-t border-slate-200 dark:border-[#1e2d3b] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">Tamanho da Fonte</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Escala de leitura para formulários e fichas</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { val: 'padrao', label: 'Padrão' },
              { val: 'grande', label: 'Grande' },
              { val: 'maior', label: 'Maior' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => handleSalvarConfig('tamanhoFonte', f.val)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  config.tamanhoFonte === f.val
                    ? 'bg-teal-50 text-[#007a82] border-[#008B94] font-bold dark:bg-[#182633] dark:text-[#00E5FF] dark:border-[#00E5FF]'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e1720] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Dados do Profissional (para Relatórios e Impressões) */}
      <div className="rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors bg-white dark:bg-[#121c25] border-slate-200 dark:border-[#1e2d3b] shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-[#00E5FF]" />
            <span>Identificação Profissional</span>
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Aparece no cabeçalho e assinaturas</span>
        </div>

        <form onSubmit={handleSalvarProfissional} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Nome Completo do Profissional
              </label>
              <input
                type="text"
                value={nomeProfissional}
                onChange={(e) => setNomeProfissional(e.target.value)}
                placeholder="Ex: Dra. Gabriela Andrade"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Registro Profissional (ABPp / CRP)
              </label>
              <input
                type="text"
                value={registroProfissional}
                onChange={(e) => setRegistroProfissional(e.target.value)}
                placeholder="Ex: ABPp 14.892/SP"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Consultório / Instituição
              </label>
              <input
                type="text"
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                placeholder="Ex: Espaço Psicopedagógico Florescer"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Cidade / UF
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Especialidade Principal
              </label>
              <input
                type="text"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                placeholder="Ex: Psicopedagogia Clínica & Neuropsicopedagogia"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Telefone / Contato para Documentos
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0e1720] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] dark:hover:bg-[#38edff] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Dados do Profissional</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Notificações e Documentos */}
      <div className="rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors bg-white dark:bg-[#121c25] border-slate-200 dark:border-[#1e2d3b] shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Lembretes & Impressão</span>
        </h2>

        <div className="space-y-3 text-xs">
          {/* Alertas Sonoros */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200/80 dark:border-[#1e2d3b]">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Alertas Sonoros de Consultas
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                Emitir aviso sonoro no horário agendado de atendimentos
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSalvarConfig('somAtivo', !config.somAtivo)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                config.somAtivo ? 'bg-[#008B94] dark:bg-[#00E5FF]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                  config.somAtivo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Ocultar vazios em PDF */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                Ocultar Campos Não Preenchidos em Relatórios
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                Gera documentos mais compactos no PDF omitindo tópicos em branco
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                handleSalvarConfig('ocultarCamposVaziosImpressao', !config.ocultarCamposVaziosImpressao)
              }
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden ${
                config.ocultarCamposVaziosImpressao
                  ? 'bg-[#008B94] dark:bg-[#00E5FF]'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                  config.ocultarCamposVaziosImpressao ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Sincronização em Nuvem & Backup Seguro */}
      <div className="rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors bg-white dark:bg-[#121c25] border-slate-200 dark:border-[#1e2d3b] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#008B94] dark:text-[#00E5FF]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Sincronização em Nuvem &amp; Backup Seguro
            </h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              firebaseConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                firebaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {firebaseConnected ? 'Nuvem Conectada' : 'Serviço Offline'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          O Psicoficha conta com sincronização segura e contínua em nuvem com regras rigorosas de controle de acesso. Todos os dados clínicos e prontuários permanecem confidenciais, protegidos por criptografia e acessíveis exclusivamente na sua conta profissional.
        </p>

        {user ? (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0b1015] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-[#00E5FF]/20 text-[#008B94] dark:text-[#00E5FF] font-bold flex items-center justify-center text-sm border border-teal-200 dark:border-[#00E5FF]/40 shrink-0">
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : (user.email?.slice(0, 2).toUpperCase() || 'US')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {user.displayName || 'Profissional Conectado'}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-teal-50 dark:bg-[#00E5FF]/10 text-[#008B94] dark:text-[#00E5FF] border border-teal-200/60 dark:border-[#00E5FF]/20">
                      {user.providerData?.some((p) => p.providerId === 'google.com')
                        ? 'Google / Gmail'
                        : 'E-mail / Senha'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  showToast('Sessão encerrada com sucesso.', 'info');
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-[#1a2632] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-[#1e2d3b] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#008B94] dark:text-[#00E5FF]" />
                <span>
                  {lastSynced
                    ? `Última sincronização com a nuvem: hoje às ${lastSynced}`
                    : 'Pronto para sincronizar seus prontuários'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={syncing}
                  onClick={async () => {
                    const res = await reloadFromCloud();
                    if (res.success) {
                      showToast(`${res.count} registros carregados da nuvem!`, 'sucesso');
                    } else {
                      showToast(res.error || 'Erro ao carregar dados da nuvem.', 'erro');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200/80 hover:bg-slate-300 dark:bg-[#1f3040] dark:hover:bg-[#283e52] rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Recarregar prontuários da nuvem desta conta"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>Carregar da Nuvem</span>
                </button>

                <button
                  type="button"
                  disabled={syncing}
                  onClick={async () => {
                    const res = await syncAllToCloud();
                    if (res.success) {
                      showToast(`${res.count} registros sincronizados com a nuvem!`, 'sucesso');
                    } else {
                      showToast(res.error || 'Erro ao sincronizar.', 'erro');
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] dark:hover:bg-[#38edff] rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <Cloud className={`w-3.5 h-3.5 ${syncing ? 'animate-pulse' : ''}`} />
                  <span>{syncing ? 'Sincronizando...' : 'Sincronizar Prontuários Agora'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0b1015] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Sincronização em Nuvem Desconectada</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Conecte sua conta do Google (Gmail) ou entre com e-mail e senha para salvar prontuários com segurança na nuvem e sincronizar entre seus dispositivos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {/* Google / Gmail button */}
              <button
                type="button"
                disabled={firebaseLoading}
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                    showToast('Conectado à sua conta com sucesso!', 'sucesso');
                  } catch {
                    showToast('Não foi possível autenticar com o Google.', 'erro');
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-[#182633] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1e2f3f] rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Gmail</span>
              </button>

              {/* Email & Password button */}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] dark:hover:bg-[#38edff] rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Entrar com E-mail e Senha</span>
              </button>

              {/* Create account button */}
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#182633] transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#008B94] dark:text-[#00E5FF]" />
                <span>Criar Conta</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Segurança, Backup Local & Recuperação de Dados */}
      <div className="rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors bg-white dark:bg-[#121c25] border-slate-200 dark:border-[#1e2d3b] shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#008B94] dark:text-[#00E5FF]" />
            <span>Segurança de Dados, Backup &amp; Recuperação</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {storageUsage.usadoKb} KB usados (~{storageUsage.percentualEstimado}% do espaço seguro)
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Proteja seus prontuários e históricos clínicos contra perdas acidentais, limpeza de navegador ou troca de computador. Exporte arquivos de backup em JSON ou restaure prontuários a qualquer momento.
        </p>

        {/* Action Buttons: Exportar e Importar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportarBackup}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0b1015] hover:bg-slate-100 dark:hover:bg-[#16232e] text-slate-800 dark:text-white transition-all flex items-center gap-3 text-left shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-[#00E5FF]/20 text-[#008B94] dark:text-[#00E5FF] flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-900 dark:text-white">Exportar Cópia Completa (JSON)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Baixar arquivo de segurança de todos os pacientes</span>
            </div>
          </button>

          <label className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0b1015] hover:bg-slate-100 dark:hover:bg-[#16232e] text-slate-800 dark:text-white transition-all flex items-center gap-3 cursor-pointer shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-900 dark:text-white">Restaurar Cópia (Importar JSON)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Recarregar dados a partir de arquivo salvo</span>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportarArquivo}
              className="hidden"
            />
          </label>
        </div>

        {/* Lixeira & Recuperação de Excluídos */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-[#1e2d3b] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Lixeira de Segurança (Anti-Exclusão Acidental)</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Itens removidos ficam preservados aqui e podem ser recuperados com 1 clique.
              </p>
            </div>
            {lixeira.length > 0 && (
              <button
                type="button"
                onClick={handleEsvaziarLixeira}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Esvaziar Lixeira
              </button>
            )}
          </div>

          {lixeira.length === 0 ? (
            <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-[#0b1015] text-[11px] text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-[#1e2d3b]">
              Nenhum registro na lixeira. Todos os prontuários e relatórios estão ativos.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lixeira.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0b1015] text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-slate-900 dark:text-white truncate block">
                      {item.titulo}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      Tipo: {item.tipo} · Excluído em: {new Date(item.removidoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestaurarDaLixeira(item.id, item.titulo)}
                    className="px-2.5 py-1 text-xs font-semibold text-[#008B94] dark:text-[#00E5FF] hover:bg-teal-50 dark:hover:bg-[#182633] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reset Demo Data */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-[#1e2d3b] flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Recarregar Dados Demonstrativos</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Restaura fichas e relatórios padrão de exemplo da clínica</span>
          </div>
          <button
            type="button"
            onClick={handleRestaurarDemonstracao}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#182633] hover:bg-slate-200 dark:hover:bg-[#203444] rounded-xl transition-colors"
          >
            Restaurar Demo
          </button>
        </div>
      </div>
    </div>
  );
};
