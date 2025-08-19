
import React from 'react';
import { Value, ModalInfo } from '../types';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface ValuesSectionProps {
    values: Value[];
    onAskGemini: (info: ModalInfo) => void;
}

const AIRelevanceSummary: React.FC<{ justification: string }> = ({ justification }) => {
    const { t } = useLocale();
    return (
        <div className="mt-2 p-2 bg-cyan-100 border-l-4 border-cyan-400 rounded-r-md">
            <h5 className="font-bold text-xs text-cyan-800 flex items-center gap-2 mb-1">
                <Icon name="fa-solid fa-wand-magic-sparkles" />
                {t('values_section.ai_relevance_summary_title')}
            </h5>
            <p className="text-xs text-cyan-900">{justification}</p>
        </div>
    );
};

export const ValuesSection: React.FC<ValuesSectionProps> = ({ values, onAskGemini }) => {
    const { t } = useLocale();

    if (!values || values.length === 0) {
        return null;
    }

    const handleAskGemini = (value: Value) => {
        onAskGemini({
            title: 'modal.about_value_title',
            titleReplacements: { value: value.name },
            context: `The user wants to know more about my value: "${value.name}".\nSummary: ${value.summary}\nDetailed context and examples: ${value.details}`,
            prompts: [
                { text: 'prompts.value_in_workplace', type: 'personal', replacements: { value: value.name } },
                { text: 'prompts.value_example', type: 'personal', replacements: { value: value.name } },
                { text: 'prompts.value_importance', type: 'personal', replacements: { value: value.name } },
            ],
        });
    };

    return (
        <section id="values" className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                <Icon name="fa-solid fa-gem" />
                {t('sections.values')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {values.map((value) => (
                    <div key={value.name} className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${value.analysis ? 'bg-cyan-50' : ''}`}>
                        <Icon name={value.icon} className="text-3xl text-cyan-500 mt-1 w-8 text-center flex-shrink-0" />
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-slate-900">{value.name}</h3>
                            <p className="text-slate-600 text-sm mb-2">{value.summary}</p>
                            
                            {value.analysis && <AIRelevanceSummary justification={value.analysis.justification} />}
                            
                            <div className="text-right mt-2">
                                <button
                                    onClick={() => handleAskGemini(value)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-1 px-3 rounded-lg shadow-sm transition-all transform hover:scale-105 text-sm"
                                >
                                    <Icon name="fa-solid fa-lightbulb" />
                                    {t('values_section.ask_button')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
