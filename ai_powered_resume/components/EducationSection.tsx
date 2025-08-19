
import React from 'react';
import { Education, ModalInfo, TooltipTerm } from '../types';
import { Icon } from './Icon';
import { EducationItem } from './EducationItem';
import { useLocale } from '../context/LocaleContext';

interface EducationSectionProps {
    education: Education[];
    onAskGemini: (info: ModalInfo) => void;
    tooltipData: TooltipTerm[];
    onTellMeMore: (term: string) => void;
    isDetailed: boolean;
    onToggleDetailedView: (isDetailed: boolean) => void;
    isTailoredView: boolean;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ education, onAskGemini, tooltipData, onTellMeMore, isDetailed, onToggleDetailedView, isTailoredView }) => {
    const { t } = useLocale();

    return (
        <section id="education" className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                    <Icon name="fa-solid fa-graduation-cap" />
                    {t('sections.education')}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{t('experience_section.view_compact')}</span>
                    <label htmlFor="education-view-toggle" className={`relative inline-flex items-center ${isTailoredView ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input 
                            type="checkbox" 
                            id="education-view-toggle" 
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
            <div className="space-y-6">
                {education.map((edu, index) => (
                    <EducationItem 
                        key={index} 
                        education={edu} 
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
