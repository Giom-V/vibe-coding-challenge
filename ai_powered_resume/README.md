# AI-powered resume

## Description

An AI-powered resume. Don't just read it, but ask Gemini questions about me (it will know some anecdotes that are not written), tailor it according to the role you want to propose to me or even ask for an audio overview.

## **[Try it on AI Studio](https://bit.ly/giom-ai-resume)**

## Initial Prompt

Here are my resume and my linkedin profile. Also feel free to look on the internet for details about me. I want you to build an interactive resume that would be AI powered:
* if possible, try to use grounding with google search to find past and upcoming talks I'm giving
* For each line, save (but hidden), on top of what's already written a longer version of what I did (I will review it myself, but you can write down a first version). And add a gemini button that can be pressed to ask Gemini more about what I exactly did during this job (of course, don't forget to prompt the model to sell me under my best profile, not to criticize me). There could be some prefilled prompts provided.
* Add a button to generate an audio overview of my profile (maybe with preset so one can ask to focus on one aspect of my professional life). See below how to use the TTS model to generate the audio overview 
* for each experience/training, use grounding to find links related to what I worked on or what the company is/does 
Make the code as modular as possible with dedicated files for each module or feature so that it's easier to maintain. You should also store the different parts of my resume in dedicated json (or yaml if you prefer, like I do) files. You could also set it up so that I can provide a list of talks if you can't find any so that it's not empty, and depending on the date you can display them as upcoming or in the past. Also set up a folder where I can add different pictures so you can show a different one each time. And maybe other pictures from my talks (like a slideshow).

As promised, here's how to use the TTS model:
```
async function saveWaveFile(
   filename,
   pcmData,
   channels = 1,
   rate = 24000,
   sampleWidth = 2,
) {
   return new Promise((resolve, reject) => {
      const writer = new wav.FileWriter(filename, {
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
      });

      writer.on('finish', resolve);
      writer.on('error', reject);

      writer.write(pcmData);
      writer.end();
   });
}

async function main() {
   const ai = new GoogleGenAI({});

   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: 'Say cheerfully: Have a wonderful day!' }] }],
      config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
               voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
               },
            },
      },
   });

   const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
   const audioBuffer = Buffer.from(data, 'base64');

   const fileName = 'out.wav';
   await saveWaveFile(fileName, audioBuffer);
}
await main();
```
And here's how you use grounding:
```
// Define the grounding tool
const groundingTool = {
  googleSearch: {},
};

// Configure generation settings
const config = {
  tools: [groundingTool],
};

// Make the request
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "Who won the euro 2024?",
  config,
});

// Print the grounded response
console.log(response.text);
// The urls used are listed in response.candidates[0]?.groundingMetadata?.groundingChunks.web.uri (title for their title)
```

## Time Spent

I'd say nearly a day all in all.

## AI Tools Used

*   [AI Studio](https://ai.studio/apps)
*   [Gemini](https://deepmind.google/models/gemini/)
*   [Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search)
*   [Gemini TTS](https://ai.google.dev/gemini-api/docs/speech-generation)

## Challenges

Finding a good balance between when I want to hardcode or precisely steer, and what I want to be dynamic. It ended up taking way more time than I expected and I'm still not 100% satisfied with the result.

## Learnings

Even with grounding and some info about me on the web, Gemini is still not as good as me to talk about me.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## To Do

I don't think I'll ever have the time to actually finish to polish the app (we all know it will never be finished) but here are some ideas to push it further:
* Better UX when asking Gemini.
* Maybe a chat to have follow-up questions
