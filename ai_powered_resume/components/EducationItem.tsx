

import React, { useState, useEffect } from 'react';
import { Education, ModalInfo, Prompt, TooltipTerm } from '../types';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';
import { TextWithTooltips } from './TextWithTooltips';

interface EducationItemProps {
    education: Education;
    onAskGemini: (info: ModalInfo) => void;
    isDetailed: boolean;
    tooltipData: TooltipTerm[];
    onTellMeMore: (term: string) => void;
}

const AIRelevanceSummary: React.FC<{ justification: string }> = ({ justification }) => {
    const { t } = useLocale();
    return (
        <div className="mt-3 p-3 bg-cyan-100 border-l-4 border-cyan-500 rounded-r-md">
            <h5 className="font-bold text-xs text-cyan-800 flex items-center gap-2 mb-1">
                <Icon name="fa-solid fa-wand-magic-sparkles" />
                {t('education_section.ai_relevance_summary_title')}
            </h5>
            <p className="text-xs text-cyan-900">{justification}</p>
        </div>
    );
};

export const EducationItem: React.FC<EducationItemProps> = ({ education, onAskGemini, isDetailed, tooltipData, onTellMeMore }) => {
    const { t } = useLocale();
    const [isExpanded, setIsExpanded] = useState(isDetailed);

    useEffect(() => {
        setIsExpanded(isDetailed);
    }, [isDetailed]);

    const handleAskGemini = () => {
        const prompts: Prompt[] = [
            { text: 'prompts.what_is_institution_known_for', type: 'general', replacements: { institution: education.institution } },
            { text: 'prompts.what_does_degree_cover', type: 'general', replacements: { degree: education.degree } }
        ];

        if (education.geminiPrompts) {
            prompts.push(...education.geminiPrompts.map(p => ({
                text: p,
                type: 'personal' as const
            })))
        }

        onAskGemini({
            title: 'modal.about_education_at',
            titleReplacements: { institution: education.institution },
            context: education.longDescription || '',
            prompts: prompts,
        });
    };
    
    const canAskGemini = !!education.longDescription;

    return (
        <div className={`relative transition-all p-3 rounded-md ${education.analysis ? 'bg-cyan-50' : ''}`}>
            <h3 className="font-bold text-lg text-slate-900">{education.degree}</h3>
            <p className="font-semibold text-md text-cyan-700">{education.institution}</p>
            <p className="text-sm text-slate-500 mb-2">{education.period}</p>
            
            <p className="text-sm text-slate-600 italic my-2">
                <TextWithTooltips text={education.summary} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />
            </p>

            {isExpanded ? (
                 <div className="animate-fade-in-fast">
                    {education.description.map((desc, i) => (
                         <li key={i} className="flex items-start text-sm text-slate-600 list-none mt-1">
                            <Icon name="fa-solid fa-chevron-right" className="text-cyan-500 mt-1 mr-2 text-xs flex-shrink-0" />
                            <span>
                                <TextWithTooltips text={desc} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />
                            </span>
                        </li>
                    ))}
                 </div>
            ) : (
                education.description && education.description.length > 0 && (
                     <div className="text-center my-2">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors flex items-center gap-2 mx-auto"
                            aria-expanded="false"
                        >
                            {t('education_section.see_more_details')}
                             <Icon name="fa-solid fa-chevron-down" className="text-xs" />
                        </button>
                    </div>
                )
            )}
            
            {education.analysis && <AIRelevanceSummary justification={education.analysis.justification} />}

             {canAskGemini && (
                <div className="text-right mt-3">
                    <button
                        onClick={handleAskGemini}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition-all transform hover:scale-105 text-sm"
                    >
                        <Icon name="fa-solid fa-lightbulb" />
                        {t('education_section.ask_button')}
                    </button>
                </div>
            )}
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
