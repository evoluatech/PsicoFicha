'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  formatAuthError,
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  sendPasswordReset as fbSendPasswordReset,
} from '@/lib/firebase';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
  onSignInWithGoogle?: () => Promise<void>;
  onSignInWithEmail?: (email: string, pass: string) => Promise<void>;
  onSignUpWithEmail?: (email: string, pass: string, name?: string) => Promise<void>;
  onSendPasswordReset?: (email: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSignInWithGoogle,
  onSignInWithEmail,
  onSignUpWithEmail,
  onSendPasswordReset,
}) => {

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleSubmitting(true);
    try {
      if (onSignInWithGoogle) {
        await onSignInWithGoogle();
      } else {
        await fbSignInWithGoogle();
      }
      onClose();
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (mode === 'forgot') {
      setSubmitting(true);
      try {
        if (onSendPasswordReset) {
          await onSendPasswordReset(email);
        } else {
          await fbSendPasswordReset(email);
        }
        setSuccessMessage(
          'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada e spam.'
        );
      } catch (err) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMessage('As senhas digitadas não coincidem.');
        return;
      }

      setSubmitting(true);
      try {
        if (onSignUpWithEmail) {
          await onSignUpWithEmail(email, password, displayName);
        } else {
          await fbSignUpWithEmail(email, password, displayName);
        }
        onClose();
      } catch (err) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Default: 'login'
    setSubmitting(true);
    try {
      if (onSignInWithEmail) {
        await onSignInWithEmail(email, password);
      } else {
        await fbSignInWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#121c25] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#1e2d3b] overflow-hidden z-10 transition-colors">
        {/* Header Banner */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#1e2d3b] bg-slate-50/70 dark:bg-[#0b1015]/60 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#008B94]/10 dark:bg-[#00E5FF]/15 text-[#008B94] dark:text-[#00E5FF] flex items-center justify-center border border-[#008B94]/20 dark:border-[#00E5FF]/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2
                id="auth-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {mode === 'login' && 'Entrar na Plataforma'}
                {mode === 'register' && 'Criar Conta Profissional'}
                {mode === 'forgot' && 'Recuperar Acesso'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' && 'Acesse seus prontuários e sincronize com a nuvem segura do Psicoficha.'}
              {mode === 'register' && 'Cadastre-se para armazenar seus dados com segurança na nuvem.'}
              {mode === 'forgot' && 'Digite seu e-mail para receber as instruções de recuperação.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#1e2d3b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Quick Google Sign In (Gmail) Button */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                disabled={googleSubmitting || submitting}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-[#182633] text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1f3040] shadow-xs hover:shadow-sm transition-all disabled:opacity-60"
              >
                {googleSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#008B94] dark:text-[#00E5FF]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {mode === 'login'
                    ? 'Entrar com Gmail / Google'
                    : 'Cadastrar com Gmail / Google'}
                </span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-200 dark:border-[#1e2d3b]" />
                <span className="absolute px-3 bg-white dark:bg-[#121c25] text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  ou com e-mail e senha
                </span>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Profissional
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dra. Juliana Santos"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0b1015] border border-slate-200 dark:border-[#1e2d3b] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0b1015] border border-slate-200 dark:border-[#1e2d3b] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] font-medium text-[#008B94] dark:text-[#00E5FF] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0b1015] border border-slate-200 dark:border-[#1e2d3b] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite a mesma senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0b1015] border border-slate-200 dark:border-[#1e2d3b] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#008B94] dark:focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#008B94] hover:bg-[#007a82] dark:bg-[#00E5FF] dark:text-[#0b1015] dark:hover:bg-[#38edff] shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com E-mail</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Criar Conta e Conectar</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Enviar E-mail de Recuperação</span>
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#1e2d3b] text-center text-xs">
            {mode === 'login' ? (
              <p className="text-slate-500 dark:text-slate-400">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#008B94] dark:text-[#00E5FF] hover:underline"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-slate-500 dark:text-slate-400">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-[#008B94] dark:text-[#00E5FF] hover:underline"
                >
                  Fazer login
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#008B94] dark:text-[#00E5FF] hover:underline"
              >
                Voltar para o Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
