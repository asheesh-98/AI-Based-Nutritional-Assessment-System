import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full bg-[#111c38]/90 border border-slate-700/80 rounded-xl
            py-2.5 text-sm text-white placeholder-slate-400 font-medium
            transition-all duration-200
            hover:border-slate-600
            focus:bg-[#152347]
            focus:border-[#0077ff]
            focus:ring-2 focus:ring-[#0077ff]/30
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-rose-400 mt-1">{error}</p>
      )}
    </div>
  );
});

export default Input;

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-[#111c38]/90 border border-slate-700/80 rounded-xl
          px-4 py-2.5 text-sm text-white font-medium
          transition-all duration-200
          hover:border-slate-600 focus:bg-[#152347] focus:border-[#0077ff] focus:ring-2 focus:ring-[#0077ff]/30
          appearance-none cursor-pointer
          [&>option]:bg-[#0d1527] [&>option]:text-white
          ${error ? 'border-rose-500/80' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</label>
      )}
      <textarea
        className={`
          w-full bg-[#111c38]/90 border border-slate-700/80 rounded-xl
          px-4 py-3 text-sm text-white placeholder-slate-400 font-medium
          transition-all duration-200 hover:border-slate-600 focus:bg-[#152347] focus:border-[#0077ff] focus:ring-2 focus:ring-[#0077ff]/30 min-h-[100px] resize-y
          ${error ? 'border-rose-500/80' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs font-medium text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
