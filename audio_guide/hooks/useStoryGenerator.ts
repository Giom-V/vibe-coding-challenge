
import { useState, useCallback } from 'react';
import { generatePrompt } from '../prompts';
import { generateStoryContent } from '../services/gemini';
import { Duration } from '../types';

export const useStoryGenerator = () => {
    const [story, setStory] = useState('');
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateStory = useCallback(async (language: 'fr' | 'en', topic: string, seen: string, duration: Duration, errorPrefix: string): Promise<string | null> => {
        if (!topic) return null;

        setIsLoading(true);
        setError(null);
        setStory('');
        setSources([]);

        try {
            const prompt = generatePrompt(language, topic, seen, duration);
            const { story: generatedStory, sources: generatedSources } = await generateStoryContent(prompt);
            setStory(generatedStory);
            if (generatedSources) {
                setSources(generatedSources);
            }
            return generatedStory;
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`${errorPrefix}${errorMessage}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { story, sources, isLoading, error, generateStory, setStory };
};
