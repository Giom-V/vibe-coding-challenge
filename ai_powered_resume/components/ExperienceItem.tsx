
import React, { useState, useEffect } from 'react';
import { Experience, ModalInfo, Prompt, TooltipTerm } from '../types';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';
import { TextWithTooltips } from './TextWithTooltips';

interface ExperienceItemProps {
    experience: Experience;
    onAskGemini: (info: ModalInfo) => void;
    isDetailed: boolean;
    tooltipData: TooltipTerm[];
    onTellMeMore: (term: string) => void;
}

const AIRelevanceSummary: React.FC<{ justification: string }> = ({ justification }) => {
    const { t } = useLocale();
    return (
        <div className="mt-4 p-3 bg-cyan-50 border-l-4 border-cyan-400 rounded-r-md">
            <h5 className="font-bold text-sm text-cyan-800 flex items-center gap-2 mb-1">
                <Icon name="fa-solid fa-wand-magic-sparkles" />
                {t('experience_section.ai_relevance_summary_title')}
            </h5>
            <p className="text-sm text-cyan-900">{justification}</p>
        </div>
    );
};

export const ExperienceItem: React.FC<ExperienceItemProps> = ({ experience, onAskGemini, isDetailed, tooltipData, onTellMeMore }) => {
    const { t } = useLocale();
    const [isExpanded, setIsExpanded] = useState(isDetailed);

    useEffect(() => {
        setIsExpanded(isDetailed);
    }, [isDetailed]);

    const handleAskGemini = () => {
        const generalPrompts: Prompt[] = [
            { text: 'prompts.explain_role', type: 'general', replacements: { role: experience.role } },
            { text: 'prompts.what_is_company', type: 'general', replacements: { company: experience.company } }
        ];

        const personalPrompts: Prompt[] = experience.geminiPrompts.map(p => ({
            text: p,
            type: 'personal'
        }));

        let detailedContext = experience.longDescription;
        if (experience.keyAchievements && experience.keyAchievements.length > 0) {
            const achievementsText = `\n\n## Key Achievements\n- ${experience.keyAchievements.join('\n- ')}`;
            detailedContext += achievementsText;
        }

        onAskGemini({
            title: 'modal.about_role_at',
            titleReplacements: { company: experience.company },
            context: detailedContext,
            prompts: [...generalPrompts, ...personalPrompts],
        });
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${experience.analysis ? 'ring-2 ring-cyan-400 shadow-cyan-100' : ''}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                <h3 className="text-xl font-bold text-slate-900">{experience.role}</h3>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <p className="text-sm font-medium text-slate-500">{experience.period}</p>
                    {experience.logo && <img src={experience.logo} alt={`${experience.company} logo`} className="h-8 w-8 object-contain" />}
                </div>
            </div>
            <p className="text-lg font-semibold text-cyan-600">{experience.company}</p>
            <p className="text-sm text-slate-500 mb-4">{experience.location}</p>

            <p className="text-lg font-bold text-slate-800 my-4">
                <TextWithTooltips text={experience.summary} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />
            </p>

            {isExpanded ? (
                <div className="animate-fade-in-fast">
                    <ul className="list-none space-y-2 mb-4">
                        {experience.description.map((point, index) => (
                            <li key={index} className="flex items-start">
                                <Icon name="fa-solid fa-play" className="text-cyan-500 mt-1 mr-3 text-xs flex-shrink-0" />
                                <span className="text-slate-700">
                                    <TextWithTooltips text={point} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />
                                </span>
                            </li>
                        ))}
                    </ul>

                    {experience.relatedLinks && experience.relatedLinks.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-semibold text-slate-600 mb-2">{t('experience_section.related_links_title')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {experience.relatedLinks.map(link => (
                                    <a
                                        key={link.uri}
                                        href={link.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                    >
                                        <Icon name="fa-solid fa-link" />
                                        {link.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="text-center my-2">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2 mx-auto"
                        aria-expanded="false"
                    >
                        {t('experience_section.see_more_details')}
                        <Icon name="fa-solid fa-chevron-down" className="text-xs" />
                    </button>
                </div>
            )}
            
            {experience.analysis && <AIRelevanceSummary justification={experience.analysis.justification} />}

            <div className="text-right mt-4">
                <button
                    onClick={handleAskGemini}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all transform hover:scale-105"
                >
                    <Icon name="fa-solid fa-lightbulb" />
                    {t('experience_section.ask_button')}
                </button>
            </div>
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
