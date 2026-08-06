import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#0077ff] hover:bg-[#0066ff] text-white shadow-md shadow-blue-500/20 active:bg-[#0052cc]',
  secondary: 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:text-slate-900',
  outline: 'bg-transparent text-[#0077ff] border border-[#0077ff] hover:bg-blue-50',
  danger: 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100',
  ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
  xl: 'px-9 py-4 text-lg rounded-2xl gap-3',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.015 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center font-bold
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${!className.includes('px-') && !className.includes('py-') ? sizes[size] : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </motion.button>
  );
}
