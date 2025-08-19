
import React from 'react';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface GlobalAskButtonProps {
    onClick: () => void;
}

export const GlobalAskButton: React.FC<GlobalAskButtonProps> = ({ onClick }) => {
    const { t } = useLocale();

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-4 px-6 rounded-full shadow-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 z-40 flex items-center gap-3"
            aria-label={t('global_ask_button.label')}
        >
            <Icon name="fa-solid fa-comments" className="text-2xl" />
            <span className="text-lg hidden sm:inline">{t('global_ask_button.label')}</span>
        </button>
    );
};
