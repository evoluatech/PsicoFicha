'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Calendar,
  Layers,
  Settings,
  Plus,
  Wifi,
  WifiOff,
  ChevronRight,
  ShieldCheck,
  Search,
  Menu,
  X,
  FileSpreadsheet,
  Clock,
  Sparkles,
  HelpCircle,
  FolderOpen,
  Sun,
  Moon,
  Monitor,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { useTheme } from '@/hooks/use-theme';
import { useFirebase } from '@/components/firebase/FirebaseProvider';
import { ToastContainer, showToast } from '@/components/ui/ToastContainer';
import { AlarmModal } from '@/components/ui/AlarmModal';
import { PWAInstallBanner } from '@/components/ui/PWAInstallBanner';
import { PsicofichaLogo } from '@/components/ui/PsicofichaLogo';
import { storage } from '@/lib/storage';
import { notificationService } from '@/lib/notification-service';

export type ActiveRoute =
  | 'dashboard'
  | 'aprendentes'
  | 'aprendente-novo'
  | 'aprendente-detalhe'
  | 'anamnese'
  | 'sessoes'
  | 'avaliacao'
  | 'relatorios'
  | 'relatorio-novo'
  | 'relatorio-visualizar'
  | 'formularios'
  | 'lembretes'
  | 'configuracoes'
  | 'offline';

interface AppShellProps {
  currentRoute: ActiveRoute;
  routeParams?: Record<string, string>;
  onNavigate: (route: ActiveRoute, params?: Record<string, string>) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  routeParams = {},
  onNavigate,
  children,
}) => {
  const { isOnline } = usePWA();
  const { themePreference, isDark, cycleTheme } = useTheme();
  const { user, connected: firebaseConnected, openAuthModal, signOut } = useFirebase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profInfo, setProfInfo] = useState({
    nome: 'Dra. Gabriela A.',
    registro: 'ABPp 14.892/SP',
    iniciais: 'GA',
  });

  useEffect(() => {
    const carregarProf = () => {
      try {
        const prof = storage.getProfissional();
        if (prof && prof.nome) {
          const partes = prof.nome.trim().split(' ');
          const prim = partes[0] || 'G';
          const seg = partes[partes.length - 1] || 'A';
          const ini = (prim[0] + seg[0]).toUpperCase();
          setProfInfo({
            nome: prof.nome,
            registro: prof.registro || 'ABPp',
            iniciais: ini,
          });
        }
      } catch {}
    };
    carregarProf();
    window.addEventListener('praxis_storage_updated', carregarProf);
    return () => window.removeEventListener('praxis_storage_updated', carregarProf);
  }, []);

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNewMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic background check for scheduled reminders
  useEffect(() => {
    const firedAlerts = new Set<string>();

    const checkReminders = () => {
      try {
        const lembretes = storage.getLembretes();
        const now = new Date();
        const hojeStr = now.toISOString().split('T')[0];
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        lembretes.forEach((lem) => {
          if (lem.status !== 'agendado' || lem.data !== hojeStr) return;

          const [hStr, mStr] = lem.horarioInicio.split(':');
          const remHours = parseInt(hStr, 10);
          const remMinutes = parseInt(mStr, 10);
          if (isNaN(remHours) || isNaN(remMinutes)) return;
          const remTotalMinutes = remHours * 60 + remMinutes;

          const alertas = lem.alertasAntecedencia && lem.alertasAntecedencia.length > 0 
            ? lem.alertasAntecedencia 
            : [15];

          alertas.forEach((antecedencia) => {
            const alertTimeMinutes = remTotalMinutes - antecedencia;
            if (currentTotalMinutes >= alertTimeMinutes && currentTotalMinutes <= alertTimeMinutes + 1) {
              const alertKey = `${lem.id}-${antecedencia}-${hojeStr}`;
              if (!firedAlerts.has(alertKey)) {
                firedAlerts.add(alertKey);
                const desc = antecedencia === 0
                  ? 'Compromisso no horário previsto'
                  : `Compromisso em ${antecedencia} minutos`;
                notificationService.triggerReminderAlert(lem, desc);
              }
            }
          });
        });
      } catch (err) {
        console.warn('Erro ao checar lembretes:', err);
      }
    };

    const intervalId = setInterval(checkReminders, 30000);
    checkReminders();

    return () => clearInterval(intervalId);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'aprendentes', label: 'Aprendentes', icon: Users },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'lembretes', label: 'Agenda & Lembretes', icon: Calendar },
    { id: 'formularios', label: 'Modelos de Formulários', icon: FileSpreadsheet },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Início', route: 'dashboard' as ActiveRoute }];

    if (currentRoute === 'aprendentes') {
      crumbs.push({ label: 'Aprendentes', route: 'aprendentes' });
    } else if (currentRoute === 'aprendente-novo') {
      crumbs.push({ label: 'Aprendentes', route: 'aprendentes' });
      crumbs.push({ label: 'Novo Cadastro', route: 'aprendente-novo' });
    } else if (currentRoute === 'aprendente-detalhe') {
      crumbs.push({ label: 'Aprendentes', route: 'aprendentes' });
      crumbs.push({ label: 'Perfil do Aprendente', route: 'aprendente-detalhe' });
    } else if (currentRoute === 'anamnese') {
      crumbs.push({ label: 'Aprendentes', route: 'aprendentes' });
      crumbs.push({ label: 'Anamnese', route: 'anamnese' });
    } else if (currentRoute === 'sessoes') {
      crumbs.push({ label: 'Aprendentes', route: 'aprendentes' });
      crumbs.push({ label: 'Sessões', route: 'sessoes' });
    } else if (currentRoute === 'avaliacao') {
      crumbs.push({ label: 'Aprendentes', route: 'aprendentes' });
      crumbs.push({ label: 'Avaliação Psicopedagógica', route: 'avaliacao' });
    } else if (currentRoute === 'relatorios') {
      crumbs.push({ label: 'Relatórios', route: 'relatorios' });
    } else if (currentRoute === 'relatorio-novo') {
      crumbs.push({ label: 'Relatórios', route: 'relatorios' });
      crumbs.push({ label: 'Criador por Etapas', route: 'relatorio-novo' });
    } else if (currentRoute === 'relatorio-visualizar') {
      crumbs.push({ label: 'Relatórios', route: 'relatorios' });
      crumbs.push({ label: 'Visualização A4', route: 'relatorio-visualizar' });
    } else if (currentRoute === 'formularios') {
      crumbs.push({ label: 'Biblioteca de Modelos', route: 'formularios' });
    } else if (currentRoute === 'lembretes') {
      crumbs.push({ label: 'Agenda & Lembretes', route: 'lembretes' });
    } else if (currentRoute === 'configuracoes') {
      crumbs.push({ label: 'Configurações & Privacidade', route: 'configuracoes' });
    } else if (currentRoute === 'offline') {
      crumbs.push({ label: 'Modo Offline', route: 'offline' });
    }

    return crumbs;
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors overflow-x-hidden ${isDark ? 'bg-[#0b1015]' : 'bg-[#f1f5f9]'}`}>
      <ToastContainer />
      <AlarmModal
        onNavigateToLembrete={(id) => {
          onNavigate('lembretes', { id });
        }}
      />

      {/* Top Ethics & Privacy Banner */}
      <div
        className={`px-3 sm:px-4 py-1 text-[11px] sm:text-xs flex items-center justify-between no-print z-30 border-b transition-colors overflow-hidden shrink-0 ${
          isDark
            ? 'bg-[#060a0d] text-[#8da4ac] border-[#141e27]'
            : 'bg-slate-200/70 text-slate-700 border-slate-300/80'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#00E5FF]' : 'text-[#007a82]'}`} />
          <span className="truncate text-[10px] sm:text-xs">
            <strong className={isDark ? 'text-white' : 'text-slate-900 font-bold'}>
              Ambiente Seguro:
            </strong>{' '}
            Registros clínicos com isolamento no dispositivo.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[10px] sm:text-[11px] ml-2">
          <span className="hidden md:inline">Armazenamento Local Ativo</span>
          <span
            title={firebaseConnected ? 'Nuvem sincronizada' : 'Modo local seguro'}
            className={`w-2 h-2 rounded-full shrink-0 ${isDark ? 'bg-[#00E5FF]' : 'bg-[#008B94]'}`}
          />
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Sidebar (260px wide) */}
        <aside
          className={`hidden lg:flex w-64 flex-col border-r no-print shrink-0 transition-colors ${
            isDark
              ? 'bg-[#0b1015] border-[#1e2d3b] text-white'
              : 'bg-white border-slate-200 text-slate-800 shadow-xs'
          }`}
        >
          {/* Brand Wordmark & Emblem */}
          <div className={`p-4 border-b flex items-center ${isDark ? 'border-[#1e2d3b]' : 'border-slate-200'}`}>
            <PsicofichaLogo variant="horizontal" size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.id ||
                (item.id === 'aprendentes' &&
                  ['aprendente-novo', 'aprendente-detalhe', 'anamnese', 'sessoes', 'avaliacao'].includes(
                    currentRoute
                  )) ||
                (item.id === 'relatorios' &&
                  ['relatorio-novo', 'relatorio-visualizar'].includes(currentRoute));

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as ActiveRoute)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[44px] ${
                    isActive
                      ? isDark
                        ? 'bg-[#121c25] text-[#00E5FF] border border-[#00E5FF]/20 font-bold shadow-xs'
                        : 'bg-teal-50 text-[#007a82] border border-[#008B94]/30 font-bold shadow-xs'
                      : isDark
                      ? 'text-[#8da4ac] hover:text-white hover:bg-[#121c25]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? isDark
                          ? 'text-[#00E5FF]'
                          : 'text-[#007a82]'
                        : isDark
                        ? 'text-[#8da4ac]'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* PWA Install in Sidebar */}
          <div className={`p-3 border-t ${isDark ? 'border-[#1e2d3b]' : 'border-slate-200'}`}>
            <PWAInstallBanner />
          </div>

          {/* User profile & offline / cloud indicator */}
          <div
            className={`p-3.5 border-t flex items-center justify-between transition-colors ${
              isDark
                ? 'border-[#1e2d3b] bg-[#0d141b]'
                : 'border-slate-200 bg-slate-100/70'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (user) {
                  onNavigate('configuracoes');
                } else {
                  openAuthModal('login');
                }
              }}
              className="flex items-center gap-2.5 text-left group overflow-hidden focus:outline-hidden"
              title={user ? 'Configurações e Nuvem' : 'Clique para entrar com Gmail ou Senha'}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isDark
                    ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30'
                    : 'bg-teal-100 text-[#007a82] border border-teal-200'
                }`}
              >
                {user ? (
                  user.displayName
                    ? user.displayName.slice(0, 2).toUpperCase()
                    : (user.email?.slice(0, 2).toUpperCase() || 'US')
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="text-left max-w-[115px] truncate">
                <p className={`text-xs font-bold leading-tight truncate group-hover:text-[#008B94] dark:group-hover:text-[#00E5FF] transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user ? (user.displayName || user.email?.split('@')[0]) : 'Fazer Login'}
                </p>
                <p className={`text-[10px] truncate ${isDark ? 'text-[#8da4ac]' : 'text-slate-500'}`}>
                  {user ? 'Nuvem Conectada' : 'Entrar na Conta'}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                title={firebaseConnected ? 'Nuvem sincronizada' : 'Modo offline'}
                className="flex items-center"
              >
                <Cloud
                  className={`w-3.5 h-3.5 ${
                    firebaseConnected
                      ? isDark ? 'text-[#00E5FF]' : 'text-[#007a82]'
                      : 'text-slate-400'
                  }`}
                />
              </span>
              <div
                title={isOnline ? 'Conexão ativa' : 'Modo Offline Ativo'}
                className="flex items-center gap-1 text-[11px] font-medium"
              >
                {isOnline ? (
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#00E5FF]' : 'bg-[#008B94]'}`} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header Bar */}
          <header
            className={`sticky top-0 z-20 px-3 sm:px-6 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 no-print shadow-xs border-b backdrop-blur-md transition-colors ${
              isDark
                ? 'bg-[#0b1015]/95 border-[#1e2d3b]'
                : 'bg-white/95 border-slate-200 shadow-xs'
            }`}
          >
            {/* Mobile menu trigger + Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors shrink-0 ${
                  isDark
                    ? 'text-[#8da4ac] hover:text-[#00E5FF] hover:bg-[#121c25]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="Abrir menu de navegação"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb Trail */}
              <nav
                aria-label="Breadcrumb"
                className={`hidden sm:flex items-center gap-1.5 text-xs ${
                  isDark ? 'text-[#8da4ac]' : 'text-slate-500'
                }`}
              >
                {getBreadcrumbs().map((crumb, idx, arr) => (
                  <React.Fragment key={crumb.route + idx}>
                    {idx > 0 && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${isDark ? 'text-[#2d4352]' : 'text-slate-400'}`}
                      />
                    )}
                    {idx === arr.length - 1 ? (
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {crumb.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => onNavigate(crumb.route)}
                        className={`transition-colors ${
                          isDark ? 'hover:text-[#00E5FF]' : 'hover:text-[#007a82]'
                        }`}
                      >
                        {crumb.label}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </nav>

              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="sm:hidden flex items-center shrink-0 text-left focus:outline-hidden active:opacity-80 transition-opacity"
                aria-label="Ir para a página inicial Psicoficha"
              >
                <PsicofichaLogo variant="horizontal" size="sm" showSubtitle={false} />
              </button>
            </div>

            {/* Right actions: Search + Theme Selector + User / Login + Primary Action */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Quick Search */}
              <div className="relative hidden md:block w-44 lg:w-60">
                <Search
                  className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-[#8da4ac]' : 'text-slate-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Buscar aprendente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onNavigate('aprendentes', { q: searchQuery });
                    }
                  }}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl focus:outline-hidden transition-colors ${
                    isDark
                      ? 'bg-[#121c25] text-white placeholder-[#52676B] border border-[#1e2d3b] focus:border-[#00E5FF]'
                      : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-[#008B94]'
                  }`}
                />
              </div>

              {/* Theme Mode Toggle (Claro / Escuro / Sistema) */}
              <button
                onClick={cycleTheme}
                title={`Tema atual: ${
                  themePreference === 'claro'
                    ? 'Claro (Clique para alternar para Escuro)'
                    : themePreference === 'escuro'
                    ? 'Escuro (Clique para alternar para Sistema)'
                    : 'Sistema (Clique para alternar para Claro)'
                }`}
                aria-label={`Alternar tema. Modo atual: ${themePreference}`}
                className={`p-2 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center border shrink-0 ${
                  isDark
                    ? 'text-[#8da4ac] hover:text-[#00E5FF] bg-[#121c25] hover:bg-[#182633] border-[#1e2d3b]'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {themePreference === 'claro' && <Sun className="w-4 h-4 text-amber-500" />}
                {themePreference === 'escuro' && <Moon className="w-4 h-4 text-[#00E5FF]" />}
                {themePreference === 'sistema' && (
                  <Monitor className={`w-4 h-4 ${isDark ? 'text-[#00C4CC]' : 'text-teal-600'}`} />
                )}
              </button>

              {/* Login / User Profile in Header */}
              {user ? (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Menu do usuário"
                    className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:pr-2.5 rounded-xl border transition-all min-h-[38px] ${
                      isDark
                        ? 'bg-[#121c25] border-[#1e2d3b] hover:border-[#00E5FF]/40 text-white'
                        : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-[#00E5FF]/20 text-[#008B94] dark:text-[#00E5FF] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {user.displayName
                        ? user.displayName.slice(0, 2).toUpperCase()
                        : (user.email?.slice(0, 2).toUpperCase() || 'US')}
                    </div>
                    <span className="hidden xl:inline text-xs font-semibold max-w-[90px] truncate">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl p-2 z-40 border animate-in fade-in zoom-in-95 duration-100 ${
                        isDark
                          ? 'bg-[#121c25] border-[#1e2d3b]'
                          : 'bg-white border-slate-200 shadow-slate-200/50'
                      }`}
                    >
                      <div className="p-2.5 border-b border-slate-100 dark:border-[#1e2d3b]">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.displayName || 'Profissional Conectado'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-teal-50 dark:bg-[#00E5FF]/10 text-[#008B94] dark:text-[#00E5FF]">
                            {user.providerData?.some((p) => p.providerId === 'google.com')
                              ? 'Google / Gmail'
                              : 'E-mail / Senha'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('configuracoes');
                        }}
                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors mt-1 ${
                          isDark
                            ? 'text-white hover:bg-[#182633]'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5 text-[#008B94] dark:text-[#00E5FF]" />
                        <span>Configurações & Nuvem</span>
                      </button>

                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                          showToast('Sessão encerrada com sucesso.', 'info');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl border transition-all min-h-[38px] shrink-0 ${
                    isDark
                      ? 'border-[#00E5FF]/30 text-[#00E5FF] bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20'
                      : 'border-teal-200 text-[#007a82] bg-teal-50 hover:bg-teal-100'
                  }`}
                  title="Entrar com Google/Gmail ou Senha"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}

              {/* Contextual "+ Novo Registro" dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setNewMenuOpen(!newMenuOpen)}
                  aria-label="Adicionar novo registro"
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-xl shadow-xs transition-colors min-h-[38px] ${
                    isDark
                      ? 'text-[#0b1015] bg-[#00E5FF] hover:bg-[#38edff]'
                      : 'text-white bg-[#008B94] hover:bg-[#007a82]'
                  }`}
                >
                  <Plus className={`w-4 h-4 ${isDark ? 'text-[#0b1015]' : 'text-white'}`} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Novo Registro</span>
                </button>

                {newMenuOpen && (
                  <div
                    role="menu"
                    className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-1.5 z-40 border animate-in fade-in zoom-in-95 duration-100 ${
                      isDark
                        ? 'bg-[#121c25] border-[#1e2d3b]'
                        : 'bg-white border-slate-200 shadow-slate-200/50'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setNewMenuOpen(false);
                        onNavigate('aprendente-novo');
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors min-h-[40px] ${
                        isDark
                          ? 'text-white hover:bg-[#182633]'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-4 h-4 text-[#008B94] dark:text-[#00E5FF]" />
                      <span>Cadastrar Aprendente</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewMenuOpen(false);
                        onNavigate('sessoes', { id: 'apr-2' });
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors min-h-[40px] ${
                        isDark
                          ? 'text-white hover:bg-[#182633]'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-teal-600 dark:text-[#38edff]" />
                      <span>Registrar Sessão</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewMenuOpen(false);
                        onNavigate('relatorio-novo');
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors min-h-[40px] ${
                        isDark
                          ? 'text-white hover:bg-[#182633]'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-purple-600 dark:text-[#b9a9df]" />
                      <span>Criar Novo Relatório</span>
                    </button>
                    <button
                      onClick={() => {
                        setNewMenuOpen(false);
                        onNavigate('lembretes');
                      }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors min-h-[40px] ${
                        isDark
                          ? 'text-white hover:bg-[#182633]'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-[#6fa58b]" />
                      <span>Agendar Consulta</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Offline Banner if disconnected */}
          {!isOnline && (
            <div className="bg-[#A86B00] text-white px-4 py-2 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Você está offline:</strong> A plataforma continua funcionando normalmente em modo local. Todas as alterações serão mantidas neste dispositivo.
                </span>
              </div>
              <button
                onClick={() => onNavigate('offline')}
                className="text-xs underline font-semibold hover:text-amber-100"
              >
                Ver Detalhes
              </button>
            </div>
          )}

          {/* Main View Container */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-32 sm:pb-28 lg:pb-8 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navegação inferior mobile"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md px-1.5 sm:px-2 pt-1.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] grid grid-cols-5 items-center no-print border-t transition-colors ${
          isDark
            ? 'bg-[#0b1015]/95 border-[#1e2d3b]'
            : 'bg-white/95 border-slate-200 shadow-lg'
        }`}
      >
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-[44px] transition-colors ${
            currentRoute === 'dashboard'
              ? isDark
                ? 'text-[#00E5FF] font-bold'
                : 'text-[#007a82] font-bold'
              : isDark
              ? 'text-[#8da4ac] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Início</span>
        </button>

        <button
          onClick={() => onNavigate('aprendentes')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-[44px] transition-colors ${
            ['aprendentes', 'aprendente-novo', 'aprendente-detalhe', 'anamnese', 'sessoes', 'avaliacao'].includes(
              currentRoute
            )
              ? isDark
                ? 'text-[#00E5FF] font-bold'
                : 'text-[#007a82] font-bold'
              : isDark
              ? 'text-[#8da4ac] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Pacientes</span>
        </button>

        <button
          onClick={() => onNavigate('relatorios')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-[44px] transition-colors ${
            ['relatorios', 'relatorio-novo', 'relatorio-visualizar'].includes(currentRoute)
              ? isDark
                ? 'text-[#00E5FF] font-bold'
                : 'text-[#007a82] font-bold'
              : isDark
              ? 'text-[#8da4ac] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Relatórios</span>
        </button>

        <button
          onClick={() => onNavigate('lembretes')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-[44px] transition-colors ${
            currentRoute === 'lembretes'
              ? isDark
                ? 'text-[#00E5FF] font-bold'
                : 'text-[#007a82] font-bold'
              : isDark
              ? 'text-[#8da4ac] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Agenda</span>
        </button>

        <button
          onClick={() => onNavigate('configuracoes')}
          className={`flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-[44px] transition-colors ${
            currentRoute === 'configuracoes'
              ? isDark
                ? 'text-[#00E5FF] font-bold'
                : 'text-[#007a82] font-bold'
              : isDark
              ? 'text-[#8da4ac] hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex lg:hidden bg-black/75 backdrop-blur-xs"
        >
          <div
            className={`w-4/5 max-w-xs h-full flex flex-col p-5 shadow-2xl border-r transition-colors ${
              isDark
                ? 'bg-[#0b1015] border-[#1e2d3b] text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-[#1e2d3b]' : 'border-slate-200'}`}>
              <PsicofichaLogo variant="horizontal" size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-1 rounded-md ${
                  isDark
                    ? 'text-[#8da4ac] hover:text-white hover:bg-[#121c25]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(item.id as ActiveRoute);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-colors ${
                      isActive
                        ? isDark
                          ? 'bg-[#121c25] text-[#00E5FF] border border-[#00E5FF]/20 font-bold'
                          : 'bg-teal-50 text-[#007a82] border border-[#008B94]/30 font-bold'
                        : isDark
                        ? 'text-[#8da4ac] hover:bg-[#121c25] hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? isDark
                            ? 'text-[#00E5FF]'
                            : 'text-[#007a82]'
                          : isDark
                          ? 'text-[#8da4ac]'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-[#1e2d3b]' : 'border-slate-200'}`}>
              <PWAInstallBanner />

              {user ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('configuracoes');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d3b] bg-slate-50 dark:bg-[#0d141b] text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isDark
                            ? 'bg-[#00E5FF]/15 text-[#00E5FF]'
                            : 'bg-teal-100 text-[#007a82]'
                        }`}
                      >
                        {user.displayName
                          ? user.displayName.slice(0, 2).toUpperCase()
                          : (user.email?.slice(0, 2).toUpperCase() || 'US')}
                      </div>
                      <div className="truncate max-w-[130px]">
                        <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {user.displayName || user.email?.split('@')[0]}
                        </p>
                        <p className={`text-[10px] truncate ${isDark ? 'text-[#8da4ac]' : 'text-slate-500'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Cloud
                      className={`w-3.5 h-3.5 shrink-0 ${
                        firebaseConnected
                          ? isDark ? 'text-[#00E5FF]' : 'text-[#007a82]'
                          : 'text-slate-400'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                      showToast('Sessão encerrada com sucesso.', 'info');
                    }}
                    className="w-full py-1.5 px-3 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-red-200 dark:border-red-900/30"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-bold text-xs text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] dark:hover:bg-[#38edff] shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com Gmail ou Senha</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </div>
  );
};
