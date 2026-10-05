'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell, ActiveRoute } from '@/components/layout/AppShell';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { AprendentesListView } from '@/components/aprendentes/AprendentesListView';
import { AprendenteFormView } from '@/components/aprendentes/AprendenteFormView';
import { AprendenteDetailView } from '@/components/aprendentes/AprendenteDetailView';
import { AnamneseFormView } from '@/components/anamnese/AnamneseFormView';
import { SessoesView } from '@/components/sessoes/SessoesView';
import { AvaliacaoView } from '@/components/avaliacao/AvaliacaoView';
import { RelatoriosListView } from '@/components/relatorios/RelatoriosListView';
import { RelatorioWizardView } from '@/components/relatorios/RelatorioWizardView';
import { RelatorioVisualizarView } from '@/components/relatorios/RelatorioVisualizarView';
import { FormulariosModelosView } from '@/components/formularios/FormulariosModelosView';
import { LembretesAgendaView } from '@/components/lembretes/LembretesAgendaView';
import { ConfiguracoesView } from '@/components/configuracoes/ConfiguracoesView';
import { OfflineView } from '@/components/offline/OfflineView';
import { storage } from '@/lib/storage';

function AppRouterContent() {
  const searchParams = useSearchParams();

  const [route, setRoute] = useState<ActiveRoute>('dashboard');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  // Initialize storage and initial route from URL search params
  useEffect(() => {
    storage.init();

    const paramRoute = searchParams.get('route') as ActiveRoute;
    const paramId = searchParams.get('id');
    const paramQ = searchParams.get('q');

    if (paramRoute) {
      setRoute(paramRoute);
      const params: Record<string, string> = {};
      if (paramId) params.id = paramId;
      if (paramQ) params.q = paramQ;
      setRouteParams(params);
    }

    const handlePopState = () => {
      const url = new URL(window.location.href);
      const r = (url.searchParams.get('route') as ActiveRoute) || 'dashboard';
      const id = url.searchParams.get('id') || '';
      const q = url.searchParams.get('q') || '';
      setRoute(r);
      const p: Record<string, string> = {};
      if (id) p.id = id;
      if (q) p.q = q;
      setRouteParams(p);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchParams]);

  const handleNavigate = (newRoute: ActiveRoute, params: Record<string, string> = {}) => {
    setRoute(newRoute);
    setRouteParams(params);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('route', newRoute);
      if (params.id) {
        url.searchParams.set('id', params.id);
      } else {
        url.searchParams.delete('id');
      }
      if (params.q) {
        url.searchParams.set('q', params.q);
      } else {
        url.searchParams.delete('q');
      }
      window.history.pushState({}, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AppShell currentRoute={route} routeParams={routeParams} onNavigate={handleNavigate}>
      {route === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}

      {route === 'aprendentes' && (
        <AprendentesListView
          onNavigate={handleNavigate}
          initialQuery={routeParams.q || ''}
        />
      )}

      {route === 'aprendente-novo' && (
        <AprendenteFormView onNavigate={handleNavigate} editId={routeParams.id} />
      )}

      {route === 'aprendente-detalhe' && (
        <AprendenteDetailView
          aprendenteId={routeParams.id || 'apr-2'}
          onNavigate={handleNavigate}
        />
      )}

      {route === 'anamnese' && (
        <AnamneseFormView
          aprendenteId={routeParams.id || 'apr-1'}
          onNavigate={handleNavigate}
        />
      )}

      {route === 'sessoes' && (
        <SessoesView
          aprendenteId={routeParams.id || 'apr-2'}
          onNavigate={handleNavigate}
        />
      )}

      {route === 'avaliacao' && (
        <AvaliacaoView
          aprendenteId={routeParams.id || 'apr-2'}
          onNavigate={handleNavigate}
        />
      )}

      {route === 'relatorios' && <RelatoriosListView onNavigate={handleNavigate} />}

      {route === 'relatorio-novo' && (
        <RelatorioWizardView
          aprendenteId={routeParams.aprendenteId || (!routeParams.id?.startsWith('rel-') ? routeParams.id : undefined)}
          relatorioId={routeParams.relatorioId || (routeParams.id?.startsWith('rel-') ? routeParams.id : undefined)}
          onNavigate={handleNavigate}
        />
      )}

      {route === 'relatorio-visualizar' && (
        <RelatorioVisualizarView
          relatorioId={routeParams.id || 'rel-1'}
          onNavigate={handleNavigate}
        />
      )}

      {route === 'formularios' && <FormulariosModelosView onNavigate={handleNavigate} />}

      {route === 'lembretes' && (
        <LembretesAgendaView
          targetId={routeParams.id}
          onNavigate={handleNavigate}
        />
      )}

      {route === 'configuracoes' && <ConfiguracoesView onNavigate={handleNavigate} />}

      {route === 'offline' && <OfflineView onNavigate={handleNavigate} />}
    </AppShell>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1015] text-[#00E5FF] gap-3 font-medium text-xs">
        <div className="w-8 h-8 rounded-xl border-2 border-[#00E5FF] border-t-transparent animate-spin" />
        <span className="text-[#8da4ac]">Carregando Psicoficha...</span>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1015] text-[#00E5FF] gap-3 font-medium text-xs">
          <div className="w-8 h-8 rounded-xl border-2 border-[#00E5FF] border-t-transparent animate-spin" />
          <span className="text-[#8da4ac]">Carregando Psicoficha...</span>
        </div>
      }
    >
      <AppRouterContent />
    </Suspense>
  );
}
