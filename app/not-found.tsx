'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0b1015] text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center mb-4 border border-[#00E5FF]/20 shadow-lg shadow-[#00E5FF]/10">
        <Layers className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Página não encontrada</h1>
      <p className="text-xs sm:text-sm text-[#8da4ac] max-w-md mb-6">
        O endereço solicitado não existe ou foi movido. Você pode retornar à tela principal com segurança.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#00E5FF] hover:bg-[#38edff] text-[#0b1015] transition-all flex items-center gap-2 shadow-md shadow-[#00E5FF]/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Início</span>
      </Link>
    </div>
  );
}
