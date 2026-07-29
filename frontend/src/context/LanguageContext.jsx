import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, LANGUAGES } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('nutriai_language') || 'en';
  });

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    return !!localStorage.getItem('nutriai_language');
  });

  const [showModal, setShowModal] = useState(() => {
    return !localStorage.getItem('nutriai_language');
  });

  const selectLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem('nutriai_language', langCode);
      setHasSelectedLanguage(true);
      setShowModal(false);
    }
  };

  const openLanguageModal = () => {
    setShowModal(true);
  };

  const closeLanguageModal = () => {
    setShowModal(false);
  };

  // Translation function with fallback to English
  const t = (key) => {
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return key;
  };

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        languages: LANGUAGES,
        currentLanguageObj,
        selectLanguage,
        hasSelectedLanguage,
        showModal,
        openLanguageModal,
        closeLanguageModal,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
