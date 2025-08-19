
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface JobAnalysisModalProps {
    onClose: () => void;
    onAnalyze: (jobDescription: string) => void;
    isLoading: boolean;
}

export const JobAnalysisModal: React.FC<JobAnalysisModalProps> = ({ onClose, onAnalyze, isLoading }) => {
    const { t } = useLocale();
    const [jobDescription, setJobDescription] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        // Auto-focus the textarea when the modal opens
        textareaRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobDescription.trim() || isLoading) return;
        onAnalyze(jobDescription.trim());
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
                    <h2 className="text-xl font-bold text-slate-800">{t('tailor_resume.modal_title')}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl" disabled={isLoading}>
                        &times;
                    </button>
                </header>

                <main className="p-6 overflow-y-auto">
                    <p className="text-slate-600 mb-4">{t('tailor_resume.modal_intro')}</p>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            ref={textareaRef}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white text-slate-800"
                            placeholder={t('tailor_resume.modal_placeholder')}
                            rows={10}
                            disabled={isLoading}
                            aria-label="Job Description Input"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !jobDescription.trim()} 
                            className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Icon name="fa-solid fa-spinner" className="animate-spin mr-2" />
                                    {t('tailor_resume.modal_button_analyzing')}
                                </>
                            ) : (
                                <>
                                    <Icon name="fa-solid fa-wand-magic-sparkles" className="mr-2" />
                                    {t('tailor_resume.modal_button_analyze')}
                                </>
                            )}
                        </button>
                    </form>
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
