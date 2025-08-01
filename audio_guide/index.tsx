
import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { uiText } from './constants';
import { GlobalStyles } from './styles';
import Header from './components/Header';
import StoryForm from './components/StoryForm';
import StoryDisplay from './components/StoryDisplay';
import { useStoryGenerator } from './hooks/useStoryGenerator';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Duration } from './types';

const App = () => {
    const [language, setLanguage] = useState<'fr' | 'en'>('fr');
    const [topic, setTopic] = useState('');
    const [seen, setSeen] = useState('');
    const [duration, setDuration] = useState<Duration>('quick');

    const T = uiText[language];

    const { story, sources, isLoading: isStoryLoading, error: storyError, generateStory, setStory } = useStoryGenerator();
    const { 
        audioSrc, isAudioLoading, audioError, isPlaying, togglePlayPause, audioRef, generateAudio, clearAudio
    } = useAudioPlayer(T.audioErrorPrefix);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        clearAudio(); // Clear previous audio state before starting
        const newStory = await generateStory(language, topic, seen, duration, T.errorPrefix);
        if (newStory) {
            // Don't await this, let it run in the background while the user reads
            generateAudio(newStory, language);
        }
    }, [generateStory, language, topic, seen, duration, T.errorPrefix, generateAudio, clearAudio]);
    
    const handleLanguageChange = (lang: 'fr' | 'en') => {
        setLanguage(lang);
        setStory('');
        clearAudio();
    };

    return (
        <>
            <style>{GlobalStyles}</style>
            <div className="container">
                <Header 
                    language={language}
                    setLanguage={handleLanguageChange}
                    T={T}
                />
                <main>
                    <StoryForm
                        handleSubmit={handleSubmit}
                        topic={topic}
                        setTopic={setTopic}
                        seen={seen}
                        setSeen={setSeen}
                        duration={duration}
                        setDuration={setDuration}
                        isLoading={isStoryLoading}
                        T={T}
                    />
                </main>
                <StoryDisplay
                    isLoading={isStoryLoading}
                    error={storyError}
                    story={story}
                    sources={sources}
                    T={T}
                    audioSrc={audioSrc}
                    isAudioLoading={isAudioLoading}
                    audioError={audioError}
                    isPlaying={isPlaying}
                    togglePlayPause={togglePlayPause}
                    audioRef={audioRef}
                />
            </div>
        </>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
