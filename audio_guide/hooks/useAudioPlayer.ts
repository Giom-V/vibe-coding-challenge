
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateStoryAudio } from '../services/gemini';

export const useAudioPlayer = (errorPrefix: string) => {
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Effect to clean up the object URL when the component unmounts or src changes.
    useEffect(() => {
        const currentSrc = audioSrc;
        return () => {
            if (currentSrc) {
                console.log('[DEBUG] Revoking Object URL:', currentSrc);
                URL.revokeObjectURL(currentSrc);
            }
        };
    }, [audioSrc]);

    // This effect handles auto-play when a new src is set.
    useEffect(() => {
        const audioElement = audioRef.current;
        console.log('[DEBUG] Audio src/element effect triggered. Src:', audioSrc);
        if (audioSrc && audioElement) {
            console.log('[DEBUG] Audio src and element exist. Loading new audio source.');
            audioElement.load(); // Ensure the new source is loaded

            const handleCanPlay = () => {
                console.log('[DEBUG] "canplay" event fired. Attempting to play.');
                // Autoplay when the audio is ready
                audioElement.play().catch(e => console.error("[DEBUG] Autoplay failed:", e));
            };
            audioElement.addEventListener('canplay', handleCanPlay);

            return () => {
                audioElement.removeEventListener('canplay', handleCanPlay);
            };
        }
    }, [audioSrc]);

    // This effect syncs the isPlaying state with the audio element's state.
    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        const handlePlay = () => {
            console.log('[DEBUG] Audio playing.');
            setIsPlaying(true);
        };
        const handlePause = () => {
            console.log('[DEBUG] Audio paused.');
            setIsPlaying(false);
        };

        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);
        audioElement.addEventListener('ended', handlePause); // Also set to not playing on end

        return () => {
            audioElement.removeEventListener('play', handlePlay);
            audioElement.removeEventListener('pause', handlePause);
            audioElement.removeEventListener('ended', handlePause);
        };
    }, []); // Empty dependency array means this runs once and cleans up on unmount

    const generateAudio = useCallback(async (story: string, language: 'fr' | 'en') => {
        if (!story) {
            console.log('[DEBUG] generateAudio called with empty story. Aborting.');
            return;
        }
        console.log('[DEBUG] generateAudio called. Starting audio generation process.');
        setIsAudioLoading(true);
        setAudioError(null);
        setAudioSrc(null); // Clear previous src to trigger effects correctly

        try {
            const url = await generateStoryAudio(story, language);
            console.log('[DEBUG] Successfully generated audio. Received URL:', url);
            setAudioSrc(url); // This will trigger the auto-play effect
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setAudioError(`${errorPrefix}${errorMessage}`);
        } finally {
            setIsAudioLoading(false);
        }
    }, [errorPrefix]);

    const togglePlayPause = useCallback(() => {
        const audioElement = audioRef.current;
        if (!audioElement || !audioSrc) return;

        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play().catch(e => console.error("Play failed:", e));
        }
    }, [isPlaying, audioSrc]);

    const clearAudio = useCallback(() => {
        console.log('[DEBUG] Clearing audio state.');
        const audioElement = audioRef.current;
        if (audioElement) {
            audioElement.pause();
            // Setting src to empty string is more effective than removeAttribute
            audioElement.src = '';
            audioElement.load();
        }
        if (audioSrc) {
            URL.revokeObjectURL(audioSrc);
        }
        setAudioSrc(null);
        setIsPlaying(false);
        setAudioError(null);
        setIsAudioLoading(false);
    }, [audioSrc]);

    return { audioSrc, isAudioLoading, audioError, isPlaying, audioRef, generateAudio, clearAudio, togglePlayPause };
};