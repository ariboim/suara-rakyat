import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} shrink-0 rounded-2xl overflow-hidden shadow-md shadow-red-700/25 border border-amber-500/30 group-hover:scale-105 transition-transform bg-gradient-to-br from-red-700 to-red-950`}
      >
        <img
          src="/favicon.svg"
          alt="Logo Resmi Suara Rakyat"
          className="w-full h-full object-contain p-0.5"
          width="512"
          height="512"
          loading="eager"
        />
      </div>
      {showText && (
        <div className="text-left select-none">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-editorial uppercase">
              SUARA RAKYAT
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-700 text-white shadow-xs">
              Portal Warga
            </span>
          </div>
          <p className="text-[11px] text-slate-600 tracking-wide font-medium">
            Menyuarakan Kebenaran • Jurnalisme Warga Independen
          </p>
        </div>
      )}
    </div>
  );
};
