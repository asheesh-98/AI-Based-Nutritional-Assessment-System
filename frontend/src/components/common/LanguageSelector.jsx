import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector({ compact = false }) {
  const [open, setOpen] = useState(false);
  const { language, languages, currentLanguageObj, selectLanguage, openLanguageModal } = useLanguage();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10
          bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white
          transition-all duration-200 text-xs sm:text-sm font-medium
          ${compact ? 'px-2 py-1 text-xs' : ''}
        `}
      >
        <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="truncate max-w-[80px] sm:max-w-[100px]">
          {currentLanguageObj.native}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 glass-strong rounded-2xl p-2 shadow-2xl border border-white/15 z-50 max-h-80 overflow-y-auto custom-scrollbar"
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
              <span>Select Language</span>
              <button
                onClick={() => {
                  setOpen(false);
                  openLanguageModal();
                }}
                className="text-cyan-400 hover:underline normal-case text-xs font-normal"
              >
                Grid View
              </button>
            </div>

            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    selectLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors
                    ${isSelected ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{lang.native}</span>
                    <span className="text-[10px] text-gray-400">{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
