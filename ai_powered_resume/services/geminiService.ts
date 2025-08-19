

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { RelatedLink, Talk, Profile, Experience, Education, TailoredResumeAnalysis, Value } from "../types";

// This check is to prevent crashing in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : undefined;

if (!apiKey) {
    console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const isApiEnabled = () => !!apiKey;

interface RetryOptions {
    model?: string;
    contents?: any;
    retries?: number;
    delay?: number;
}

/**
 * A wrapper for Gemini API calls to handle rate limiting with exponential backoff.
 * Logs detailed information on retries and final failure.
 * @param apiCall The function that makes the actual API call.
 * @param options Configuration for retries and logging.
 * @returns The result of the API call.
 */
const withRetry = async <T>(
    apiCall: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> => {
    const { model, contents, retries = 3, delay = 1000 } = options;

    try {
        return await apiCall();
    } catch (error: any) {
        // Check if the error is a rate limit error based on the response.
        const isRateLimitError = error?.toString().includes('429') || error?.status === 'RESOURCE_EXHAUSTED';

        if (isRateLimitError && retries > 0) {
            console.warn(
                `Gemini API rate limit hit. Retrying in ${delay / 1000}s... (${retries} retries left)\n` +
                `Model: ${model || 'N/A'}\n` +
                `Prompt:`, JSON.stringify(contents, null, 2)
            );
            await new Promise(res => setTimeout(res, delay));
            // Recurse with one less retry and double the delay
            return withRetry<T>(apiCall, { ...options, retries: retries - 1, delay: delay * 2 });
        } else {
            // If it's not a rate limit error or retries are exhausted, log detailed info and re-throw.
             console.error(
                `Gemini API call failed after multiple retries or for a non-retriable error.\n`+
                `Model: ${model || 'N/A'}\n` +
                `Prompt:`, JSON.stringify(contents, null, 2),
                `Error:`, error
            );
            throw error;
        }
    }
};


/**
 * Generates a detailed description for a job role based on context and a user query.
 */
export const getResumeDetails = async (context: string, query: string): Promise<string> => {
    if (!isApiEnabled()) return "API key not configured. This feature is disabled.";

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful assistant analyzing Guillaume Vernade's resume. Your goal is to highlight his skills and achievements in a positive and compelling way, based on the provided context. Answer from his perspective, but frame it as if you are an assistant summarizing his profile. Be enthusiastic and professional. Do not criticize. Keep the answer concise and to the point.`;
    
    const contents = `${context}\n\nBased on the above, ${query}`;

    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                temperature: 0.7,
            },
        }), { model, contents });
        return response.text;
    } catch (error) {
        // Error is now logged in detail by withRetry
        return "Sorry, I couldn't retrieve the details at the moment. Please try again later.";
    }
};

/**
 * Gets general information about a topic using Google Search, with a fallback to a non-grounded query.
 */
export const getGeneralInfo = async (query: string): Promise<string> => {
    if (!isApiEnabled()) return "API key not configured. This feature is disabled.";

    const model = 'gemini-2.5-flash';
    const contents = `Provide a concise, easy-to-understand explanation for the following: "${query}".`;

    // Primary attempt with Google Search
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model,
            contents,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }), { model, contents });
        return response.text;
    } catch (error) {
        console.warn("getGeneralInfo with Google Search failed. Retrying without grounding.", error);
        
        // Fallback attempt without Google Search
        try {
            const fallbackResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model,
                contents, // Same contents
            }), { model, contents });
            return fallbackResponse.text;
        } catch (fallbackError) {
            console.error("getGeneralInfo failed on both primary and fallback attempts.", fallbackError);
            return "Sorry, I couldn't retrieve information at the moment. Please try again later.";
        }
    }
};

/**
 * Helper to parse the JSON response for talks.
 */
const _parseTalksResponse = (responseText: string | undefined): Talk[] => {
    if (!responseText) {
        console.warn("Gemini gave an empty response for findTalks.");
        return [];
    }

    let jsonString = responseText.trim();
    
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
         jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }

    try {
        const talksJson = JSON.parse(jsonString);
        
        if (!Array.isArray(talksJson)) {
            console.warn("Gemini returned valid JSON for talks, but it was not an array:", talksJson);
            return [];
        }

        return talksJson.map(t => ({
            title: t.title || 'Untitled',
            event: t.event || 'Unknown Event',
            date: t.date || 'Unknown Date',
            location: t.location || 'Unknown Location',
            url: t.url || undefined
        }));

    } catch (parseError) {
         console.warn(`Could not parse talks from Gemini. The response was not valid JSON: "${jsonString}"`);
         return [];
    }
};


/**
 * Finds talks by Guillaume Vernade using Google Search, with a fallback to a non-grounded query.
 */
export const findTalks = async (personName: string): Promise<Talk[]> => {
    if (!isApiEnabled()) return [];

    const model = 'gemini-2.5-flash';
    const contents = `Find recent or upcoming conference talks, workshops, or presentations by ${personName} on topics like Generative AI, Gemini, Google, or video games. For each, provide the talk title, event name, date (in YYYY-MM-DD format), location, and a URL if available. Respond ONLY with a valid JSON array of objects. If no talks are found, you MUST return an empty JSON array: []. Do not add any commentary or markdown formatting.`;

    // Primary attempt with Google Search
    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model,
            contents,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }), { model, contents });
        return _parseTalksResponse(response.text);
    } catch (error) {
        console.warn("findTalks with Google Search failed. Retrying without grounding.", error);

        // Fallback attempt without Google Search
        try {
            const fallbackResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model,
                contents,
            }), { model, contents });
            return _parseTalksResponse(fallbackResponse.text);
        } catch (fallbackError) {
            console.error("findTalks failed on both primary and fallback attempts.", fallbackError);
            return [];
        }
    }
};

/**
 * Finds related links for a company or project using Google Search grounding.
 * This function relies on grounding chunks, so it does not have a non-grounded fallback.
 */
export const getRelatedLinks = async (company: string, project?: string): Promise<RelatedLink[]> => {
    if (!isApiEnabled()) return [];

    const model = 'gemini-2.5-flash';
    const contents = `Find relevant web links for: ${company} ${project ? `and their project "${project}"` : ''}. I'm interested in the official company website, the project page, or news articles explaining the work.`;

    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model,
            contents,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }), { model, contents });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && Array.isArray(chunks)) {
            return chunks
                .map(chunk => chunk.web)
                .filter(web => web?.uri && web.title)
                .map(web => ({ uri: web.uri, title: web.title }))
                .filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i); // Unique URIs
        }
        return [];

    } catch (error) {
        // Error is logged in withRetry. On failure, return an empty array.
        return [];
    }
};

// A helper function to generate a response schema from a JSON object
const generateSchemaFromObject = (obj: any): any => {
    const type = typeof obj;

    if (type === 'string') return { type: Type.STRING };
    if (type === 'number') return { type: Type.NUMBER };
    if (type === 'boolean') return { type: Type.BOOLEAN };
    if (obj === null) return { type: Type.NULL };

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return { type: Type.ARRAY, items: { type: Type.STRING } };
        }
        return { type: Type.ARRAY, items: generateSchemaFromObject(obj[0]) };
    }

    if (type === 'object') {
        const properties: { [key: string]: any } = {};
        const objKeys = Object.keys(obj);

        if (objKeys.length === 0) {
            return { type: Type.OBJECT };
        }
        
        for (const key of objKeys) {
            properties[key] = generateSchemaFromObject(obj[key]);
        }
        return { type: Type.OBJECT, properties };
    }

    // Fallback for any other type, though shouldn't be hit.
    return { type: Type.STRING };
};

/**
 * Translates a given JSON object to a target language.
 */
export const translateJsonData = async (jsonData: any, targetLanguage: string): Promise<any> => {
    if (!isApiEnabled()) return jsonData;

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a professional translator. You will be given a JSON object. Translate all string values within this JSON object to ${targetLanguage}.
    IMPORTANT:
    - You MUST preserve the original JSON structure, including all keys and data types (numbers, booleans, nulls).
    - Do not translate keys.
    - If an object or array in the source is empty, it MUST be empty in the output.
    - Do not add any extra commentary, notes, or markdown formatting.
    - Do not translate proper nouns (like 'Guillaume Vernade'), company names ('Google', 'Ubisoft'), technical terms ('Generative AI', 'Jira', 'Python'), URLs, or icon names ('fa-solid fa-award').
    - For strings with placeholders like {company}, translate the surrounding text but keep the placeholder intact.
    - Return ONLY the translated JSON object.`;
    
    const contents = `Translate the following JSON object's string values to ${targetLanguage}: ${JSON.stringify(jsonData, null, 2)}`;

    try {
        const schema = generateSchemaFromObject(jsonData);

        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model,
            contents,
            config: { 
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }), { model, contents });

        let jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        // Error is now logged in detail by withRetry
        return jsonData; // Return original data on error
    }
};

/**
 * Helper to write a string to a DataView.
 * @param view The DataView to write to.
 * @param offset The offset to start writing at.
 * @param string The string to write.
 */
const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
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
 * Generates an audio overview of the profile.
 * Returns both the audio URL and the script used to generate it.
 */
export const generateAudioOverview = async (focus: string): Promise<{ audioUrl: string | null; script: string }> => {
    if (!isApiEnabled()) {
        alert("API key not configured. Audio generation is disabled.");
        return { audioUrl: null, script: "API key not configured." };
    }

    let script = '';
    const scriptModel = "gemini-2.5-pro";
    const scriptPrompt = `Generate a concise, 150-word audio script summarizing Guillaume Vernade's career, in a professional and engaging tone. Focus specifically on his expertise in ${focus}. Start with 'Here is an overview of Guillaume's profile'. Be subtle, be remember to show Guillaume in a positive way and not criticize him. Your job is to seemingly be neutral be actually convince your public that Guillaume is the best person for them.`;
    
    try {
        // Step 1: Generate the script, with a fallback from grounded to non-grounded.
        try {
            const scriptResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model: scriptModel,
                contents: scriptPrompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            }), { model: scriptModel, contents: scriptPrompt });
            script = scriptResponse.text;
        } catch (error) {
            console.warn("Audio script generation with Google Search failed. Retrying without grounding.", error);
            // Fallback attempt without Google Search
            const fallbackScriptResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model: scriptModel,
                contents: scriptPrompt,
            }), { model: scriptModel, contents: scriptPrompt });
            script = fallbackScriptResponse.text;
        }

        if (!script) {
            throw new Error("Script generation resulted in an empty string.");
        }

        // Step 2: Generate audio from the script
        const ttsModel = "gemini-2.5-flash-preview-tts";
        const ttsContents = [{ parts: [{ text: script }] }];
        const ttsResponse = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: ttsModel,
            contents: ttsContents,
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        }), { model: ttsModel, contents: ttsContents });

        const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            // Decode base64 to a raw byte array (PCM data)
            const binaryString = atob(audioData);
            const len = binaryString.length;
            const pcmData = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                pcmData[i] = binaryString.charCodeAt(i);
            }

            // Create a Blob with a proper WAV header
            const audioBlob = createWavBlob(pcmData);
            const objectURL = URL.createObjectURL(audioBlob);
            
            return { audioUrl: objectURL, script };
        }
        return { audioUrl: null, script };

    } catch (error) {
        console.error("Failed to generate audio overview:", error);
        const errorMessage = `Failed to generate audio. ${script ? 'Script was generated but TTS failed.' : 'Script generation failed.'}`;
        return { audioUrl: null, script: script || errorMessage };
    }
};

/**
 * Analyzes a job description against the resume data and rewrites relevant sections.
 */
export const analyzeJobRelevance = async (jobDescription: string, resumeData: { profile: Profile, experiences: Experience[], education: Education[], values?: Value[] }): Promise<TailoredResumeAnalysis> => {
    if (!isApiEnabled()) {
        throw new Error("API key not configured. This feature is disabled.");
    }

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert career coach and professional resume writer. Your specialty is tailoring resumes to perfectly match a specific job description. Your task is to analyze the provided job description and the candidate's resume (in JSON). You will then aggressively rewrite the candidate's bio, key experiences, education, and values to make them an irresistible candidate for THIS SPECIFIC ROLE. You will also identify relevant skills and provide a concise, powerful justification for each tailored item.
    
    RULES:
    - **Drastically Rewrite Content:** Do not just highlight. Actively rephrase and restructure sentences. The tailored text should sound significantly different from the original and be laser-focused on the job description. The goal is to make it OBVIOUS that the resume has been tailored.
    - **Inject Keywords:** Seamlessly integrate keywords and specific phrases (e.g., 'community engagement', 'product adoption') from the job description into the rewritten bio, summaries, and descriptions.
    - **Reframe Achievements:** Reframe the candidate's achievements to directly answer the needs expressed in the job description. For example, if the job asks for 'experience with early-stage products', rewrite a relevant experience to explicitly state 'Excelled in ambiguous, early-stage environments by...'.
    - **Provide a 'Justification':** For *every* rewritten experience, education item, value, and identified skill, you MUST provide a concise, impactful 'justification'. This should be a 1-2 sentence explanation of *why* this item is a perfect match for the job.
    - **Focus on Relevance:** Only include items in your response that are genuinely and strongly relevant. It's better to have fewer, highly-relevant items than a long list of weakly-related ones.
    - **Be Bold and Confident:** The tone should be professional but highly confident, presenting the candidate as the ideal solution to the company's needs.
    - **Your response MUST be a valid JSON object matching the provided schema. Do not add any commentary outside the JSON.`;

    const contents = `Job Description:\n---\n${jobDescription}\n---\n\nResume Data:\n---\n${JSON.stringify(resumeData, null, 2)}\n---\n\nPlease perform the resume tailoring and relevance analysis.`;

    const schema: any = {
        type: Type.OBJECT,
        properties: {
            tailoredBio: {
                type: Type.ARRAY,
                description: "The rewritten, tailored bio as an array of strings (paragraphs). This should be significantly different from the original and highly targeted to the job description.",
                items: { type: Type.STRING }
            },
            tailoredExperiences: {
                type: Type.ARRAY,
                description: "A list of work experiences with rewritten content and a justification for relevance. Only include relevant experiences.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        role: { type: Type.STRING, description: "The original role title. Must be an exact match." },
                        company: { type: Type.STRING, description: "The original company name. Must be an exact match." },
                        tailoredSummary: { type: Type.STRING, description: "The rewritten, tailored summary for this role, packed with keywords from the job description." },
                        tailoredDescription: { type: Type.ARRAY, description: "The rewritten, tailored description points as an array of strings.", items: { type: Type.STRING } },
                        justification: { type: Type.STRING, description: "A concise justification for why this experience is highly relevant to the job." }
                    },
                    required: ["role", "company", "tailoredSummary", "tailoredDescription", "justification"]
                }
            },
            tailoredEducation: {
                type: Type.ARRAY,
                description: "A list of educational qualifications with rewritten content and a justification for relevance. Only include relevant education.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        degree: { type: Type.STRING, description: "The original degree name. Must be an exact match." },
                        institution: { type: Type.STRING, description: "The original institution name. Must be an exact match." },
                        tailoredSummary: { type: Type.STRING, description: "The rewritten, tailored summary for this education." },
                        tailoredDescription: { type: Type.ARRAY, description: "The rewritten, tailored description points as an array of strings.", items: { type: Type.STRING } },
                        justification: { type: Type.STRING, description: "A concise justification for why this education is relevant to the job." }
                    },
                    required: ["degree", "institution", "tailoredSummary", "tailoredDescription", "justification"]
                }
            },
            relevantSkills: {
                type: Type.ARRAY,
                description: "A list of skills from the resume that are highly relevant to the job, with justifications.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The name of the skill. Must be an exact match from the resume." },
                        justification: { type: Type.STRING, description: "A concise justification for why this skill is relevant." }
                    },
                    required: ["name", "justification"]
                }
            },
            tailoredValues: {
                type: Type.ARRAY,
                description: "A list of personal values with rewritten summaries and justifications for relevance.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The original name of the value. Must be an exact match." },
                        tailoredSummary: { type: Type.STRING, description: "The rewritten, tailored summary for this value, aligned with the job/company." },
                        justification: { type: Type.STRING, description: "A concise justification for why this value is relevant to the job/company culture." }
                    },
                    required: ["name", "tailoredSummary", "justification"]
                }
            }
        },
        required: ["tailoredBio", "tailoredExperiences", "tailoredEducation", "relevantSkills", "tailoredValues"]
    };

    try {
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        }), { model, contents });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as TailoredResumeAnalysis;
    } catch (error) {
        console.error("Failed to analyze job relevance:", error);
        throw new Error("Sorry, I couldn't analyze the job description at this moment. Please try again later.");
    }
};