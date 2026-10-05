'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0b1015] text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/10">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
        Ops, algo inesperado ocorreu
      </h1>
      <p className="text-xs sm:text-sm text-[#8da4ac] max-w-md mb-6 leading-relaxed">
        Não se preocupe: todos os seus dados clínicos salvos no dispositivo continuam preservados com segurança.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#00E5FF] hover:bg-[#38edff] text-[#0b1015] transition-all flex items-center gap-2 shadow-md shadow-[#00E5FF]/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tentar Novamente</span>
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#121c25] hover:bg-[#182633] text-white border border-[#1e2d3b] transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4 text-[#8da4ac]" />
          <span>Ir para Início</span>
        </Link>
      </div>
    </div>
  );
}
