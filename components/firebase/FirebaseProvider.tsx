'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  sendPasswordReset as fbSendPasswordReset,
  signOutUser,
  testConnection,
  syncUserProfile,
  firestoreSync,
} from '@/lib/firebase';
import { storage } from '@/lib/storage';
import { AuthModal } from '@/components/auth/AuthModal';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  connected: boolean;
  syncing: boolean;
  lastSynced: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncAllToCloud: () => Promise<{ success: boolean; count: number; error?: string }>;
  reloadFromCloud: () => Promise<{ success: boolean; count: number; error?: string }>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  connected: false,
  syncing: false,
  lastSynced: null,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  sendPasswordReset: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  syncAllToCloud: async () => ({ success: false, count: 0 }),
  reloadFromCloud: async () => ({ success: false, count: 0 }),
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  const openAuthModal = useCallback((mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // 1. Initial connection test
  useEffect(() => {
    let mounted = true;
    testConnection().then((isOk) => {
      if (mounted) setConnected(isOk);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Auth listener with User-Scoped Isolation and Cloud Hydration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Set user context in local storage isolation
        storage.setActiveUser(currentUser.uid);

        // Sync user profile to Firestore
        try {
          let profNome = currentUser.displayName || 'Profissional';
          let profRegistro = 'ABPp';
          try {
            const raw = localStorage.getItem('praxis_profissional');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.nome) profNome = parsed.nome;
              if (parsed.registro) profRegistro = parsed.registro;
            }
          } catch {}

          await syncUserProfile(currentUser, {
            nome: profNome,
            registro: profRegistro,
          });
        } catch (e) {
          console.warn('Initial profile sync warning:', e);
        }

        // Hydrate from Firestore to show this user's saved data
        setSyncing(true);
        try {
          const [cloudData, cloudProfile] = await Promise.all([
            firestoreSync.loadAllUserData(currentUser.uid),
            firestoreSync.getUserProfile(currentUser.uid),
          ]);

          const hasCloudData =
            cloudData.aprendentes.length > 0 ||
            cloudData.sessoes.length > 0 ||
            Object.keys(cloudData.anamneses).length > 0 ||
            Object.keys(cloudData.avaliacoes).length > 0 ||
            cloudData.relatorios.length > 0 ||
            cloudData.lembretes.length > 0;

          if (hasCloudData) {
            storage.hydrateUser(currentUser.uid, {
              ...cloudData,
              perfil: cloudProfile ? {
                nome: cloudProfile.nome,
                registro: cloudProfile.registroProfissional || 'ABPp',
                instituicao: cloudProfile.instituicao,
                cidade: cloudProfile.cidade,
                especialidade: cloudProfile.especialidade,
                telefone: cloudProfile.telefone,
              } : undefined,
            });
          } else {
            // New user on cloud: storage starts clean and empty for this user account
            storage.init();
            if (cloudProfile) {
              storage.saveProfissional({
                nome: cloudProfile.nome,
                registro: cloudProfile.registroProfissional || 'ABPp',
                instituicao: cloudProfile.instituicao,
                cidade: cloudProfile.cidade,
                especialidade: cloudProfile.especialidade,
                telefone: cloudProfile.telefone,
              });
            }
          }
          const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          setLastSynced(nowTime);
        } catch (err) {
          console.warn('Error hydrating user data from cloud:', err);
        } finally {
          setSyncing(false);
        }
      } else {
        // Logged out: reset active user so NO user data leaks into other accounts
        storage.setActiveUser(null);
        setLastSynced(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Reload from Cloud
  const reloadFromCloud = useCallback(async () => {
    if (!user) {
      return { success: false, count: 0, error: 'Faça login para carregar os dados da nuvem.' };
    }
    setSyncing(true);
    try {
      const [cloudData, cloudProfile] = await Promise.all([
        firestoreSync.loadAllUserData(user.uid),
        firestoreSync.getUserProfile(user.uid),
      ]);

      storage.hydrateUser(user.uid, {
        ...cloudData,
        perfil: cloudProfile ? {
          nome: cloudProfile.nome,
          registro: cloudProfile.registroProfissional || 'ABPp',
          instituicao: cloudProfile.instituicao,
          cidade: cloudProfile.cidade,
          especialidade: cloudProfile.especialidade,
          telefone: cloudProfile.telefone,
        } : undefined,
      });

      const totalCount =
        cloudData.aprendentes.length +
        cloudData.sessoes.length +
        Object.keys(cloudData.anamneses).length +
        Object.keys(cloudData.avaliacoes).length +
        cloudData.relatorios.length +
        cloudData.lembretes.length;

      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSynced(nowTime);
      return { success: true, count: totalCount };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar da nuvem';
      return { success: false, count: 0, error: msg };
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // 3. Sync all local data to cloud
  const syncAllToCloud = useCallback(async () => {
    if (!user) {
      return { success: false, count: 0, error: 'Faça login com sua conta para sincronizar na nuvem.' };
    }
    setSyncing(true);
    let count = 0;
    try {
      // Sync profile
      const prof = storage.getProfissional();
      if (prof) {
        await firestoreSync.saveUserProfile(user.uid, {
          nome: prof.nome,
          registroProfissional: prof.registro,
          instituicao: prof.instituicao,
          cidade: prof.cidade,
          especialidade: prof.especialidade,
          telefone: prof.telefone,
        });
      }

      const aprendentes = storage.getAprendentes();
      for (const a of aprendentes) {
        await firestoreSync.saveAprendente(user.uid, a);
        count++;
      }

      const sessoes = storage.getSessoes();
      for (const s of sessoes) {
        await firestoreSync.saveSessao(user.uid, s);
        count++;
      }

      const anamneses = Object.values(storage.getAnamneses());
      for (const an of anamneses) {
        await firestoreSync.saveAnamnese(user.uid, an);
        count++;
      }

      const avaliacoes = Object.values(storage.getAvaliacoes());
      for (const av of avaliacoes) {
        await firestoreSync.saveAvaliacao(user.uid, av);
        count++;
      }

      const relatorios = storage.getRelatorios();
      for (const r of relatorios) {
        await firestoreSync.saveRelatorio(user.uid, r);
        count++;
      }

      const lembretes = storage.getLembretes();
      for (const l of lembretes) {
        await firestoreSync.saveLembrete(user.uid, l);
        count++;
      }

      const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSynced(nowTime);
      return { success: true, count };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na sincronização';
      return { success: false, count, error: msg };
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Auth Operations
  const handleSignInWithGoogle = async () => {
    await fbSignInWithGoogle();
  };

  const handleSignInWithEmail = async (email: string, pass: string) => {
    await fbSignInWithEmail(email, pass);
  };

  const handleSignUpWithEmail = async (email: string, pass: string, name?: string) => {
    await fbSignUpWithEmail(email, pass, name);
  };

  const handleSendPasswordReset = async (email: string) => {
    await fbSendPasswordReset(email);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        connected,
        syncing,
        lastSynced,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        sendPasswordReset: handleSendPasswordReset,
        signIn: handleSignInWithGoogle,
        signOut: handleSignOut,
        syncAllToCloud,
        reloadFromCloud,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignInWithEmail={handleSignInWithEmail}
        onSignUpWithEmail={handleSignUpWithEmail}
        onSendPasswordReset={handleSendPasswordReset}
      />
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
