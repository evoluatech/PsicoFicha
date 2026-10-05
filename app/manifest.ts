import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Psicoficha — Fichas & Relatórios',
    short_name: 'Psicoficha',
    description: 'Plataforma PWA para psicopedagogia: fichas, formulários, acompanhamento e relatórios.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b1015',
    theme_color: '#0b1015',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Novo Aprendente',
        short_name: 'Novo',
        description: 'Cadastrar novo aprendente demonstrativo',
        url: '/?route=aprendente-novo',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Agenda de Consultas',
        short_name: 'Agenda',
        description: 'Ver lembretes e horários de sessões',
        url: '/?route=lembretes',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Novo Relatório',
        short_name: 'Relatório',
        description: 'Criar relatório psicopedagógico',
        url: '/?route=relatorio-novo',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
