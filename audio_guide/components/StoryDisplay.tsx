
import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import AudioPlayer from './AudioPlayer';

interface StoryDisplayProps {
    isLoading: boolean;
    error: string | null;
    story: string;
    sources: any[];
    audioSrc: string | null;
    isAudioLoading: boolean;
    audioError: string | null;
    isPlaying: boolean;
    togglePlayPause: () => void;
    audioRef: React.Ref<HTMLAudioElement>;
    T: {
        welcomeMessage: string;
        copy: string;
        copied: string;
        playAudio: string;
        pauseAudio: string;
        audioLoading: string;
        download: string;
        sourcesTitle: string;
    };
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
    isLoading, error, story, sources,
    audioSrc, isAudioLoading, audioError, isPlaying, togglePlayPause, audioRef,
    T 
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!story || isCopied) return;
        // Use the raw markdown story for copying
        navigator.clipboard.writeText(story).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        });
    };

    const formattedStory = useMemo(() => {
        if (!story) return '';
        // Note: Using marked is safe here as we control the input source (our own AI).
        // For user-generated content, this would require sanitization.
        return marked(story) as string;
    }, [story]);

    return (
        <section className="story-container" aria-live="polite">
            {isLoading && (
                <div className="center-loader">
                   <span className="loader"></span>
                </div>
            )}
            {error && <p className="error">{error}</p>}
            
            {!isLoading && !error && story && (
                <>
                    <div className="story-actions">
                         <AudioPlayer
                            audioSrc={audioSrc}
                            isAudioLoading={isAudioLoading}
                            audioError={audioError}
                            isPlaying={isPlaying}
                            onTogglePlayPause={togglePlayPause}
                            T={T}
                            audioRef={audioRef}
                        />
                        <button onClick={handleCopy} className="action-button" aria-label={T.copy} disabled={isCopied || !story}>
                            {isCopied ? T.copied : T.copy}
                        </button>
                         {audioSrc && !isAudioLoading && !audioError && (
                            <a 
                                href={audioSrc} 
                                download="story.wav" 
                                className="action-button"
                                aria-label={T.download}
                            >
                                {T.download}
                            </a>
                        )}
                    </div>
                    <div className="story-content" dangerouslySetInnerHTML={{ __html: formattedStory }} />
                    {sources && sources.length > 0 && (
                        <div className="story-sources">
                            <h3>{T.sourcesTitle}</h3>
                            <ul>
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer">
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            {!isLoading && !error && !story && (
                <p className="welcome-message">{T.welcomeMessage}</p>
            )}
        </section>
    );
};

export default StoryDisplay;
