'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OfflineView } from '@/components/offline/OfflineView';
import { AppShell } from '@/components/layout/AppShell';

export default function OfflinePage() {
  const router = useRouter();

  return (
    <AppShell
      currentRoute="offline"
      onNavigate={(route, params) => {
        if (route === 'dashboard') {
          router.push('/');
        } else {
          router.push(`/?route=${route}${params?.id ? `&id=${params.id}` : ''}`);
        }
      }}
    >
      <OfflineView
        onNavigate={(route, params) => {
          if (route === 'dashboard') {
            router.push('/');
          } else {
            router.push(`/?route=${route}${params?.id ? `&id=${params.id}` : ''}`);
          }
        }}
      />
    </AppShell>
  );
}
