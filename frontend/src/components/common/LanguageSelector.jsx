import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector({ compact = false }) {
  const { currentLanguageObj, openLanguageModal } = useLanguage();

  return (
    <button
      onClick={openLanguageModal}
      type="button"
      className={`
        flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-white/15
        bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white
        transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-cyan-500/20
        shrink-0 cursor-pointer active:scale-95
      `}
      title="Change Language / भाषा बदलें"
    >
      <Globe className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
      <span className="truncate max-w-[90px] sm:max-w-[120px]">
        {currentLanguageObj.native}
      </span>
    </button>
  );
}
