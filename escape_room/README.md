# Nano-banana powered escape room

## Description

I had 15mn before the launch of Gemini-2.5-image-generation aka. Nano-banana, so I made this quick prototype of an AI generated espace room. This is very basic but it shows some potential.

## **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1ZifLzSuOqzg3Ita9CC7kmRweauVanCy7?fullscreenApplet=true)**

## Initial Prompt

"Make an espace room game using the new image generation to create all assets on the fly. Here's the documentation: https://ai.google.dev/gemini-api/docs/image-generation.md.txt"

## Time Spent

15mn because we were shipping the model :)

## AI Tools Used

*   [AI Studio](ai.studio/apps)
*   [Gemini](https://deepmind.google/models/gemini/)
*   [Gemini 2.5 Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)


## Challenges

None, apart from the fact that it's not a very interesting game...

## Learnings

As long as you accept that it won't be polished you can make things very quickly.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## To Do

Making it a proper interesting game, but I guess it would be too costly.
