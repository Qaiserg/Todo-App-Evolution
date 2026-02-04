'use client';

import { useLanguage } from '@/lib/language-context';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
      <button
        onClick={() => setLocale('en')}
        className={`
          px-3 py-1.5 rounded-md text-xs font-medium transition-all
          ${locale === 'en'
            ? 'bg-blue-500 text-white shadow-md'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }
        `}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('ur')}
        className={`
          px-3 py-1.5 rounded-md text-xs font-medium transition-all
          ${locale === 'ur'
            ? 'bg-blue-500 text-white shadow-md'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }
        `}
      >
        اردو
      </button>
    </div>
  );
}
