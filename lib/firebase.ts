import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  Aprendente,
  Anamnese,
  Sessao,
  AvaliacaoPsicopedagogica,
  RelatorioPsicopedagogico,
  LembreteConsulta,
} from '@/types';

// 1. Initialize Firebase App and Services
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 2. Strict Error Handling conforming to FirestoreErrorInfo spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // If permission or document missing, client still successfully connected to server
    return true;
  }
}

// 4. Auth Methods
export function formatAuthError(error: unknown): string {
  if (!error) return 'Ocorreu um erro desconhecido na autenticação.';
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'Nenhuma conta encontrada com este e-mail.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Verifique a senha e tente novamente.';
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Tente entrar ou recupere sua senha.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Escolha uma senha com pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/popup-closed-by-user':
      return 'A janela de autenticação do Google foi fechada antes de concluir o login.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela pop-up do Google. Permita pop-ups para fazer login.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns minutos antes de tentar novamente.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a internet. Verifique sua rede.';
    default:
      return error instanceof Error ? error.message : 'Falha na autenticação. Verifique suas credenciais.';
  }
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return result.user;
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    throw error;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && displayName.trim()) {
      await updateProfile(result.user, {
        displayName: displayName.trim(),
      });
    }
    return result.user;
  } catch (error) {
    console.error('Email Sign-Up Error:', error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    console.error('Password Reset Error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// 5. User Profile in Firestore
export interface UserProfileData {
  id: string;
  email: string;
  nome: string;
  registroProfissional?: string;
  especialidade?: string;
  instituicao?: string;
  cidade?: string;
  telefone?: string;
  createdAt: string;
  updatedAt: string;
}

export async function syncUserProfile(
  user: FirebaseUser,
  extra?: {
    nome?: string;
    registro?: string;
    especialidade?: string;
    instituicao?: string;
    cidade?: string;
    telefone?: string;
  }
): Promise<UserProfileData | null> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);
    const now = new Date().toISOString();

    if (!existingSnap.exists()) {
      const data: UserProfileData = {
        id: user.uid,
        email: user.email || '',
        nome: extra?.nome || user.displayName || 'Profissional',
        registroProfissional: extra?.registro || '',
        especialidade: extra?.especialidade || 'Psicopedagogia Clínica',
        instituicao: extra?.instituicao || '',
        cidade: extra?.cidade || '',
        telefone: extra?.telefone || '',
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, data);
      return data;
    } else {
      const existingData = existingSnap.data() as UserProfileData;
      const data: UserProfileData = {
        id: user.uid,
        email: user.email || existingData.email,
        nome: extra?.nome || existingData.nome || user.displayName || 'Profissional',
        registroProfissional: extra?.registro !== undefined ? extra.registro : (existingData.registroProfissional || ''),
        especialidade: extra?.especialidade !== undefined ? extra.especialidade : (existingData.especialidade || 'Psicopedagogia Clínica'),
        instituicao: extra?.instituicao !== undefined ? extra.instituicao : (existingData.instituicao || ''),
        cidade: extra?.cidade !== undefined ? extra.cidade : (existingData.cidade || ''),
        telefone: extra?.telefone !== undefined ? extra.telefone : (existingData.telefone || ''),
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      };
      await setDoc(userRef, data, { merge: true });
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return null;
  }
}

// 6. Cloud Persistence & Synchronization Helpers
export const firestoreSync = {
  // User Profile
  async getUserProfile(userId: string): Promise<UserProfileData | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      return snap.exists() ? (snap.data() as UserProfileData) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  },

  async saveUserProfile(userId: string, data: Partial<UserProfileData>): Promise<void> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const now = new Date().toISOString();
      await setDoc(
        userRef,
        {
          ...data,
          id: userId,
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },
  // Aprendentes
  async saveAprendente(userId: string, item: Aprendente): Promise<void> {
    const path = `users/${userId}/aprendentes/${item.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'aprendentes', item.id);
      const snap = await getDoc(docRef);
      const now = new Date().toISOString();
      const existingData = snap.exists() ? snap.data() : null;

      const payload = {
        ...item,
        id: item.id,
        userId,
        codigoInterno: item.codigoInterno || 'APR-001',
        nomeCompleto: item.nomeCompleto,
        nomeSocial: item.nomeSocial || '',
        dataNascimento: item.dataNascimento,
        idadeCalculada: item.idadeCalculada || 0,
        status: item.status || 'acompanhamento',
        contatoPreferencial: item.contatoPreferencial || '',
        cidadeUf: item.cidadeUf || '',
        paisResponsaveis: item.paisResponsaveis || [],
        contextoEscolar: item.contextoEscolar || {},
        notasInternas: item.notasInternas || '',
        criadoEm: item.criadoEm || existingData?.criadoEm || now.split('T')[0],
        atualizadoEm: now.split('T')[0],
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async deleteAprendente(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/aprendentes/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'aprendentes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async getAprendentes(userId: string): Promise<Aprendente[]> {
    const path = `users/${userId}/aprendentes`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'aprendentes'));
      return snap.docs.map((d) => d.data() as unknown as Aprendente);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  // Anamneses
  async saveAnamnese(userId: string, item: Anamnese): Promise<void> {
    const path = `users/${userId}/anamneses/${item.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'anamneses', item.id);
      const snap = await getDoc(docRef);
      const now = new Date().toISOString();
      const existingData = snap.exists() ? snap.data() : null;

      const payload = {
        ...item,
        id: item.id,
        userId,
        aprendenteId: item.aprendenteId,
        status: item.status || 'rascunho',
        salvoEm: item.salvoEm || now,
        atualizadoEm: now.split('T')[0],
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getAnamneses(userId: string): Promise<Record<string, Anamnese>> {
    const path = `users/${userId}/anamneses`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'anamneses'));
      const dict: Record<string, Anamnese> = {};
      snap.docs.forEach((d) => {
        const item = d.data() as unknown as Anamnese;
        if (item.aprendenteId) {
          dict[item.aprendenteId] = item;
        } else {
          dict[item.id] = item;
        }
      });
      return dict;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async deleteAnamnese(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/anamneses/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'anamneses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Sessões
  async saveSessao(userId: string, item: Sessao): Promise<void> {
    const path = `users/${userId}/sessoes/${item.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'sessoes', item.id);
      const snap = await getDoc(docRef);
      const now = new Date().toISOString();
      const existingData = snap.exists() ? snap.data() : null;

      const payload = {
        ...item,
        id: item.id,
        userId,
        aprendenteId: item.aprendenteId,
        data: item.data,
        duracaoMinutos: Number(item.duracaoMinutos) || 50,
        modalidade: item.modalidade || 'presencial_consultorio',
        local: item.local || '',
        objetivo: item.objetivo || '',
        status: item.status || 'rascunho',
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getSessoes(userId: string): Promise<Sessao[]> {
    const path = `users/${userId}/sessoes`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'sessoes'));
      return snap.docs.map((d) => d.data() as unknown as Sessao);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async deleteSessao(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/sessoes/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'sessoes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Avaliações
  async saveAvaliacao(userId: string, item: AvaliacaoPsicopedagogica): Promise<void> {
    const path = `users/${userId}/avaliacoes/${item.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'avaliacoes', item.id);
      const snap = await getDoc(docRef);
      const now = new Date().toISOString();
      const existingData = snap.exists() ? snap.data() : null;

      const payload = {
        ...item,
        id: item.id,
        userId,
        aprendenteId: item.aprendenteId,
        status: item.status || 'rascunho',
        perguntaObjetivo: item.perguntaObjetivo || '',
        periodoAvaliacao: item.periodoAvaliacao || '',
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getAvaliacoes(userId: string): Promise<Record<string, AvaliacaoPsicopedagogica>> {
    const path = `users/${userId}/avaliacoes`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'avaliacoes'));
      const dict: Record<string, AvaliacaoPsicopedagogica> = {};
      snap.docs.forEach((d) => {
        const item = d.data() as unknown as AvaliacaoPsicopedagogica;
        if (item.aprendenteId) {
          dict[item.aprendenteId] = item;
        } else {
          dict[item.id] = item;
        }
      });
      return dict;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async deleteAvaliacao(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/avaliacoes/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'avaliacoes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Relatórios
  async saveRelatorio(userId: string, item: RelatorioPsicopedagogico): Promise<void> {
    const path = `users/${userId}/relatorios/${item.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'relatorios', item.id);
      const snap = await getDoc(docRef);
      const now = new Date().toISOString();
      const existingData = snap.exists() ? snap.data() : null;

      const payload = {
        ...item,
        id: item.id,
        userId,
        aprendenteId: item.aprendenteId,
        titulo: item.titulo,
        dataEmissao: item.dataCriacao || now.split('T')[0],
        status: item.status === 'arquivado' ? 'finalizado' : item.status,
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getRelatorios(userId: string): Promise<RelatorioPsicopedagogico[]> {
    const path = `users/${userId}/relatorios`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'relatorios'));
      return snap.docs.map((d) => d.data() as unknown as RelatorioPsicopedagogico);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async deleteRelatorio(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/relatorios/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'relatorios', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Lembretes
  async saveLembrete(userId: string, item: LembreteConsulta): Promise<void> {
    const path = `users/${userId}/lembretes/${item.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'lembretes', item.id);
      const snap = await getDoc(docRef);
      const now = new Date().toISOString();
      const existingData = snap.exists() ? snap.data() : null;

      const payload = {
        ...item,
        id: item.id,
        userId,
        aprendenteId: item.aprendenteId || '',
        titulo: item.nomeAprendente ? `${item.tipoCompromisso}: ${item.nomeAprendente}` : 'Compromisso',
        data: item.data,
        horario: item.horarioInicio || '09:00',
        concluido: item.status === 'concluido',
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async getLembretes(userId: string): Promise<LembreteConsulta[]> {
    const path = `users/${userId}/lembretes`;
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'lembretes'));
      return snap.docs.map((d) => d.data() as unknown as LembreteConsulta);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  },

  async deleteLembrete(userId: string, id: string): Promise<void> {
    const path = `users/${userId}/lembretes/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'lembretes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  // Load All User Data from Cloud in Parallel
  async loadAllUserData(userId: string): Promise<{
    aprendentes: Aprendente[];
    sessoes: Sessao[];
    anamneses: Record<string, Anamnese>;
    avaliacoes: Record<string, AvaliacaoPsicopedagogica>;
    relatorios: RelatorioPsicopedagogico[];
    lembretes: LembreteConsulta[];
  }> {
    const [aprendentes, sessoes, anamneses, avaliacoes, relatorios, lembretes] = await Promise.all([
      this.getAprendentes(userId),
      this.getSessoes(userId),
      this.getAnamneses(userId),
      this.getAvaliacoes(userId),
      this.getRelatorios(userId),
      this.getLembretes(userId),
    ]);

    return {
      aprendentes: aprendentes || [],
      sessoes: sessoes || [],
      anamneses: anamneses || {},
      avaliacoes: avaliacoes || {},
      relatorios: relatorios || [],
      lembretes: lembretes || [],
    };
  },
};

export { onAuthStateChanged, onSnapshot };
