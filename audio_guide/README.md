# Audio Guide for Family Holidays

## Description

I was travelling in Italy with my wife and daughter and was using a lot Deep-research + Podcast in the [Gemini app](gemini.google.com) to generate podcast about the cities we were about to visit. It works really well but it's a lot of manual steps (write the prompt, wait for the deep-research plan, approve it, wait for deep-research, ask for a podcast overview, wait for it...), so I figured I would try to make it myself using AI Studio, and here it is.

## **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1SgDNQ_mHx_k2KOJm1vIrIX8nIVwS3btT?showPreview=true)**

## Initial Prompt

"Make an app in French where I can input something I'm about to visit (a city, a museum), and it will generate a transcript of a discussion between Claire and Guillaume, explaining to their daughter, Aurore, who is only listening, not actively talking, about what they are about to visit."

## Time Spent

I actually spent quite some time on this one because I was trying to do it on the phone, and AI Studio interface is not very good on the phone for that (and also it breaks the generation if you leave the page, so I had to rerun the same prompts multiple times). But all in all, I don't think I spent more than 2h on it.

## AI Tools Used

*   [AI Studio](ai.studio/apps)
*   [Gemini](https://deepmind.google/models/gemini/)
*   [Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search)
*   [Gemini TTS](https://ai.google.dev/gemini-api/docs/speech-generation)


## Challenges

The main challenge was to teach Gemini how to use the TTS as the AI Studio version it doesn't know about it yet. But I used the "[codegen prompt](https://github.com/googleapis/js-genai/blob/main/codegen_instructions.md)" I recently worked on to teach LLS how to use the Gemini SDK and afterwards it worked well.

## Learnings

AI Studio on the phone is not a good interface for vibe coding. Next time I'll maybe try Jules.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## To Do

I don't think I'll ever have the time to actually finish to polish the app (we all know it will enver be finished) but here are some ideas to push it further:
* Add better deep-reserach capabilities
* Select male/female voices for the right participants
* Fine-tune the prompts (for ex. at the moment it ignores the already visited places while I would like it to create bridges with what we're previously seen)
* Upload the generated podcast in a Youtube music playlist
