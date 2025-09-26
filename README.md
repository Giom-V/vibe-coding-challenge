# Vibe-Coded App Challenge 2025

Welcome to my "Vibe-Coded App Challenge 2025"! This repository documents my journey of creating and publishing an application each week, primarily using AI-powered coding assistants.

## What is "Vibe Coding"?

"Vibe coding" is a new term used to describe the process of building software in close collaboration with AI. It's a partnership where I provide the high-level vision, the "vibe," and the AI helps with the implementation details. This could involve generating boilerplate code, suggesting algorithms, debugging complex issues, or even designing UI components. The goal is to stay in the creative flow and focus on the overall feel and functionality of the application, while letting the AI handle the more tedious aspects of coding.

Of course, the maintenance of this repo is also going to be AI-powered, with the help of [Jules](https://jules.google.com).

## The Challenge

The goal of this challenge is to explore the capabilities of modern AI in software development. Each week (amended to fortnightly), I will tackle a new project, leveraging tools like Google's AI Studio, Gemini Code Assist, and other LLMs such as Claude to generate, debug, and refactor code.

This experiment aims to:

*   Understand the strengths and weaknesses of different AI coding tools.
*   Discover best practices for collaborating with AI on software projects.
*   Build a diverse portfolio of small, functional applications.
*   Share my findings and experiences with the developer community.
*   Prove how easy it is to translate your ideas into proper apps.

## Projects

Projects are organized by week in reverse chronological order. Each project folder contains the complete source code and a dedicated `README.md` file with more details about the application, the development process, and the AI tools used.

| App | Link to app | Code |
| --- | ----------- | ---- |
| Escape room | **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1ZifLzSuOqzg3Ita9CC7kmRweauVanCy7?fullscreenApplet=true)** | [escape_room](./escape_room/) |
| AI-powered resume | **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1VRVKZ8qFAG6Rgc1np3u8g5eBgbmI9094?fullscreenApplet=true)** | [ai_powered_resume](./ai_powered_resume/) |
| Audio Guide for Family Holidays | **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1SgDNQ_mHx_k2KOJm1vIrIX8nIVwS3btT?fullscreenApplet=true)** | [audio_guide](./audio_guide/) |

---
### Sep 26th: Cleaning log scanner

*   **Description:** An app to digitalize the [paper log](./cleaning_log/example/todo_menage.jpg) of my cleaning lady using Gemini  visual understanding
*   **AI Tools Used:** [AI Studio](https://ai.studio/apps) and [Gemini Visual Understanding](https://ai.google.dev/gemini-api/docs/image-understanding).
*   **[Try it on AI Studio](https://ai.studio/apps/drive/1FH1F_qoepoiRB7AjUPtqcSIjx1ldU-F_?fullscreenApplet=true)**
*   **Project folder:** [cleaning_log](./cleaning_log/)

---
### Sep 2nd: Nano-banana powered escape room

*   **Description:** A very quickly vice-coded (15mn) escape game using our new image generation model (nano-banana) to create an escape room game.
*   **AI Tools Used:** [AI Studio](https://ai.studio/apps) and [Nano-banana](https://ai.google.dev/gemini-api/docs/image-generation).
*   **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1ZifLzSuOqzg3Ita9CC7kmRweauVanCy7?fullscreenApplet=true)**
*   **Project folder:** [escape_room](./escape_room/)
---

### Aug 19th: AI-powered resume

*   **Description:** An AI-powered resume. Don't just read it, but ask Gemini questions about me (it will know some anecdotes that are not written), tailor it according to the role you want to propose to me or even ask for an audio overview.
*   **AI Tools Used:** [AI Studio](https://ai.studio/apps) and [Gemini TTS](https://deepmind.google/models/gemini/).
*   **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1VRVKZ8qFAG6Rgc1np3u8g5eBgbmI9094?fullscreenApplet=true)**
*   **Project folder:** [ai_powered_resume](./ai_powered_resume/)
---

### Aug 1st: Audio Guide for Family Holidays

*   **Description:** An app that provides audio guides for family holidays.
*   **AI Tools Used:** [AI Studio](https://ai.studio/apps) and [Gemini TTS](https://deepmind.google/models/gemini/).
*   **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1SgDNQ_mHx_k2KOJm1vIrIX8nIVwS3btT?fullscreenApplet=true)**
*   **Project folder:** [audio_guide](./audio_guide/)

---

*More coming soon...*

---

## Tips

* Be patient (or do something at the same time like reading a book, catching-up with emails, or just play a video game, the generation take a couple of minutes each time.
* ALWAYS DOUBLE CHECK. You not a developper anymore (if you ever were), you're a product owner and a QC.
* The longer and more detailled the prompt is, the better the result be, but personally I usually prefer to take my time and work iteratively.
* If you're not in a rush, fix one thing at a time instead of sending mutltiple problems to the model at the same time (unless you are certain they are closely related).
* Always ask the model to create a very modular app with dedicated files for each functionality or module (or to list the prompts so it's easy for you to find and manually update them). Since most of the time the AI tries to completely rewrite the files, it will be quicker if it only has to rewrite a small one instead of a very long one when you only want to update something simple.
