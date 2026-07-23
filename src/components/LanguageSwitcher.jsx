
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageSwitcher() {
  const { language, changeLanguage, translations } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = translations[language];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[180px]">
            <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider">Select Language</p>
            {Object.entries(translations).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => { changeLanguage(code); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors ${language === code ? 'bg-red-50' : ''}`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className={`text-sm ${language === code ? 'font-bold text-red-700' : 'text-gray-700'}`}>
                  {lang.name}
                </span>
                {language === code && <span className="ml-auto text-red-600 text-sm">✓</span>}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 px-4 py-2">
              <p className="text-xs text-gray-400">Powered by Amazon Translate</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

