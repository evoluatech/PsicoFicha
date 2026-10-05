'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  User,
  MoreVertical,
  X,
  Play,
  RotateCcw,
  Sliders,
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { LembreteConsulta, TipoCompromisso, StatusLembrete, Aprendente, ConfiguracoesApp } from '@/types';
import { ActiveRoute } from '@/components/layout/AppShell';
import { notificationService, NotificationPermissionStatus } from '@/lib/notification-service';
import { audioAlert, SoundProfile } from '@/lib/audio-alert';
import { showToast } from '@/components/ui/ToastContainer';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface LembretesAgendaViewProps {
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
  targetId?: string;
}

export const LembretesAgendaView: React.FC<LembretesAgendaViewProps> = ({
  onNavigate,
  targetId,
}) => {
  const [lembretes, setLembretes] = useState<LembreteConsulta[]>([]);
  const [aprendentes, setAprendentes] = useState<Aprendente[]>([]);
  const [config, setConfig] = useState<ConfiguracoesApp>(storage.getConfiguracoes());
  const [permissaoStatus, setPermissaoStatus] = useState<NotificationPermissionStatus>('default');
  const [modoVisualizacao, setModoVisualizacao] = useState<'lista' | 'dia' | 'semana'>('lista');
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [lembreteEditando, setLembreteEditando] = useState<LembreteConsulta | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [modalExcluir, setModalExcluir] = useState<{ aberto: boolean; lembrete?: LembreteConsulta }>({ aberto: false });
  const [hojeStr, setHojeStr] = useState<string>('');

  // Form State
  const [aprendenteId, setAprendenteId] = useState('');
  const [tipoCompromisso, setTipoCompromisso] = useState<TipoCompromisso>('sessao_individual');
  const [data, setData] = useState('2026-03-30');
  const [horarioInicio, setHorarioInicio] = useState('14:30');
  const [duracaoMinutos, setDuracaoMinutos] = useState(50);
  const [modalidade, setModalidade] = useState<'presencial' | 'online'>('presencial');
  const [local, setLocal] = useState('Consultório Principal - Sala A');
  const [observacoes, setObservacoes] = useState('');
  const [recorrencia, setRecorrencia] = useState<'nenhuma' | 'semanal' | 'quinzenal' | 'mensal'>('nenhuma');
  const [alertas, setAlertas] = useState<number[]>([15, 60]); // minutos antes

  const carregar = useCallback(() => {
    setLembretes(storage.getLembretes());
    const aprs = storage.getAprendentes();
    setAprendentes(aprs);
    setAprendenteId((prev) => (prev ? prev : aprs[0]?.id || ''));
    setConfig(storage.getConfiguracoes());
    setPermissaoStatus(notificationService.getPermissionStatus());
    const currentToday = new Date().toISOString().split('T')[0];
    setHojeStr(currentToday);
  }, []);

  useEffect(() => {
    carregar();
    window.addEventListener('praxis_storage_updated', carregar);
    return () => window.removeEventListener('praxis_storage_updated', carregar);
  }, [carregar]);

  // Request notifications explicitly on user action
  const handleAtivarNotificacoes = async () => {
    const status = await notificationService.requestPermission();
    setPermissaoStatus(status);
    if (status === 'granted') {
      const atualizada = { ...config, notificacoesAtivas: true };
      storage.saveConfiguracoes(atualizada);
      setConfig(atualizada);
      showToast('Notificações ativadas no navegador com sucesso!', 'sucesso');
    } else if (status === 'denied') {
      showToast('Permissão de notificações bloqueada pelo navegador.', 'aviso');
    }
  };

  // Test sound & alarm
  const handleTestarAlerta = () => {
    audioAlert.playChime(config.somEscolhido, config.volume);
    notificationService.testNotification();
    showToast('Alerta de teste emitido (som + notificação se autorizada).', 'info');
  };

  const handleToggleSom = () => {
    const atualizada = { ...config, somAtivo: !config.somAtivo };
    storage.saveConfiguracoes(atualizada);
    setConfig(atualizada);
    showToast(atualizada.somAtivo ? 'Som de alertas ativado.' : 'Som de alertas desativado.', 'info');
  };

  const handleTrocarSom = (perfil: SoundProfile) => {
    const atualizada = { ...config, somEscolhido: perfil };
    storage.saveConfiguracoes(atualizada);
    setConfig(atualizada);
    audioAlert.playChime(perfil, config.volume);
  };

  const abrirModalCriar = () => {
    setLembreteEditando(null);
    setData(new Date().toISOString().split('T')[0]);
    setHorarioInicio('14:30');
    setDuracaoMinutos(50);
    setTipoCompromisso('sessao_individual');
    setModalidade('presencial');
    setLocal('Consultório Principal - Sala A');
    setObservacoes('');
    setAlertas([15, 60]);
    setModalNovoAberto(true);
  };

  const abrirModalEditar = (lem: LembreteConsulta) => {
    setLembreteEditando(lem);
    setAprendenteId(lem.aprendenteId);
    setTipoCompromisso(lem.tipoCompromisso);
    setData(lem.data);
    setHorarioInicio(lem.horarioInicio);
    setDuracaoMinutos(lem.duracaoMinutos);
    setModalidade(lem.modalidade);
    setLocal(lem.local);
    setObservacoes(lem.observacoes);
    setRecorrencia(lem.recorrencia);
    setAlertas(lem.alertasAntecedencia);
    setModalNovoAberto(true);
  };

  const handleSalvarLembrete = (e: React.FormEvent) => {
    e.preventDefault();
    const apr = aprendentes.find((a) => a.id === aprendenteId);
    const nomeAprendente = apr ? apr.nomeCompleto : 'Aprendente Demonstrativo';

    const novoOuAtualizado: LembreteConsulta = {
      id: lembreteEditando ? lembreteEditando.id : `lem-${Date.now()}`,
      aprendenteId,
      nomeAprendente,
      tipoCompromisso,
      data,
      horarioInicio,
      duracaoMinutos,
      fusoHorario: 'America/Sao_Paulo (GMT-3)',
      modalidade,
      local,
      observacoes,
      recorrencia,
      alertasAntecedencia: alertas,
      status: lembreteEditando?.status || 'agendado',
    };

    storage.saveLembrete(novoOuAtualizado);
    setModalNovoAberto(false);
    showToast(
      lembreteEditando ? 'Consulta atualizada com sucesso!' : 'Novo lembrete de consulta agendado!',
      'sucesso'
    );
  };

  const handleConcluir = (lem: LembreteConsulta) => {
    const atualizado = { ...lem, status: 'concluido' as StatusLembrete };
    storage.saveLembrete(atualizado);
    showToast('Consulta marcada como concluída.', 'sucesso');
  };

  const handleExcluirConfirmado = () => {
    if (!modalExcluir.lembrete) return;
    storage.deleteLembrete(modalExcluir.lembrete.id);
    showToast('Lembrete removido da agenda.', 'info');
  };

  const lembretesFiltrados = lembretes.filter((l) => {
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'hoje') return l.data === hojeStr;
    if (filtroTipo === 'agendados') return l.status === 'agendado';
    if (filtroTipo === 'concluidos') return l.status === 'concluido';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#183238]">
            Agenda & Lembretes de Consultas
          </h1>
          <p className="text-xs text-[#52676B] mt-0.5">
            Gestão de horários com múltiplos alertas auditivos, visuais e notificações PWA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestarAlerta}
            className="px-3.5 py-2 text-xs font-semibold text-[#176B73] bg-[#EEF5F4] hover:bg-[#d4ecec] rounded-xl transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Testar Alarme & Som</span>
          </button>

          <button
            onClick={abrirModalCriar}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lembrete</span>
          </button>
        </div>
      </div>

      {/* Preferences and Technical Transparency Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerta Preferences Card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEF5F4] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEF5F4] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#176B73]" />
              <h2 className="text-sm font-bold text-[#183238]">Preferências de Alerta e Notificação</h2>
            </div>
            <span className="text-[11px] font-mono text-[#52676B]">Controle do Dispositivo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Status de Notificação do Navegador */}
            <div className="p-3.5 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#183238]">Notificações do Sistema:</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                    permissaoStatus === 'granted'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                      : permissaoStatus === 'denied'
                      ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                  }`}
                >
                  {permissaoStatus === 'granted'
                    ? 'Permitida'
                    : permissaoStatus === 'denied'
                    ? 'Bloqueada'
                    : 'Não configurada'}
                </span>
              </div>
              <p className="text-[#52676B] text-[11px] leading-relaxed">
                {permissaoStatus === 'granted'
                  ? 'O navegador está autorizado a exibir lembretes na tela e na barra de notificações.'
                  : permissaoStatus === 'denied'
                  ? 'A permissão foi negada nas configurações do navegador. Clique no cadeado da barra de endereço para liberar.'
                  : 'Clique abaixo para solicitar autorização de notificações ao navegador.'}
              </p>
              {permissaoStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={handleAtivarNotificacoes}
                  className="w-full py-1.5 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-lg transition-colors"
                >
                  Ativar Notificações no Navegador
                </button>
              )}
            </div>

            {/* Controle de Som e Volume */}
            <div className="p-3.5 bg-[#F7FAFA] rounded-xl border border-[#EEF5F4] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#183238]">Sons de Alarme (Web Audio):</span>
                <button
                  onClick={handleToggleSom}
                  className="text-xs font-semibold text-[#176B73] hover:underline"
                >
                  {config.somAtivo ? 'Desativar Som' : 'Ativar Som'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {(['suave_cristal', 'harpa_calma', 'sino_zen'] as SoundProfile[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleTrocarSom(p)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all border ${
                      config.somEscolhido === p
                        ? 'bg-[#EEF5F4] text-[#176B73] border-[#238B8D]'
                        : 'bg-white text-[#52676B] border-[#EEF5F4]'
                    }`}
                  >
                    {p === 'suave_cristal' ? 'Cristal' : p === 'harpa_calma' ? 'Harpa' : 'Sino Zen'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#52676B] pt-1">
                <span>Volume:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    const at = { ...config, volume: v };
                    storage.saveConfiguracoes(at);
                    setConfig(at);
                  }}
                  className="flex-1 accent-[#176B73]"
                />
                <span className="font-mono tabular-nums">{config.volume}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guia: Como Garantir que Você Receba o Alerta (Requisito 6.13) */}
        <div className="bg-[#f0f8f8] dark:bg-[#0c1822] border border-[#d4ecec] dark:border-[#193240] rounded-2xl p-5 space-y-2.5 text-xs text-[#183238] dark:text-[#a0c0c6] transition-colors">
          <div className="flex items-center gap-2 font-bold text-[#176B73] dark:text-[#00E5FF]">
            <Smartphone className="w-4 h-4 shrink-0" />
            <h2 className="text-sm">Como garantir que você receba o alerta</h2>
          </div>
          <p className="text-[#52676B] dark:text-[#8da4ac] leading-relaxed">
            PWAs web funcionam prioritariamente enquanto o aplicativo estiver aberto. Para aumentar a confiabilidade:
          </p>
          <ul className="space-y-1.5 text-[11px] text-[#183238] dark:text-[#c4e8eb] list-disc list-inside">
            <li>Instale a PWA na tela inicial do celular;</li>
            <li>Autorize notificações nas permissões do navegador;</li>
            <li>Habilite som e vibração no sistema operacional;</li>
            <li>Não bloqueie a aba em modos agressivos de economia de bateria.</li>
          </ul>
          <p className="text-[10px] text-[#52676B] dark:text-[#8da4ac] pt-2 border-t border-[#d4ecec] dark:border-[#193240] italic">
            * Nota ética: Uma PWA não substitui o alarme despertador nativo do sistema operacional para situações críticas em que o celular está totalmente desligado.
          </p>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white rounded-2xl border border-[#EEF5F4] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filtroTipo === 'todos'
                ? 'bg-[#EEF5F4] text-[#176B73]'
                : 'text-[#52676B] hover:bg-neutral-50'
            }`}
          >
            Todos ({lembretes.length})
          </button>
          <button
            onClick={() => setFiltroTipo('hoje')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filtroTipo === 'hoje'
                ? 'bg-[#EEF5F4] text-[#176B73]'
                : 'text-[#52676B] hover:bg-neutral-50'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFiltroTipo('agendados')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filtroTipo === 'agendados'
                ? 'bg-[#EEF5F4] text-[#176B73]'
                : 'text-[#52676B] hover:bg-neutral-50'
            }`}
          >
            Agendados
          </button>
          <button
            onClick={() => setFiltroTipo('concluidos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filtroTipo === 'concluidos'
                ? 'bg-[#EEF5F4] text-[#176B73]'
                : 'text-[#52676B] hover:bg-neutral-50'
            }`}
          >
            Concluídos
          </button>
        </div>

        <div className="text-xs text-[#52676B]">
          Fuso Horário: <strong className="text-[#183238]">Brasília (GMT-3)</strong>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {lembretesFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EEF5F4] p-12 text-center">
            <Calendar className="w-12 h-12 text-[#52676B]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#183238]">Nenhum compromisso neste filtro</h3>
            <p className="text-xs text-[#52676B] max-w-sm mx-auto mt-1 mb-4">
              Agende uma nova sessão, devolutiva aos pais ou reunião escolar.
            </p>
            <button
              onClick={abrirModalCriar}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl transition-colors"
            >
              Criar Primeiro Lembrete
            </button>
          </div>
        ) : (
          lembretesFiltrados.map((lem) => {
            const isHoje = lem.data === hojeStr;
            const isConcluido = lem.status === 'concluido';

            return (
              <div
                key={lem.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isHoje ? 'border-[#238B8D]/40 ring-1 ring-[#238B8D]/20' : 'border-[#EEF5F4]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      isHoje
                        ? 'bg-[#176B73] text-white font-bold'
                        : 'bg-[#EEF5F4] text-[#176B73] font-medium'
                    }`}
                  >
                    <span suppressHydrationWarning className="text-[10px] uppercase tracking-wider">
                      {isHoje ? 'Hoje' : lem.data.split('-')[2]}
                    </span>
                    <span className="text-xs font-bold font-mono">{lem.horarioInicio}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#183238]">{lem.nomeAprendente}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EEF5F4] text-[#176B73] capitalize">
                        {lem.tipoCompromisso.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#52676B] mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#238B8D]" />
                        <span>{lem.duracaoMinutos} minutos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8B7BB5]" />
                        <span>{lem.modalidade === 'presencial' ? lem.local : 'Atendimento Online'}</span>
                      </div>
                    </div>

                    {lem.alertasAntecedencia && lem.alertasAntecedencia.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50 mt-1.5 w-fit">
                        <Bell className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>
                          Alertas programados:{' '}
                          {lem.alertasAntecedencia
                            .map((m) => (m >= 1440 ? '1 dia' : m >= 60 ? `${m / 60}h` : `${m}min`))
                            .join(', ')}{' '}
                          antes
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => {
                      notificationService.triggerReminderAlert(lem, 'Alerta de Teste do Compromisso');
                      showToast(`Alarme disparado para ${lem.nomeAprendente}!`, 'info');
                    }}
                    className="p-2 text-[#007a82] dark:text-[#00E5FF] hover:bg-teal-50 dark:hover:bg-[#182633] rounded-xl transition-colors"
                    title="Testar alarme sonoro e tela cheia agora"
                    aria-label={`Testar alarme para ${lem.nomeAprendente}`}
                  >
                    <BellRing className="w-4 h-4" />
                  </button>

                  {!isConcluido && (
                    <button
                      onClick={() => handleConcluir(lem)}
                      className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition-colors min-h-[36px] flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir</span>
                    </button>
                  )}

                  <button
                    onClick={() => abrirModalEditar(lem)}
                    className="p-2 text-[#52676B] hover:text-[#183238] hover:bg-neutral-100 rounded-xl transition-colors"
                    title="Editar"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setModalExcluir({ aberto: true, lembrete: lem })}
                    className="p-2 text-[#52676B] hover:text-[#B54747] hover:bg-[#fee2e2]/40 rounded-xl transition-colors"
                    title="Excluir"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Criação / Edição de Lembrete */}
      {modalNovoAberto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF5F4] mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#176B73]" />
                <h2 className="text-base font-bold text-[#183238]">
                  {lembreteEditando ? 'Editar Lembrete de Consulta' : 'Novo Lembrete de Consulta'}
                </h2>
              </div>
              <button
                onClick={() => setModalNovoAberto(false)}
                className="p-1 rounded-md text-[#52676B] hover:text-[#183238]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarLembrete} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#183238] mb-1">Aprendente *</label>
                <select
                  value={aprendenteId}
                  onChange={(e) => setAprendenteId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
                >
                  {aprendentes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nomeCompleto} ({a.codigoInterno})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#183238] mb-1">Tipo de Compromisso</label>
                  <select
                    value={tipoCompromisso}
                    onChange={(e) => setTipoCompromisso(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
                  >
                    <option value="sessao_individual">Sessão Individual</option>
                    <option value="anamnese_inicial">Anamnese Inicial</option>
                    <option value="devolutiva_pais">Devolutiva aos Pais</option>
                    <option value="reuniao_escola">Reunião com a Escola</option>
                    <option value="avaliacao">Avaliação Psicopedagógica</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#183238] mb-1">Modalidade</label>
                  <select
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA] focus:outline-hidden focus:border-[#238B8D]"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="online">Online (Remoto)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#183238] mb-1">Data *</label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#183238] mb-1">Horário *</label>
                  <input
                    type="time"
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#183238] mb-1">Duração (min)</label>
                  <input
                    type="number"
                    value={duracaoMinutos}
                    onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#183238] mb-1">Local / Link</label>
                <input
                  type="text"
                  placeholder="Ex: Consultório Principal - Sala A"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]"
                />
              </div>

              {/* Múltiplos Alertas de Antecedência */}
              <div>
                <label className="block font-semibold text-[#183238] mb-1">
                  Alertas com Antecedência (Até 3 seleções)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 5, label: '5 minutos' },
                    { val: 15, label: '15 minutos' },
                    { val: 30, label: '30 minutos' },
                    { val: 60, label: '1 hora' },
                    { val: 120, label: '2 horas' },
                    { val: 1440, label: '1 dia antes' },
                  ].map((alt) => {
                    const ativo = alertas.includes(alt.val);
                    return (
                      <button
                        key={alt.val}
                        type="button"
                        onClick={() => {
                          if (ativo) {
                            setAlertas(alertas.filter((v) => v !== alt.val));
                          } else {
                            if (alertas.length >= 3) {
                              showToast('Você pode selecionar até 3 alertas por compromisso.', 'aviso');
                              return;
                            }
                            setAlertas([...alertas, alt.val]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                          ativo
                            ? 'bg-[#EEF5F4] text-[#176B73] border-[#238B8D]'
                            : 'border-[#EEF5F4] text-[#52676B]'
                        }`}
                      >
                        {alt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#183238] mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Orientações prévias, materiais a trazer..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EEF5F4] bg-[#F7FAFA]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEF5F4]">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#52676B] hover:text-[#183238] bg-neutral-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#176B73] hover:bg-[#238B8D] rounded-xl shadow-xs"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={modalExcluir.aberto}
        onClose={() => setModalExcluir({ aberto: false })}
        onConfirm={handleExcluirConfirmado}
        tipo="excluir"
        titulo="Excluir Lembrete de Consulta"
        itemIdentificador={`Consulta de ${modalExcluir.lembrete?.nomeAprendente} em ${modalExcluir.lembrete?.data}`}
      />
    </div>
  );
};
