
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';
import { generateTtsPrompt } from '../prompts';

// Initialize the Gemini AI client once.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a story based on a prompt.
 * @param prompt - The prompt to send to the text generation model.
 * @returns A promise that resolves to the generated story text and its sources.
 */
export const generateStoryContent = async (prompt: string): Promise<{ story: string, sources: any[] | undefined }> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const story = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { story, sources };
};

/**
 * Converts a markdown string to plain text, preserving line breaks for conversational flow.
 * @param markdown - The markdown string to convert.
 * @returns The plain text representation.
 */
const markdownToPlainText = (markdown: string): string => {
    if (!markdown) return '';

    // Convert markdown to HTML
    let text = marked(markdown) as string;

    // Replace block-level tags with newlines to preserve structure
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // Strip all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Decode common HTML entities
    text = text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&nbsp;/g, ' ');

    // Clean up extra newlines and leading/trailing whitespace
    return text.replace(/\n\s*\n/g, '\n').trim();
}

/**
 * Helper function to write a string to a DataView.
 */
const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
};

/**
 * Creates a WAV file Blob from raw PCM data by prepending a valid WAV header.
 * The Gemini TTS API returns single-channel, 24kHz, 16-bit raw PCM.
 * @param pcmData The raw PCM audio data.
 * @returns A Blob representing a complete WAV file.
 */
const createWavBlob = (pcmData: Uint8Array): Blob => {
    const sampleRate = 24000;
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const bitsPerSample = 16;
    const dataSize = pcmData.length;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // file size - 8
    writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // audio format (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    new Uint8Array(buffer).set(pcmData, 44);
    
    return new Blob([view], { type: 'audio/wav' });
};

/**
 * Generates audio from a story text using Text-to-Speech.
 * @param storyText - The text to convert to speech.
 * @param language - The language for the TTS prompt.
 * @returns A promise that resolves to an object URL for the generated audio.
 */
export const generateStoryAudio = async (storyText: string, language: 'fr' | 'en'): Promise<string> => {
    const plainText = markdownToPlainText(storyText);
    const ttsPrompt = generateTtsPrompt(language, plainText);

    console.log('[DEBUG] TTS Prompt sent to API:', ttsPrompt);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: ttsPrompt }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        {
                            speaker: 'Claire',
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: 'Erinome' }
                            }
                        },
                        {
                            speaker: 'Guillaume',
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: 'Puck' }
                            }
                        }
                    ]
                }
            }
        }
    });
    
    console.log('[DEBUG] Full API response for audio generation:', JSON.stringify(response, null, 2));

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    console.log('[DEBUG] Extracted base64 audio data length:', data ? data.length : 'No data found');

    if (!data) {
        throw new Error("No audio data received from the API. Check the full response log above for details.");
    }

    // Decode base64 to a raw byte array (PCM data)
    const binaryString = atob(data);
    const len = binaryString.length;
    const pcmData = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        pcmData[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob with a proper WAV header
    const audioBlob = createWavBlob(pcmData);
    console.log('[DEBUG] WAV Blob created:', audioBlob);

    const objectURL = URL.createObjectURL(audioBlob);
    console.log('[DEBUG] Created Object URL for WAV Blob:', objectURL);
    return objectURL;
};
