# Vulnerability Detector

A secure, AI-powered code analysis tool built with Next.js, Tailwind CSS, and Google Gemini.

## Features
- **Code Analysis**: Paste code or upload files.
- **AI-Powered Detection**: Identify OWASP vulnerabilities using Gemini 1.5.
- **Detailed Reports**: View severity levels, explanations, and suggested fixes.
- **Secure & Private**: Code is processed securely via your API key.

## Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Create a `.env.local` file and add your Google Gemini API key:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **AI**: Google Generative AI SDK
- **Icons**: Lucide React

## Troubleshooting
If the app doesn't load:
1. Ensure dependencies are installed: `npm install`
2. Restart the dev server: `npm run dev`
3. Verify your API Key in `.env.local`.
