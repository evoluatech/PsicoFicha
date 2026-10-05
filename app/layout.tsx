import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseProvider } from '@/components/firebase/FirebaseProvider';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1015' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Psicoficha',
  description: 'Plataforma PWA para psicopedagogia: fichas, formulários, acompanhamento e relatórios.',
  applicationName: 'Psicoficha',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Psicoficha',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Psicoficha',
    description: 'Plataforma PWA para psicopedagogia: fichas, formulários, acompanhamento e relatórios.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Psicoficha',
    description: 'Plataforma PWA para psicopedagogia: fichas, formulários, acompanhamento e relatórios.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark" data-theme="dark">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#0b1015" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b1015" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f1f5f9" />
      </head>
      <body className="min-h-screen antialiased selection:bg-[#00E5FF]/25 selection:text-[#00E5FF] transition-colors duration-200">
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}
