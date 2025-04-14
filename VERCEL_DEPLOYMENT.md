# Deploying to Vercel

This application combines a Next.js frontend with a Flask backend for speech-to-text processing. Follow these steps to deploy it to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm install -g vercel`

## Deployment Steps

1. **Login to Vercel CLI**

```bash
vercel login
```

2. **Deploy to Vercel**

From the project root directory, run:

```bash
vercel
```

3. **Important Configuration Notes**

- The deployment might take longer than usual due to the heavy Python dependencies (especially the Whisper model).
- Vercel has limitations on serverless function size and execution duration. The Whisper model might exceed these limits.
- If you encounter issues, consider using a different hosting provider for the backend or using a more lightweight model.

## Known Limitations

- The Whisper model may exceed Vercel's function size limits (50MB compressed)
- Cold starts can be slow due to model loading time
- Long audio files may exceed the execution timeout (10-60 seconds depending on your plan)

## Alternative Deployment Options

If you encounter issues with Vercel deployment:

1. **Separate Frontend and Backend**
   - Deploy the Next.js frontend to Vercel
   - Deploy the Flask backend to a different provider like Heroku, Railway, or PythonAnywhere
   - Update the API endpoint URLs in the frontend code

2. **Use Vercel Edge Functions**
   - Convert the API to use Edge Functions which have fewer restrictions
   - This would require rewriting the backend in TypeScript/JavaScript

3. **Use a managed AI service**
   - Consider using OpenAI's API or another managed Speech-to-Text service instead of running Whisper locally 