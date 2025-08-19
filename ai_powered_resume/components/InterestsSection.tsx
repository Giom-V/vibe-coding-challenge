
import React from 'react';
import { OtherInterest } from '../types';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface InterestsSectionProps {
    interests: {
        sports: string[];
        travelling: string;
        other: OtherInterest[];
    };
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({ interests }) => {
    const { t } = useLocale();
    return (
        <section id="interests" className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-800">
                <Icon name="fa-solid fa-paper-plane" />
                {t('sections.interests')}
            </h2>
            
            <div>
                <h3 className="font-semibold text-lg text-cyan-700 mb-2">{t('interests_section.sports')}</h3>
                <p className="text-slate-600">{interests.sports.join(' • ')}</p>
            </div>
            
            <div className="mt-4">
                <h3 className="font-semibold text-lg text-cyan-700 mb-2">{t('interests_section.travelling')}</h3>
                <p className="text-slate-600">{interests.travelling}</p>
            </div>

            <div className="mt-4">
                <h3 className="font-semibold text-lg text-cyan-700 mb-2">{t('interests_section.other')}</h3>
                <ul className="list-none space-y-1">
                {interests.other.map(item => (
                    <li key={item.name} className="text-slate-600">
                        {item.url ? (
                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 transition-colors flex items-center gap-2">
                               {item.name} <Icon name="fa-solid fa-arrow-up-right-from-square" className="text-xs" />
                            </a>
                        ) : item.name}
                    </li>
                ))}
                </ul>
            </div>
        </section>
    );
};
