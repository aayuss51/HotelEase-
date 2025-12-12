import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  // "iOS 26 Glassy" Base Styles
  // - Rounded 2xl for modern pill shape
  // - High backdrop blur for depth
  // - Active scale for tactile feel
  const baseStyles = "group relative inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.96] backdrop-blur-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    // Emerald Glass
    primary: `
      bg-emerald-600/85 text-white 
      hover:bg-emerald-500/90 
      border-t border-white/30 border-b border-emerald-900/10
      shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.6)]
      ring-1 ring-white/10
    `,
    // Frosty Glass (Secondary)
    secondary: `
      bg-white/70 text-gray-900 
      hover:bg-white/90 
      border border-white/60 
      shadow-sm hover:shadow-md
    `,
    // Ruby Glass (Danger)
    danger: `
      bg-red-600/85 text-white 
      hover:bg-red-500/90 
      border-t border-white/30 border-b border-red-900/10
      shadow-[0_8px_20px_-6px_rgba(220,38,38,0.4)] hover:shadow-[0_12px_28px_-6px_rgba(220,38,38,0.6)]
      ring-1 ring-white/10
    `,
    // Clear Outline
    outline: `
      bg-transparent text-gray-700 
      border border-gray-400/30 
      hover:bg-gray-100/20 hover:border-gray-400/60
      hover:shadow-sm
    `
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-8 py-3.5 text-base tracking-wide"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Top Gloss Highlight (Glass Reflection) */}
      <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></div>
      
      {/* Bottom Depth Shadow */}
      <div className="absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};