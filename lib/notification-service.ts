import { LembreteConsulta } from '@/types';
import { audioAlert } from './audio-alert';
import { storage } from './storage';

export type NotificationPermissionStatus = 'unsupported' | 'default' | 'granted' | 'denied';

class NotificationService {
  getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === 'undefined') return 'unsupported';
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission as NotificationPermissionStatus;
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      return result as NotificationPermissionStatus;
    } catch {
      return 'denied';
    }
  }

  async triggerReminderAlert(rem: LembreteConsulta, antecedenciaTexto: string = 'em breve') {
    const config = storage.getConfiguracoes();

    // 1. In-app audio & vibration if enabled
    if (config.somAtivo) {
      audioAlert.playChime(config.somEscolhido, config.volume);
    }
    if (config.vibracaoAtiva) {
      audioAlert.vibrate([200, 100, 200, 100, 300]);
    }

    // 2. Dispatch in-app modal event so the open application shows the rich alert dialog
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('praxis_in_app_alarm', {
          detail: {
            lembrete: rem,
            antecedenciaTexto,
          },
        })
      );
    }

    // 3. System notification via Service Worker or Notification API if permitted
    const permission = this.getPermissionStatus();
    if (permission === 'granted' && typeof window !== 'undefined') {
      const title = `Lembrete de Consulta: ${rem.nomeAprendente}`;
      const options: NotificationOptions = {
        body: `Atendimento agendado para às ${rem.horarioInicio} (${rem.modalidade === 'presencial' ? rem.local : 'Atendimento Online'}).`,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `praxis-rem-${rem.id}-${Date.now()}`,
        requireInteraction: true,
      };

      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, options);
            return;
          }
        }
        new Notification(title, options);
      } catch (err) {
        console.warn('Falha ao disparar notificação do sistema:', err);
      }
    }
  }

  testNotification(): Promise<boolean> {
    const dummy: LembreteConsulta = {
      id: 'test-lembrete',
      aprendenteId: 'demo',
      nomeAprendente: 'Lucas Mendes Vasconcelos (Demonstrativo)',
      tipoCompromisso: 'sessao_individual',
      data: new Date().toISOString().split('T')[0],
      horarioInicio: '14:30',
      duracaoMinutos: 50,
      fusoHorario: 'America/Sao_Paulo (GMT-3)',
      modalidade: 'presencial',
      local: 'Consultório Principal - Sala A',
      observacoes: 'Teste de volume, som harmônico e exibição de notificação.',
      recorrencia: 'nenhuma',
      alertasAntecedencia: [15],
      status: 'agendado',
    };

    return this.triggerReminderAlert(dummy, 'Alerta de Teste de Notificação')
      .then(() => true)
      .catch(() => false);
  }
}

export const notificationService = new NotificationService();
