import {
  Aprendente,
  Anamnese,
  Sessao,
  AvaliacaoPsicopedagogica,
  RelatorioPsicopedagogico,
  LembreteConsulta,
  ConfiguracoesApp,
  RegistroEvolucaoDominio,
} from '@/types';
import {
  MOCK_APRENDENTES,
  MOCK_SESSOES,
  MOCK_ANAMNESES,
  MOCK_AVALIACOES,
  MOCK_RELATORIOS,
  MOCK_LEMBRETES,
  MOCK_EVOLUCAO_DOMINIOS,
  CONFIGURACOES_PADRAO,
} from './mock-data';
import { firestoreSync } from './firebase';

let activeUserId: string | null = null;

function getActiveKey(resource: string): string {
  if (activeUserId) {
    return `praxis_u_${activeUserId}_${resource}_v1`;
  }
  return `praxis_guest_${resource}_v1`;
}

const notifyStorageChange = (key: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('praxis_storage_updated', { detail: { key } }));
  }
};

export const storage = {
  // User Session Management & Multi-tenant Isolation
  setActiveUser(userId: string | null) {
    activeUserId = userId;
    if (typeof window !== 'undefined') {
      if (userId) {
        localStorage.setItem('praxis_active_user_uid', userId);
      } else {
        localStorage.removeItem('praxis_active_user_uid');
      }
    }
    this.init();
    notifyStorageChange('active_user_switched');
  },

  getActiveUser(): string | null {
    if (activeUserId) return activeUserId;
    if (typeof window !== 'undefined') {
      activeUserId = localStorage.getItem('praxis_active_user_uid');
      return activeUserId;
    }
    return null;
  },

  hydrateUser(
    userId: string,
    data: {
      aprendentes: Aprendente[];
      sessoes: Sessao[];
      anamneses: Record<string, Anamnese>;
      avaliacoes: Record<string, AvaliacaoPsicopedagogica>;
      relatorios: RelatorioPsicopedagogico[];
      lembretes: LembreteConsulta[];
      perfil?: {
        nome: string;
        registro: string;
        instituicao?: string;
        cidade?: string;
        especialidade?: string;
        telefone?: string;
      };
    }
  ) {
    if (typeof window === 'undefined') return;
    activeUserId = userId;
    localStorage.setItem('praxis_active_user_uid', userId);

    localStorage.setItem(getActiveKey('aprendentes'), JSON.stringify(data.aprendentes || []));
    localStorage.setItem(getActiveKey('sessoes'), JSON.stringify(data.sessoes || []));
    localStorage.setItem(getActiveKey('anamneses'), JSON.stringify(data.anamneses || {}));
    localStorage.setItem(getActiveKey('avaliacoes'), JSON.stringify(data.avaliacoes || {}));
    localStorage.setItem(getActiveKey('relatorios'), JSON.stringify(data.relatorios || []));
    localStorage.setItem(getActiveKey('lembretes'), JSON.stringify(data.lembretes || []));

    if (data.perfil) {
      localStorage.setItem(getActiveKey('profissional'), JSON.stringify(data.perfil));
      localStorage.setItem('praxis_profissional', JSON.stringify(data.perfil));
    }

    notifyStorageChange('user_hydrated');
  },

  getProfissional(): {
    nome: string;
    registro: string;
    instituicao?: string;
    cidade?: string;
    especialidade?: string;
    telefone?: string;
  } {
    if (typeof window === 'undefined') {
      return { nome: 'Dra. Gabriela Andrade', registro: 'ABPp 14.892/SP' };
    }
    const userKey = getActiveKey('profissional');
    const raw = localStorage.getItem(userKey) || localStorage.getItem('praxis_profissional');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      nome: 'Dra. Gabriela Andrade',
      registro: 'ABPp 14.892/SP',
      instituicao: 'Consultório Psicopedagógico Aprender',
      cidade: 'São Paulo - SP',
      especialidade: 'Psicopedagogia Clínica & Institucional',
      telefone: '(11) 98765-4321',
    };
  },

  saveProfissional(dados: {
    nome: string;
    registro: string;
    instituicao?: string;
    cidade?: string;
    especialidade?: string;
    telefone?: string;
  }) {
    if (typeof window === 'undefined') return;
    const userKey = getActiveKey('profissional');
    localStorage.setItem(userKey, JSON.stringify(dados));
    localStorage.setItem('praxis_profissional', JSON.stringify(dados));

    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.saveUserProfile(uid, {
        nome: dados.nome,
        registroProfissional: dados.registro,
        instituicao: dados.instituicao,
        cidade: dados.cidade,
        especialidade: dados.especialidade,
        telefone: dados.telefone,
      }).catch(console.error);
    }

    notifyStorageChange('profissional_updated');
  },

  init() {
    if (typeof window === 'undefined') return;

    if (!activeUserId) {
      activeUserId = localStorage.getItem('praxis_active_user_uid');
    }

    // If guest mode (unauthenticated) and empty, seed demonstrative data
    if (!activeUserId) {
      const kApr = getActiveKey('aprendentes');
      if (localStorage.getItem(kApr) === null) {
        localStorage.setItem(kApr, JSON.stringify(MOCK_APRENDENTES));
      }
      const kSes = getActiveKey('sessoes');
      if (localStorage.getItem(kSes) === null) {
        localStorage.setItem(kSes, JSON.stringify(MOCK_SESSOES));
      }
      const kAnam = getActiveKey('anamneses');
      if (localStorage.getItem(kAnam) === null) {
        localStorage.setItem(kAnam, JSON.stringify(MOCK_ANAMNESES));
      }
      const kAv = getActiveKey('avaliacoes');
      if (localStorage.getItem(kAv) === null) {
        localStorage.setItem(kAv, JSON.stringify(MOCK_AVALIACOES));
      }
      const kRel = getActiveKey('relatorios');
      if (localStorage.getItem(kRel) === null) {
        localStorage.setItem(kRel, JSON.stringify(MOCK_RELATORIOS));
      }
      const kLemb = getActiveKey('lembretes');
      if (localStorage.getItem(kLemb) === null) {
        localStorage.setItem(kLemb, JSON.stringify(MOCK_LEMBRETES));
      }
      const kEvo = getActiveKey('evolucao');
      if (localStorage.getItem(kEvo) === null) {
        localStorage.setItem(kEvo, JSON.stringify(MOCK_EVOLUCAO_DOMINIOS));
      }
      const kCfg = getActiveKey('config');
      if (localStorage.getItem(kCfg) === null) {
        localStorage.setItem(kCfg, JSON.stringify(CONFIGURACOES_PADRAO));
      }
      const kLix = getActiveKey('lixeira');
      if (localStorage.getItem(kLix) === null) {
        localStorage.setItem(kLix, JSON.stringify([]));
      }
    } else {
      // Authenticated User: Start clean if not initialized yet
      const kApr = getActiveKey('aprendentes');
      if (localStorage.getItem(kApr) === null) {
        localStorage.setItem(kApr, JSON.stringify([]));
      }
      const kSes = getActiveKey('sessoes');
      if (localStorage.getItem(kSes) === null) {
        localStorage.setItem(kSes, JSON.stringify([]));
      }
      const kAnam = getActiveKey('anamneses');
      if (localStorage.getItem(kAnam) === null) {
        localStorage.setItem(kAnam, JSON.stringify({}));
      }
      const kAv = getActiveKey('avaliacoes');
      if (localStorage.getItem(kAv) === null) {
        localStorage.setItem(kAv, JSON.stringify({}));
      }
      const kRel = getActiveKey('relatorios');
      if (localStorage.getItem(kRel) === null) {
        localStorage.setItem(kRel, JSON.stringify([]));
      }
      const kLemb = getActiveKey('lembretes');
      if (localStorage.getItem(kLemb) === null) {
        localStorage.setItem(kLemb, JSON.stringify([]));
      }
      const kCfg = getActiveKey('config');
      if (localStorage.getItem(kCfg) === null) {
        localStorage.setItem(kCfg, JSON.stringify(CONFIGURACOES_PADRAO));
      }
      const kLix = getActiveKey('lixeira');
      if (localStorage.getItem(kLix) === null) {
        localStorage.setItem(kLix, JSON.stringify([]));
      }
    }
  },

  // Aprendentes
  getAprendentes(): Aprendente[] {
    if (typeof window === 'undefined') return [];
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('aprendentes'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getAprendenteById(id: string): Aprendente | undefined {
    return this.getAprendentes().find((a) => a.id === id);
  },

  saveAprendente(item: Aprendente): Aprendente {
    const list = this.getAprendentes();
    const index = list.findIndex((a) => a.id === item.id);
    item.atualizadoEm = new Date().toISOString().split('T')[0];
    let updated: Aprendente[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = item;
    } else {
      updated = [item, ...list];
    }
    const key = getActiveKey('aprendentes');
    localStorage.setItem(key, JSON.stringify(updated));
    notifyStorageChange(key);

    // Direct background sync to Firestore if user logged in
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.saveAprendente(uid, item).catch((err) => {
        console.warn('Auto cloud sync saveAprendente failed:', err);
      });
    }

    return item;
  },

  deleteAprendente(id: string): boolean {
    const list = this.getAprendentes();
    const target = list.find((a) => a.id === id);
    if (!target) return false;

    // Move to trash
    const lixeira = this.getLixeira();
    lixeira.unshift({
      tipo: 'aprendente',
      id: target.id,
      titulo: target.nomeCompleto,
      removidoEm: new Date().toISOString(),
      item: target,
    });
    localStorage.setItem(getActiveKey('lixeira'), JSON.stringify(lixeira));

    const filtered = list.filter((a) => a.id !== id);
    const key = getActiveKey('aprendentes');
    localStorage.setItem(key, JSON.stringify(filtered));
    notifyStorageChange(key);

    // Direct background delete in Firestore if user logged in
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.deleteAprendente(uid, id).catch((err) => {
        console.warn('Auto cloud deleteAprendente failed:', err);
      });
    }

    return true;
  },

  // Sessões
  getSessoes(): Sessao[] {
    if (typeof window === 'undefined') return [];
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('sessoes'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getSessoesByAprendente(aprendenteId: string): Sessao[] {
    return this.getSessoes()
      .filter((s) => s.aprendenteId === aprendenteId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  },

  saveSessao(sessao: Sessao): Sessao {
    const list = this.getSessoes();
    const index = list.findIndex((s) => s.id === sessao.id);
    let updated: Sessao[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = sessao;
    } else {
      updated = [sessao, ...list];
    }
    const key = getActiveKey('sessoes');
    localStorage.setItem(key, JSON.stringify(updated));
    notifyStorageChange(key);

    // Direct background sync to Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.saveSessao(uid, sessao).catch((err) => {
        console.warn('Auto cloud sync saveSessao failed:', err);
      });
    }

    return sessao;
  },

  deleteSessao(id: string): boolean {
    const list = this.getSessoes();
    const target = list.find((s) => s.id === id);
    if (!target) return false;
    const lixeira = this.getLixeira();
    lixeira.unshift({
      tipo: 'sessao',
      id: target.id,
      titulo: `Sessão de ${target.data}`,
      removidoEm: new Date().toISOString(),
      item: target,
    });
    localStorage.setItem(getActiveKey('lixeira'), JSON.stringify(lixeira));

    const filtered = list.filter((s) => s.id !== id);
    const key = getActiveKey('sessoes');
    localStorage.setItem(key, JSON.stringify(filtered));
    notifyStorageChange(key);

    // Direct background delete in Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.deleteSessao(uid, id).catch((err) => {
        console.warn('Auto cloud deleteSessao failed:', err);
      });
    }

    return true;
  },

  // Anamnese
  getAnamneses(): Record<string, Anamnese> {
    if (typeof window === 'undefined') return {};
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('anamneses'));
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getAnamneseByAprendente(aprendenteId: string): Anamnese | undefined {
    const dict = this.getAnamneses();
    return dict[aprendenteId];
  },

  saveAnamnese(anamnese: Anamnese): Anamnese {
    const dict = this.getAnamneses();
    anamnese.atualizadoEm = new Date().toISOString().split('T')[0];
    anamnese.salvoEm = new Date().toISOString();
    dict[anamnese.aprendenteId] = anamnese;
    const key = getActiveKey('anamneses');
    localStorage.setItem(key, JSON.stringify(dict));
    notifyStorageChange(key);

    // Direct background sync to Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.saveAnamnese(uid, anamnese).catch((err) => {
        console.warn('Auto cloud sync saveAnamnese failed:', err);
      });
    }

    return anamnese;
  },

  deleteAnamnese(aprendenteId: string): boolean {
    const dict = this.getAnamneses();
    const target = dict[aprendenteId];
    if (!target) return false;

    // Move to trash
    const lixeira = this.getLixeira();
    lixeira.unshift({
      tipo: 'anamnese',
      id: target.id,
      titulo: `Anamnese do Aprendente`,
      removidoEm: new Date().toISOString(),
      item: target,
    });
    localStorage.setItem(getActiveKey('lixeira'), JSON.stringify(lixeira));

    delete dict[aprendenteId];
    const key = getActiveKey('anamneses');
    localStorage.setItem(key, JSON.stringify(dict));
    notifyStorageChange(key);

    // Direct background delete in Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.deleteAnamnese(uid, target.id).catch((err) => {
        console.warn('Auto cloud deleteAnamnese failed:', err);
      });
    }

    return true;
  },

  // Avaliação
  getAvaliacoes(): Record<string, AvaliacaoPsicopedagogica> {
    if (typeof window === 'undefined') return {};
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('avaliacoes'));
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getAvaliacaoByAprendente(aprendenteId: string): AvaliacaoPsicopedagogica | undefined {
    const dict = this.getAvaliacoes();
    return dict[aprendenteId];
  },

  saveAvaliacao(avaliacao: AvaliacaoPsicopedagogica): AvaliacaoPsicopedagogica {
    const dict = this.getAvaliacoes();
    dict[avaliacao.aprendenteId] = avaliacao;
    const key = getActiveKey('avaliacoes');
    localStorage.setItem(key, JSON.stringify(dict));
    notifyStorageChange(key);

    // Direct background sync to Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.saveAvaliacao(uid, avaliacao).catch((err) => {
        console.warn('Auto cloud sync saveAvaliacao failed:', err);
      });
    }

    return avaliacao;
  },

  deleteAvaliacao(aprendenteId: string): boolean {
    const dict = this.getAvaliacoes();
    const target = dict[aprendenteId];
    if (!target) return false;

    // Move to trash
    const lixeira = this.getLixeira();
    lixeira.unshift({
      tipo: 'avaliacao',
      id: target.id,
      titulo: `Avaliação Psicopedagógica`,
      removidoEm: new Date().toISOString(),
      item: target,
    });
    localStorage.setItem(getActiveKey('lixeira'), JSON.stringify(lixeira));

    delete dict[aprendenteId];
    const key = getActiveKey('avaliacoes');
    localStorage.setItem(key, JSON.stringify(dict));
    notifyStorageChange(key);

    // Direct background delete in Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.deleteAvaliacao(uid, target.id).catch((err) => {
        console.warn('Auto cloud deleteAvaliacao failed:', err);
      });
    }

    return true;
  },

  // Relatórios
  getRelatorios(): RelatorioPsicopedagogico[] {
    if (typeof window === 'undefined') return [];
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('relatorios'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getRelatorioById(id: string): RelatorioPsicopedagogico | undefined {
    return this.getRelatorios().find((r) => r.id === id);
  },

  saveRelatorio(rel: RelatorioPsicopedagogico): RelatorioPsicopedagogico {
    const list = this.getRelatorios();
    const index = list.findIndex((r) => r.id === rel.id);
    let updated: RelatorioPsicopedagogico[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = rel;
    } else {
      updated = [rel, ...list];
    }
    const key = getActiveKey('relatorios');
    localStorage.setItem(key, JSON.stringify(updated));
    notifyStorageChange(key);

    // Direct background sync to Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.saveRelatorio(uid, rel).catch((err) => {
        console.warn('Auto cloud sync saveRelatorio failed:', err);
      });
    }

    return rel;
  },

  deleteRelatorio(id: string): boolean {
    const list = this.getRelatorios();
    const target = list.find((r) => r.id === id);
    if (!target) return false;
    const lixeira = this.getLixeira();
    lixeira.unshift({
      tipo: 'relatorio',
      id: target.id,
      titulo: target.titulo,
      removidoEm: new Date().toISOString(),
      item: target,
    });
    localStorage.setItem(getActiveKey('lixeira'), JSON.stringify(lixeira));

    const filtered = list.filter((r) => r.id !== id);
    const key = getActiveKey('relatorios');
    localStorage.setItem(key, JSON.stringify(filtered));
    notifyStorageChange(key);

    // Direct background delete in Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.deleteRelatorio(uid, id).catch((err) => {
        console.warn('Auto cloud deleteRelatorio failed:', err);
      });
    }

    return true;
  },

  // Lembretes
  getLembretes(): LembreteConsulta[] {
    if (typeof window === 'undefined') return [];
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('lembretes'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getLembreteById(id: string): LembreteConsulta | undefined {
    return this.getLembretes().find((l) => l.id === id);
  },

  saveLembrete(lembrete: LembreteConsulta): LembreteConsulta {
    const list = this.getLembretes();
    const index = list.findIndex((l) => l.id === lembrete.id);
    let updated: LembreteConsulta[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = lembrete;
    } else {
      updated = [lembrete, ...list];
    }
    const key = getActiveKey('lembretes');
    localStorage.setItem(key, JSON.stringify(updated));
    notifyStorageChange(key);

    // Direct background sync to Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.saveLembrete(uid, lembrete).catch((err) => {
        console.warn('Auto cloud sync saveLembrete failed:', err);
      });
    }

    return lembrete;
  },

  deleteLembrete(id: string): boolean {
    const list = this.getLembretes();
    const filtered = list.filter((l) => l.id !== id);
    const key = getActiveKey('lembretes');
    localStorage.setItem(key, JSON.stringify(filtered));
    notifyStorageChange(key);

    // Direct background delete in Firestore
    const uid = this.getActiveUser();
    if (uid) {
      firestoreSync.deleteLembrete(uid, id).catch((err) => {
        console.warn('Auto cloud deleteLembrete failed:', err);
      });
    }

    return true;
  },

  // Evolução Domínios
  getEvolucao(aprendenteId: string): RegistroEvolucaoDominio[] {
    if (typeof window === 'undefined') return [];
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('evolucao'));
      const dict = data ? JSON.parse(data) : {};
      return dict[aprendenteId] || [];
    } catch {
      return [];
    }
  },

  saveEvolucao(aprendenteId: string, registros: RegistroEvolucaoDominio[]) {
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('evolucao'));
      const dict = data ? JSON.parse(data) : {};
      dict[aprendenteId] = registros;
      const key = getActiveKey('evolucao');
      localStorage.setItem(key, JSON.stringify(dict));
      notifyStorageChange(key);
    } catch (e) {
      console.error('Erro ao salvar evolução:', e);
    }
  },

  // Configurações
  getConfiguracoes(): ConfiguracoesApp {
    if (typeof window === 'undefined') return CONFIGURACOES_PADRAO;
    this.init();
    try {
      const data = localStorage.getItem(getActiveKey('config'));
      return data ? JSON.parse(data) : CONFIGURACOES_PADRAO;
    } catch {
      return CONFIGURACOES_PADRAO;
    }
  },

  saveConfiguracoes(config: ConfiguracoesApp): ConfiguracoesApp {
    const key = getActiveKey('config');
    localStorage.setItem(key, JSON.stringify(config));
    notifyStorageChange(key);
    return config;
  },

  // Lixeira
  getLixeira(): Array<{ tipo: string; id: string; titulo: string; removidoEm: string; item: any }> {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(getActiveKey('lixeira'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  restoreFromLixeira(id: string): boolean {
    const lixeira = this.getLixeira();
    const entry = lixeira.find((item) => item.id === id);
    if (!entry) return false;

    if (entry.tipo === 'aprendente') {
      const list = this.getAprendentes();
      entry.item.status = 'acompanhamento';
      list.push(entry.item);
      localStorage.setItem(getActiveKey('aprendentes'), JSON.stringify(list));
      notifyStorageChange(getActiveKey('aprendentes'));
    } else if (entry.tipo === 'sessao') {
      const list = this.getSessoes();
      list.push(entry.item);
      localStorage.setItem(getActiveKey('sessoes'), JSON.stringify(list));
      notifyStorageChange(getActiveKey('sessoes'));
    } else if (entry.tipo === 'relatorio') {
      const list = this.getRelatorios();
      entry.item.status = 'em_revisao';
      list.push(entry.item);
      localStorage.setItem(getActiveKey('relatorios'), JSON.stringify(list));
      notifyStorageChange(getActiveKey('relatorios'));
    } else if (entry.tipo === 'anamnese') {
      const dict = this.getAnamneses();
      dict[entry.item.aprendenteId] = entry.item;
      localStorage.setItem(getActiveKey('anamneses'), JSON.stringify(dict));
      notifyStorageChange(getActiveKey('anamneses'));
    } else if (entry.tipo === 'avaliacao') {
      const dict = this.getAvaliacoes();
      dict[entry.item.aprendenteId] = entry.item;
      localStorage.setItem(getActiveKey('avaliacoes'), JSON.stringify(dict));
      notifyStorageChange(getActiveKey('avaliacoes'));
    }

    const updatedLixeira = lixeira.filter((item) => item.id !== id);
    localStorage.setItem(getActiveKey('lixeira'), JSON.stringify(updatedLixeira));
    notifyStorageChange(getActiveKey('lixeira'));
    return true;
  },

  emptyLixeira() {
    const key = getActiveKey('lixeira');
    localStorage.setItem(key, JSON.stringify([]));
    notifyStorageChange(key);
  },

  // Demo Reset & Backup
  restaurarDadosDemonstracao() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getActiveKey('aprendentes'), JSON.stringify(MOCK_APRENDENTES));
    localStorage.setItem(getActiveKey('sessoes'), JSON.stringify(MOCK_SESSOES));
    localStorage.setItem(getActiveKey('anamneses'), JSON.stringify(MOCK_ANAMNESES));
    localStorage.setItem(getActiveKey('avaliacoes'), JSON.stringify(MOCK_AVALIACOES));
    localStorage.setItem(getActiveKey('relatorios'), JSON.stringify(MOCK_RELATORIOS));
    localStorage.setItem(getActiveKey('lembretes'), JSON.stringify(MOCK_LEMBRETES));
    localStorage.setItem(getActiveKey('evolucao'), JSON.stringify(MOCK_EVOLUCAO_DOMINIOS));
    localStorage.setItem(getActiveKey('config'), JSON.stringify(CONFIGURACOES_PADRAO));
    localStorage.setItem(getActiveKey('lixeira'), JSON.stringify([]));
    notifyStorageChange('all');
  },

  exportarBackupJson(): string {
    if (typeof window === 'undefined') return '{}';
    const payload = {
      exportadoEm: new Date().toISOString(),
      versaoApp: '1.0.0',
      aprendentes: this.getAprendentes(),
      sessoes: this.getSessoes(),
      anamneses: this.getAnamneses(),
      avaliacoes: this.getAvaliacoes(),
      relatorios: this.getRelatorios(),
      lembretes: this.getLembretes(),
      evolucao: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(getActiveKey('evolucao')) || '{}') : {},
      configuracoes: this.getConfiguracoes(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importarBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.aprendentes && Array.isArray(data.aprendentes)) {
        localStorage.setItem(getActiveKey('aprendentes'), JSON.stringify(data.aprendentes));
      }
      if (data.sessoes && Array.isArray(data.sessoes)) {
        localStorage.setItem(getActiveKey('sessoes'), JSON.stringify(data.sessoes));
      }
      if (data.anamneses) {
        localStorage.setItem(getActiveKey('anamneses'), JSON.stringify(data.anamneses));
      }
      if (data.avaliacoes) {
        localStorage.setItem(getActiveKey('avaliacoes'), JSON.stringify(data.avaliacoes));
      }
      if (data.relatorios && Array.isArray(data.relatorios)) {
        localStorage.setItem(getActiveKey('relatorios'), JSON.stringify(data.relatorios));
      }
      if (data.lembretes && Array.isArray(data.lembretes)) {
        localStorage.setItem(getActiveKey('lembretes'), JSON.stringify(data.lembretes));
      }
      if (data.evolucao) {
        localStorage.setItem(getActiveKey('evolucao'), JSON.stringify(data.evolucao));
      }
      if (data.configuracoes) {
        localStorage.setItem(getActiveKey('config'), JSON.stringify(data.configuracoes));
      }
      notifyStorageChange('all');
      return true;
    } catch (err) {
      console.error('Falha ao importar JSON:', err);
      return false;
    }
  },

  getStorageUsage(): { usadoKb: number; percentualEstimado: number } {
    if (typeof window === 'undefined') return { usadoKb: 0, percentualEstimado: 0 };
    let totalBytes = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith('praxis_')) {
        totalBytes += (localStorage[key]?.length || 0) * 2;
      }
    }
    const usadoKb = Math.round(totalBytes / 1024);
    const percentualEstimado = Math.min(100, Math.round((usadoKb / 5120) * 100));
    return { usadoKb, percentualEstimado };
  },
};
