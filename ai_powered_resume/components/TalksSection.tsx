
import React from 'react';
import { Talk } from '../types';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface TalksSectionProps {
    talks: Talk[];
}

const TalkItem: React.FC<{ talk: Talk }> = ({ talk }) => {
    const { t } = useLocale();
    return (
        <div className="bg-white p-4 rounded-lg shadow-md transition-shadow hover:shadow-lg">
            <h4 className="font-bold text-lg text-slate-900">{talk.title}</h4>
            <p className="font-semibold text-slate-700">{talk.event}</p>
            <div className="flex justify-between items-center text-sm text-slate-500 mt-2">
                <span>{new Date(talk.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} &bull; {talk.location}</span>
                {talk.url && (
                    <a href={talk.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-800 font-semibold flex items-center gap-1">
                        {t('talks_section.view_details')} <Icon name="fa-solid fa-arrow-up-right-from-square" className="text-xs" />
                    </a>
                )}
            </div>
        </div>
    );
}

export const TalksSection: React.FC<TalksSectionProps> = ({ talks }) => {
    const { t } = useLocale();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTalks = talks.filter(talk => new Date(talk.date) >= today).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastTalks = talks.filter(talk => new Date(talk.date) < today).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (talks.length === 0) {
        return null;
    }

    return (
        <section id="talks">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                <Icon name="fa-solid fa-microphone-stand" />
                {t('sections.talks')}
            </h2>
            <div className="space-y-6">
                {upcomingTalks.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-cyan-700">{t('talks_section.upcoming')}</h3>
                        <div className="space-y-4">
                            {upcomingTalks.map((talk, index) => <TalkItem key={index} talk={talk} />)}
                        </div>
                    </div>
                )}
                {pastTalks.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-cyan-700">{t('talks_section.past')}</h3>
                        <div className="space-y-4">
                            {pastTalks.map((talk, index) => <TalkItem key={index} talk={talk} />)}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
