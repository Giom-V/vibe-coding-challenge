
import React, { useState } from 'react';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface LanguageSwitcherProps {
    onLanguageChange: (language: string) => void;
    isTranslating: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange, isTranslating }) => {
    const { t } = useLocale();
    const [customLang, setCustomLang] = useState('');

    const handleTranslate = () => {
        if (customLang.trim()) {
            onLanguageChange(customLang.trim());
        }
    };

    return (
        <div className="bg-white p-2 rounded-lg shadow-lg border border-slate-200 flex items-center gap-2">
            <button 
                onClick={() => onLanguageChange('English')}
                disabled={isTranslating}
                className="px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
                {t('language_switcher.en')}
            </button>
            <button 
                onClick={() => onLanguageChange('French')}
                disabled={isTranslating}
                className="px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
                {t('language_switcher.fr')}
            </button>
            <div className="h-6 border-l border-slate-300"></div>
            <input 
                type="text"
                value={customLang}
                onChange={(e) => setCustomLang(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
                placeholder={t('language_switcher.placeholder')}
                disabled={isTranslating}
                className="px-2 py-1 text-sm border border-slate-300 rounded-md w-28 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-100"
            />
            <button 
                onClick={handleTranslate}
                disabled={isTranslating || !customLang.trim()}
                className="bg-cyan-500 text-white p-1.5 rounded-md hover:bg-cyan-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                <Icon name="fa-solid fa-language" className="text-lg"/>
            </button>
        </div>
    );
};
