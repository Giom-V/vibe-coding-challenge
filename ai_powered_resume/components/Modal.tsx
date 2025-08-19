
import React, { useState, useEffect, useRef } from 'react';
import { ModalInfo, Prompt } from '../types';
import { getResumeDetails, getGeneralInfo } from '../services/geminiService';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface ModalProps {
    info: ModalInfo;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ info, onClose }) => {
    const { t } = useLocale();
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [currentPromptText, setCurrentPromptText] = useState('');
    const [customQuestion, setCustomQuestion] = useState('');
    const customQuestionInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    const fetchResponse = async (promptText: string, type: 'personal' | 'general', source: 'modal_suggestion' | 'modal_custom') => {
        setIsLoading(true);
        setResponse('');
        setCurrentPromptText(promptText);
        let result = '';
        try {
            if (type === 'general') {
                result = await getGeneralInfo(promptText);
            } else {
                result = await getResumeDetails(info.context, promptText);
            }
            setResponse(result);
        } catch (error) {
            console.error(error);
            result = "An error occurred while fetching details. Please check the console for more information.";
            setResponse(result);
        } finally {
            setIsLoading(false);
        }
    }

    const getPromptText = (prompt: Prompt): string => {
        return prompt.isRawText ? prompt.text : t(prompt.text, prompt.replacements);
    };

    const handlePromptClick = (prompt: Prompt) => {
        const promptText = getPromptText(prompt);
        if (prompt.fillIn) {
            setCustomQuestion(promptText);
            customQuestionInputRef.current?.focus();
            return;
        }
        fetchResponse(promptText, prompt.type, 'modal_suggestion');
    };

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customQuestion.trim()) return;
        // All custom questions are treated as 'personal' to use the full context provided to the modal
        fetchResponse(customQuestion, 'personal', 'modal_custom');
        setCustomQuestion('');
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-slate-800">{t(info.title, info.titleReplacements)}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">
                        &times;
                    </button>
                </header>

                <main className="p-6 overflow-y-auto">
                    <h3 className="font-semibold text-slate-600 mb-2">{t('modal.suggestions')}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {info.prompts.map((prompt, index) => (
                            <button 
                                key={index} 
                                onClick={() => handlePromptClick(prompt)}
                                disabled={isLoading}
                                className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm hover:bg-cyan-200 transition-colors disabled:opacity-50"
                            >
                                {getPromptText(prompt)}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-4 my-6">
                        <hr className="flex-grow border-slate-200" />
                        <span className="text-slate-500 font-semibold text-sm">{t('modal.or')}</span>
                        <hr className="flex-grow border-slate-200" />
                    </div>

                    <form onSubmit={handleCustomSubmit}>
                        <label htmlFor="custom-question" className="font-semibold text-slate-600 mb-2 block">
                            {t('modal.custom_question_label')}
                        </label>
                        <textarea
                            id="custom-question"
                            ref={customQuestionInputRef}
                            value={customQuestion}
                            onChange={e => setCustomQuestion(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder={t('modal.custom_question_placeholder')}
                            rows={3}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !customQuestion.trim()} 
                            className="mt-2 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            <Icon name="fa-solid fa-robot" className="mr-2"/>
                            {t('modal.ask_button')}
                        </button>
                    </form>

                    {isLoading && (
                        <div className="flex items-center justify-center p-8 mt-4">
                            <Icon name="fa-solid fa-spinner" className="text-3xl text-cyan-500 animate-spin" />
                            <span className="ml-4 text-slate-600">{t('modal.thinking')}</span>
                        </div>
                    )}

                    {response && !isLoading && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                           <p className="font-semibold text-slate-700 mb-3 pb-2 border-b">
                             <span className="italic">{t('modal.you_asked')}</span> "{currentPromptText}"
                           </p>
                           <p className="text-slate-800 whitespace-pre-wrap">{response}</p>
                        </div>
                    )}
                </main>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
