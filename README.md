# AI Interview Coach

A browser-based mock interview app. It collects a candidate's profile, generates tailored interview questions with Google's Gemini API, records answers, monitors the webcam feed for basic proctoring signals (multiple faces, looking away, device usage), and gives AI-scored feedback per answer.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- TensorFlow.js (`blazeface`, `coco-ssd`) for webcam-based face/device detection
- Google Gemini API for question generation and answer feedback

## Setup

```bash
npm install
cp .env.example .env
```

Add your Gemini API key to `.env`:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey). Never commit your `.env` file or hardcode the key in source — it's used client-side, so keep the key scoped/restricted in Google Cloud Console, and prefer proxying requests through a backend for a production deployment.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # type-check and build for production
npm run lint      # run eslint
npm run preview   # preview the production build
```
