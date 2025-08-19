
import React, { useState } from 'react';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface TooltipProps {
  term: string;
  definition: string;
  onTellMeMore: (term: string) => void;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, definition, onTellMeMore }) => {
  const { t } = useLocale();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span className="border-b border-dashed border-gray-400 cursor-pointer">{term}</span>
      {isHovering && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-800 text-white rounded-lg shadow-lg z-20 text-sm animate-fade-in-fast">
          <p className="mb-3">{definition}</p>
          <button
            onClick={() => onTellMeMore(term)}
            className="w-full text-left flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <Icon name="fa-solid fa-lightbulb" />
            {t('tooltip.tell_me_more')}
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
        </div>
      )}
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; transform: translateY(5px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }
      `}</style>
    </span>
  );
};
