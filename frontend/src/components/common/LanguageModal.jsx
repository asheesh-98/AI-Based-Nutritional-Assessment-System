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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl glass-strong border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_0_60px_rgba(0,212,255,0.15)] my-auto max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Close button if user has already selected a language before */}
          {hasSelectedLanguage && (
            <button
              onClick={closeLanguageModal}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-20"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 shrink-0 pt-2 sm:pt-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Multi-Language Support
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white flex items-center justify-center gap-2 sm:gap-3">
              <Globe className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400 animate-pulse shrink-0" />
              <span>{t('select_language')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-lg mx-auto">
              {t('choose_language_sub')}
            </p>
          </div>

          {/* 16 Languages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto pr-1 py-1 custom-scrollbar flex-1">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectLanguage(lang.code)}
                  className={`
                    relative p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-left transition-all duration-300 flex flex-col justify-between border
                    ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-transparent border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-[9px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-white/5 text-gray-400 truncate max-w-[80%]">
                      {lang.region}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md shrink-0">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-lg font-black text-white leading-tight truncate">
                      {lang.native}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate">{lang.name}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer Action Button */}
          <div className="pt-3 sm:pt-4 mt-2 border-t border-white/10 flex items-center justify-between shrink-0">
            <span className="text-xs text-gray-400 hidden sm:block truncate">
              Selected: <strong className="text-cyan-300 font-semibold">{languages.find(l => l.code === language)?.native} ({languages.find(l => l.code === language)?.name})</strong>
            </span>
            <button
              onClick={() => selectLanguage(language)}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white gradient-bg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 ml-auto flex items-center justify-center gap-2"
            >
              <span>{t('continue_btn')}</span> &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
