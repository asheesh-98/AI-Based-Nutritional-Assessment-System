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
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full bg-white/10 border border-white/20 rounded-xl
            py-2.5 text-sm text-white placeholder-gray-400
            transition-all duration-300
            hover:border-white/30
            focus:bg-white/15
            focus:border-cyan-500/50
            focus:ring-2 focus:ring-cyan-500/20
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-400 mt-1">{error}</p>
      )}
    </div>
  );
});

export default Input;

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-white/5 border border-white/10 rounded-xl
          px-4 py-2.5 text-sm text-white
          transition-all duration-300
          hover:border-white/20
          appearance-none cursor-pointer
          [&>option]:bg-gray-900 [&>option]:text-white
          ${error ? 'border-rose-500/50' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-300">{label}</label>
      )}
      <textarea
        className={`
          w-full bg-white/5 border border-white/10 rounded-xl
          px-4 py-3 text-sm text-white placeholder-gray-500
          transition-all duration-300 hover:border-white/20 min-h-[100px] resize-y
          ${error ? 'border-rose-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
