import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const alertStyles = {
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    icon: CheckCircle,
    iconColor: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
  error: {
    bg: 'bg-rose-500/10 border-rose-500/30',
    icon: XCircle,
    iconColor: 'text-rose-400',
  },
  info: {
    bg: 'bg-cyan-500/10 border-cyan-500/30',
    icon: Info,
    iconColor: 'text-cyan-400',
  },
};

export default function Alert({ type = 'info', message, onClose, show = true }) {
  const style = alertStyles[type];
  const IconComponent = style.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl border ${style.bg}`}
        >
          <IconComponent className={`w-5 h-5 ${style.iconColor} flex-shrink-0`} />
          <p className="text-sm text-gray-200 flex-1">{message}</p>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
