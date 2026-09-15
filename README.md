# AI Interview Coach

A browser-based mock interview app. It collects a candidate's profile, generates tailored interview questions with Google's Gemini API, records answers, monitors the webcam feed for basic proctoring signals (multiple faces, looking away, device usage), and gives AI-scored feedback per answer.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- TensorFlow.js (`blazeface`, `coco-ssd`) for webcam-based face/device detection
- Google Gemini API for question generation and answer feedback, called through a serverless proxy (`api/gemini.ts`) so the key never reaches the browser

## Setup

```bash
npm install
cp .env.example .env
```

Add your Gemini API key to `.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey). Never commit your `.env` file or hardcode the key in source.

The frontend calls `/api/gemini`, a Vercel serverless function that holds the key server-side. Plain `npm run dev` (Vite only) won't serve that route, so for local development with the API working, run it through the Vercel CLI instead:

```bash
npm install -g vercel   # once
vercel dev
```

## Scripts

```bash
npm run dev       # start Vite dev server (frontend only, /api routes unavailable)
npm run build     # type-check and build for production
npm run lint      # run eslint
npm run preview   # preview the production build
```

Deployed on Vercel, set `GEMINI_API_KEY` (not prefixed with `VITE_`) as an environment variable in the project settings so it stays server-side only.
