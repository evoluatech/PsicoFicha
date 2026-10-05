'use client';

import React, { useId } from 'react';

interface PsicofichaLogoProps {
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const PsicofichaLogo: React.FC<PsicofichaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  // Dimension tokens tailored for responsive mobile and desktop viewports
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const titleSizes = {
    sm: 'text-sm font-extrabold tracking-tight',
    md: 'text-base font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl sm:text-4xl font-black tracking-tight',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  // Symmetrical, perfectly centered and balanced Clinical Emblem SVG
  // Canvas: 200 x 200, center origin at (100, 100)
  const Emblem = (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0 drop-shadow-[0_2px_10px_rgba(0,229,255,0.45)] select-none`}
      aria-label="Logo Psicoficha"
    >
      <defs>
        {/* Outer Squircle Container Gradient */}
        <linearGradient id={`bgSquircle_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14212b" />
          <stop offset="100%" stopColor="#070c10" />
        </linearGradient>

        {/* Clinical Clipboard Teal-Cyan Gradient */}
        <linearGradient id={`pfFolderGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="45%" stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#005f69" />
        </linearGradient>

        {/* Greek Psi (Ψ) Pure Luminous Gradient */}
        <linearGradient id={`pfPsiGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E0FFFF" />
          <stop offset="70%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#00C4CC" />
        </linearGradient>

        {/* Stylus / Pen Gradient */}
        <linearGradient id={`pfPenGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="60%" stopColor="#0099A8" />
          <stop offset="100%" stopColor="#005560" />
        </linearGradient>

        {/* Neon Glow Filter */}
        <filter id={`pfNeonGlow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00E5FF" floodOpacity="0.75" />
        </filter>

        {/* Soft Depth Shadow */}
        <filter id={`pfSoftShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* 1. Mobile App Icon Squircle Base (Curved Rounded Tile) */}
      <rect
        x="6"
        y="6"
        width="188"
        height="188"
        rx="44"
        fill={`url(#bgSquircle_${uid})`}
        stroke="#00E5FF"
        strokeWidth="2.5"
        strokeOpacity="0.35"
      />

      {/* Radial Aura inside Squircle */}
      <circle cx="100" cy="100" r="75" fill="#00E5FF" opacity="0.08" />

      {/* 2. Clinical Prancheta (Folder Backplate) — Perfectly Centered at X=96, Y=100 */}
      <g filter={`url(#pfSoftShadow_${uid})`}>
        {/* Main Folder Body */}
        <rect
          x="38"
          y="34"
          width="108"
          height="132"
          rx="18"
          fill={`url(#pfFolderGrad_${uid})`}
        />

        {/* Top Tab Projection */}
        <path
          d="M50 34 C50 34, 58 24, 72 24 L104 24 C114 24, 122 34, 128 34 Z"
          fill="#00E5FF"
          opacity="0.9"
        />

        {/* Metallic Top Clip (Centered at X=92) */}
        <g filter={`url(#pfNeonGlow_${uid})`}>
          <rect x="70" y="18" width="44" height="22" rx="7" fill="#00E5FF" />
          <rect x="83" y="24" width="18" height="6" rx="3" fill="#070c10" />
        </g>

        {/* High-Contrast Sheet (Inner Document) */}
        <rect
          x="46"
          y="46"
          width="92"
          height="108"
          rx="12"
          fill="#09131a"
          stroke="#00E5FF"
          strokeWidth="1.8"
          strokeOpacity="0.45"
        />
      </g>

      {/* 3. Attached Clinical Stylus / Pen (Right Side, Balanced) */}
      <g id="stylus" filter={`url(#pfSoftShadow_${uid})`}>
        {/* Pen Top Cap Ring */}
        <rect x="152" y="44" width="12" height="6" rx="2" fill="#00E5FF" />
        {/* Pen Clip */}
        <path
          d="M162 48 L166 48 C167 48, 168 50, 168 52 L168 76 C168 78, 167 80, 165 80 L162 80"
          fill="none"
          stroke="#00E5FF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Pen Body */}
        <rect x="153" y="50" width="10" height="70" rx="3" fill={`url(#pfPenGrad_${uid})`} />
        {/* Grip Rings */}
        <line x1="154" y1="102" x2="162" y2="102" stroke="#070c10" strokeWidth="1.5" />
        <line x1="154" y1="107" x2="162" y2="107" stroke="#070c10" strokeWidth="1.5" />
        <line x1="154" y1="112" x2="162" y2="112" stroke="#070c10" strokeWidth="1.5" />
        {/* Pen Tip Cone */}
        <path d="M153 120 L163 120 L158 132 Z" fill="#00E5FF" />
        {/* Pen Ballpoint Glow */}
        <circle cx="158" cy="134" r="1.5" fill="#FFFFFF" />
      </g>

      {/* 4. Greek Psi Symbol (Ψ) — 100% SYMMETRICAL & CENTERED AT X=92 ON THE SHEET */}
      <g filter={`url(#pfNeonGlow_${uid})`}>
        {/* Center Vertical Stem: Center X = 92, Width = 10 (87 to 97) */}
        <path
          d="M87 58 L97 58 L97 128 L104 128 L104 134 L80 134 L80 128 L87 128 Z"
          fill={`url(#pfPsiGrad_${uid})`}
        />

        {/* Left & Right Symmetrical Curved U-Arms (Flanking X=92) */}
        {/* Left Arm: X=62 to 92. Right Arm: X=92 to 122. Perfectly mirrored! */}
        <path
          d="M66 64 C66 64, 63 104, 92 104 C121 104, 118 64, 118 64 L109 64 C109 64, 110 94, 92 94 C74 94, 75 64, 75 64 Z"
          fill={`url(#pfPsiGrad_${uid})`}
        />

        {/* Top Serifs (Clean symmetrical caps) */}
        <rect x="63" y="62" width="14" height="4.5" rx="2" fill="#FFFFFF" />
        <rect x="107" y="62" width="14" height="4.5" rx="2" fill="#FFFFFF" />
        <rect x="85" y="56" width="14" height="4.5" rx="2" fill="#FFFFFF" />

        {/* Pedestal Base Accent */}
        <rect x="78" y="132" width="28" height="4.5" rx="2" fill="#FFFFFF" opacity="0.9" />
      </g>

      {/* Document Micro-Notations (Right side of sheet, subtle) */}
      <g stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" opacity="0.35">
        <line x1="114" y1="116" x2="128" y2="116" />
        <line x1="114" y1="124" x2="124" y2="124" />
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {Emblem}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {Emblem}
        <div className="mt-2.5 sm:mt-3">
          <span
            className={`block ${titleSizes[size]} text-[#007a82] dark:text-[#00E5FF] dark:drop-shadow-[0_0_12px_rgba(0,229,255,0.45)] tracking-tight`}
          >
            Psicoficha
          </span>
          {showSubtitle && (
            <span
              className={`block ${subtitleSizes[size]} font-medium text-slate-500 dark:text-[#67e8f9] tracking-wide mt-0.5 opacity-90`}
            >
              Psicopedagogia | Fichas &amp; Relatórios
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (Default for Topbar, Sidebar, Headers)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      {Emblem}
      <div className="flex flex-col text-left leading-none min-w-0">
        <span
          className={`${titleSizes[size]} leading-tight font-extrabold text-[#007a82] dark:text-[#00E5FF] dark:drop-shadow-[0_0_10px_rgba(0,229,255,0.4)] transition-colors truncate`}
        >
          Psicoficha
        </span>
        {showSubtitle && (
          <span
            className={`${subtitleSizes[size]} font-medium text-slate-500 dark:text-[#67e8f9]/80 leading-tight transition-colors mt-0.5 truncate hidden sm:block`}
          >
            Psicopedagogia | Fichas &amp; Relatórios
          </span>
        )}
      </div>
    </div>
  );
};
