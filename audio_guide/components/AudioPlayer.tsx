
import React from 'react';

const PlayIcon = React.memo(() => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" />
    </svg>
));

const PauseIcon = React.memo(() => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" />
    </svg>
));

interface AudioPlayerProps {
    audioSrc: string | null;
    isAudioLoading: boolean;
    audioError: string | null;
    isPlaying: boolean;
    onTogglePlayPause: () => void;
    T: {
        playAudio: string;
        pauseAudio: string;
        audioLoading: string;
    };
    audioRef: React.Ref<HTMLAudioElement>;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioSrc,
    isAudioLoading,
    audioError,
    isPlaying,
    onTogglePlayPause,
    T,
    audioRef,
}) => {
    const shouldRenderButton = isAudioLoading || (audioSrc && !audioError);
    
    return (
        <div className="audio-player">
            {audioSrc && <audio ref={audioRef} src={audioSrc} preload="auto" className="visually-hidden" />}
            
            {shouldRenderButton && (
                 <button 
                    className="action-button audio-control-button"
                    onClick={onTogglePlayPause}
                    disabled={isAudioLoading || !audioSrc}
                    aria-label={isPlaying ? T.pauseAudio : T.playAudio}
                >
                    {isAudioLoading ? (
                        <span className="audio-loader" />
                    ) : isPlaying ? (
                        <PauseIcon />
                    ) : (
                        <PlayIcon />
                    )}
                </button>
            )}

            {audioError && <p className="error audio-error-inline">{audioError}</p>}
        </div>
    );
};

export default AudioPlayer;
