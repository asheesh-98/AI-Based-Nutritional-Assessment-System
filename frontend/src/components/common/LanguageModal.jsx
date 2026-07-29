import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageModal() {
  const {
    language,
    languages,
    selectLanguage,
    showModal,
    closeLanguageModal,
    hasSelectedLanguage,
    t,
  } = useLanguage();

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl glass-strong border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,212,255,0.15)] my-auto max-h-[90vh] flex flex-col"
        >
          {/* Close button if user has already selected a language before */}
          {hasSelectedLanguage && (
            <button
              onClick={closeLanguageModal}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-6 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Multi-Language Support
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-3">
              <Globe className="w-7 h-7 text-cyan-400 animate-pulse" />
              {t('select_language')}
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-lg mx-auto">
              {t('choose_language_sub')}
            </p>
          </div>

          {/* 16 Languages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-1 py-2 custom-scrollbar my-2 flex-1">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectLanguage(lang.code)}
                  className={`
                    relative p-3.5 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between border
                    ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-transparent border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/5 text-gray-400">
                      {lang.region}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {lang.native}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">{lang.name}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer Action Button */}
          <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between shrink-0">
            <span className="text-xs text-gray-400 hidden sm:block">
              Selected: <strong className="text-cyan-300 font-semibold">{languages.find(l => l.code === language)?.native} ({languages.find(l => l.code === language)?.name})</strong>
            </span>
            <button
              onClick={() => selectLanguage(language)}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white gradient-bg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 ml-auto flex items-center justify-center gap-2"
            >
              <span>{t('continue_btn')}</span> &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
