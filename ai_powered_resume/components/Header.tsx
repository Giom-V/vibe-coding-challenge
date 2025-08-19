



import React, { useState, useEffect } from 'react';
import { Profile, TooltipTerm } from '../types';
import { Icon } from './Icon';
import { generateAudioOverview } from '../services/geminiService';
import { logInteraction } from '../services/trackingService';
import { AudioPlayer } from './AudioPlayer';
import { useLocale } from '../context/LocaleContext';
import { TextWithTooltips } from './TextWithTooltips';

interface HeaderProps {
  profile: Profile;
  onImageClick: (images: string[], startIndex: number) => void;
  tooltipData: TooltipTerm[];
  onTellMeMore: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onImageClick, tooltipData, onTellMeMore }) => {
    const { t } = useLocale();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [audioFocus, setAutoFocus] = useState('Overall Career');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);

    useEffect(() => {
        if (profile.images.length > 1) {
            const intervalId = setInterval(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % profile.images.length);
            }, 5000); // Change image every 5 seconds
            return () => clearInterval(intervalId);
        }
    }, [profile.images]);
    
    const handleGenerateAudio = async () => {
        const focus = audioFocus; // Use state directly
        const prompt = `Focus: ${focus}`;

        setIsGeneratingAudio(true);
        setAudioUrl(null);
        setAudioError(null);
        let script = '';
        try {
            const result = await generateAudioOverview(focus);
            script = result.script;
            setAudioUrl(result.audioUrl);
            if (!result.audioUrl && script) {
                 setAudioError(script);
            }
        } catch (error) {
            console.error(error);
            const errorMessage = "Failed to generate audio due to an unexpected error.";
            script = errorMessage;
            setAudioError(errorMessage);
        } finally {
            setIsGeneratingAudio(false);
            logInteraction({
                type: 'audio_overview',
                source: 'header_audio',
                prompt,
                response: script
            });
        }
    };

    const handleImageClick = () => {
        const allImages = [...profile.images, ...(profile.conferenceImages || [])];
        onImageClick(allImages, currentImageIndex);
    };

    const currentImage = profile.images[currentImageIndex];

    return (
        <aside className="lg:sticky lg:top-8 bg-slate-800 text-white rounded-xl shadow-2xl p-8 flex flex-col h-full">
            <div className="flex-grow">
                <div className="text-center">
                    <img 
                        src={currentImage} 
                        alt={profile.name} 
                        className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-slate-600 object-cover transition-all duration-500 ease-in-out cursor-pointer hover:opacity-90"
                        onClick={handleImageClick}
                    />
                    <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                    <h2 className="text-xl font-light text-cyan-400">{profile.title}</h2>
                    <p className="text-sm text-slate-400 mb-4">{t('header.company_at', { company: profile.company })}</p>

                    <div className="flex justify-center gap-4">
                        {profile.contact.linkedin && (
                            <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-slate-400 hover:text-white transition-colors">
                                <Icon name="fa-brands fa-linkedin" className="text-2xl" />
                            </a>
                        )}
                        {profile.contact.github && (
                            <a href={profile.contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-slate-400 hover:text-white transition-colors">
                                <Icon name="fa-brands fa-github" className="text-2xl" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-left space-y-4 text-slate-300">
                    {profile.bio.map((paragraph, index) => (
                        <p key={index}>
                           <TextWithTooltips text={paragraph} tooltipData={tooltipData} onTellMeMore={onTellMeMore} />
                        </p>
                    ))}
                </div>

                <div className="mt-8 border-t border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">{t('header.audio_overview_title')}</h3>
                     <div className="flex flex-col sm:flex-row gap-2">
                        <select 
                          value={audioFocus} 
                          onChange={(e) => setAutoFocus(e.target.value)}
                          className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white flex-grow focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="Overall Career">{t('header.select_focus_overall')}</option>
                            <option value="Generative AI Expertise">{t('header.select_focus_genai')}</option>
                            <option value="Product Management">{t('header.select_focus_pm')}</option>
                            <option value="Video Game Industry">{t('header.select_focus_videogame')}</option>
                        </select>
                        <button 
                          onClick={() => handleGenerateAudio()}
                          disabled={isGeneratingAudio}
                          className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isGeneratingAudio ? (
                                <>
                                 <Icon name="fa-solid fa-spinner" className="animate-spin mr-2" />
                                 {t('header.generating_button')}
                                </>
                            ) : (
                                <>
                                 <Icon name="fa-solid fa-play" className="mr-2"/>
                                  {t('header.generate_button')}
                                </>
                            )}
                        </button>
                    </div>
                    {audioUrl && <AudioPlayer src={audioUrl} />}
                    {audioError && <p className="text-sm text-red-400 mt-2">{audioError}</p>}
                </div>
            </div>

            <div className="mt-8 border-t border-slate-700 pt-6 text-sm text-slate-400 text-center">
                <p>{profile.contact.email} &bull; {profile.details.age}</p>
            </div>
        </aside>
    );
};