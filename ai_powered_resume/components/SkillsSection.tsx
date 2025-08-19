

import React from 'react';
import { Skill, TooltipTerm } from '../types';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';
import { TextWithTooltips } from './TextWithTooltips';

interface SkillsSectionProps {
    skills: {
        technical: Skill[];
        languages: Skill[];
        management: Skill[];
    };
    tooltipData: TooltipTerm[];
    onTellMeMore: (term: string) => void;
}

const AIRelevanceSummary: React.FC<{ justification: string }> = ({ justification }) => {
    const { t } = useLocale();
    return (
        <div className="mt-2 p-2 bg-cyan-100 border-l-4 border-cyan-400 rounded-r-md">
            <h5 className="font-bold text-xs text-cyan-800 flex items-center gap-2 mb-1">
                <Icon name="fa-solid fa-wand-magic-sparkles" />
                {t('skills_section.ai_relevance_summary_title')}
            </h5>
            <p className="text-xs text-cyan-900">{justification}</p>
        </div>
    );
};

const SkillRating: React.FC<{
    skill: Skill;
    tooltipData: TooltipTerm[];
    onTellMeMore: (term: string) => void;
}> = ({ skill, tooltipData, onTellMeMore }) => {
    return (
        <div className={`mb-2 p-2 rounded-md transition-colors ${skill.analysis ? 'bg-cyan-50' : ''}`}>
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-slate-700">
                        <TextWithTooltips text={skill.name} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />
                    </span>
                </div>
                <div className="flex flex-shrink-0 ml-4">
                    {[...Array(5)].map((_, i) => (
                        <Icon key={i} name="fa-solid fa-star" className={`w-4 h-4 ${i < skill.rating ? 'text-yellow-400' : 'text-slate-300'}`} />
                    ))}
                </div>
            </div>
            {skill.analysis && <AIRelevanceSummary justification={skill.analysis.justification} />}
        </div>
    );
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, tooltipData, onTellMeMore }) => {
    const { t } = useLocale();
    return (
        <section id="skills" className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-800">
                <Icon name="fa-solid fa-cogs" />
                {t('sections.skills')}
            </h2>
            
            <div>
                <h3 className="font-semibold text-lg text-cyan-700 mb-2">{t('skills_section.technical')}</h3>
                {skills.technical.map(skill => <SkillRating key={skill.name} skill={skill} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />)}
            </div>

            <div className="mt-4">
                <h3 className="font-semibold text-lg text-cyan-700 mb-2">{t('skills_section.languages')}</h3>
                {skills.languages.map(skill => <SkillRating key={skill.name} skill={skill} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />)}
            </div>

            <div className="mt-4">
                <h3 className="font-semibold text-lg text-cyan-700 mb-2">{t('skills_section.management')}</h3>
                {skills.management.map(skill => <SkillRating key={skill.name} skill={skill} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />)}
            </div>
        </section>
    );
};
