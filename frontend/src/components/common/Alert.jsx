import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const alertStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200/90 shadow-xs',
    text: 'text-emerald-950',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    closeColor: 'text-emerald-600/60 hover:text-emerald-900 hover:bg-emerald-100',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200/90 shadow-xs',
    text: 'text-amber-950',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    closeColor: 'text-amber-600/60 hover:text-amber-900 hover:bg-amber-100',
  },
  error: {
    bg: 'bg-rose-50 border-rose-200/90 shadow-xs',
    text: 'text-rose-950',
    icon: XCircle,
    iconColor: 'text-rose-600',
    closeColor: 'text-rose-600/60 hover:text-rose-900 hover:bg-rose-100',
  },
  info: {
    bg: 'bg-sky-50 border-sky-200/90 shadow-xs',
    text: 'text-[#0a192f]',
    icon: Info,
    iconColor: 'text-[#0284c7]',
    closeColor: 'text-sky-600/60 hover:text-sky-900 hover:bg-sky-100',
  },
};

export default function Alert({ type = 'info', message, onClose, show = true }) {
  const style = alertStyles[type] || alertStyles.info;
  const IconComponent = style.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border ${style.bg} transition-all my-2`}
        >
          <IconComponent className={`w-5 h-5 ${style.iconColor} shrink-0`} />
          <p className={`text-xs sm:text-sm font-bold flex-1 ${style.text} leading-tight`}>{message}</p>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${style.closeColor} transition-colors cursor-pointer shrink-0`}
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
