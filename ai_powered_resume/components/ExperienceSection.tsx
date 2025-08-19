
import React, { useState } from 'react';
import { Experience, ModalInfo, TooltipTerm } from '../types';
import { ExperienceItem } from './ExperienceItem';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface ExperienceSectionProps {
    experiences: Experience[];
    onAskGemini: (info: ModalInfo) => void;
    tooltipData: TooltipTerm[];
    onTellMeMore: (term: string) => void;
    isDetailed: boolean;
    onToggleDetailedView: (isDetailed: boolean) => void;
    isTailoredView: boolean;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences, onAskGemini, tooltipData, onTellMeMore, isDetailed, onToggleDetailedView, isTailoredView }) => {
    const { t } = useLocale();

    // In compact view, hide the earliest 3 roles unless they are relevant in a tailored view.
    const experiencesToShow = isDetailed
        ? experiences
        : experiences.filter((exp, index) => {
            const isEarlyCareer = index >= experiences.length - 3;
            // Show if it's NOT an early role, OR if it IS an early role but has been marked as relevant by the AI.
            return !isEarlyCareer || !!exp.analysis;
        });

    return (
        <section id="experience">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
                    <Icon name="fa-solid fa-briefcase" />
                    {t('sections.experience')}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{t('experience_section.view_compact')}</span>
                    <label htmlFor="view-toggle" className={`relative inline-flex items-center ${isTailoredView ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input 
                            type="checkbox" 
                            id="view-toggle" 
                            className="sr-only peer" 
                            checked={isDetailed}
                            onChange={() => onToggleDetailedView(!isDetailed)}
                            disabled={isTailoredView}
                        />
                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                    <span className="text-sm text-slate-600">{t('experience_section.view_detailed')}</span>
                </div>
            </div>

            <div className="space-y-8">
                {experiencesToShow.map((exp, index) => (
                    <ExperienceItem 
                        key={index} 
                        experience={exp} 
                        onAskGemini={onAskGemini} 
                        isDetailed={isDetailed}
                        tooltipData={tooltipData}
                        onTellMeMore={onTellMeMore}
                    />
                ))}
            </div>
        </section>
    );
};
