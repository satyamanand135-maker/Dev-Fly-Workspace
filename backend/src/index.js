// backend/src/index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { githubCallback } from './controllers/auth.js'; 
import { getUserRepos, getRepoCommits } from './controllers/github.js';
import { connectLinkedIn, linkedinCallback } from './controllers/linkedin.js'; 

// 🆕 Import your new X & Reddit route controllers
import { connectX, xCallback } from './controllers/x.js';
import { connectReddit, redditCallback } from './controllers/reddit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Base health check
app.get('/api/health', (req, res) => {
  res.json({ status: "Backend operational", timestamp: new Date() });
});

// ─── OAUTH LIFECYCLE INTEGRATION NODES ────────────────────────────────────────
app.get('/api/auth/callback/github', githubCallback);

// LinkedIn Integration Triggers
app.get('/api/auth/connect/linkedin', connectLinkedIn);
app.get('/api/auth/callback/linkedin', linkedinCallback);

// 🆕 X (Twitter) Integration Triggers (OAuth 2.0 PKCE / Authorization Code)
app.get('/api/auth/connect/x', connectX);
app.get('/api/auth/callback/x', xCallback);

// 🆕 Reddit Integration Triggers
app.get('/api/auth/connect/reddit', connectReddit);
app.get('/api/auth/callback/reddit', redditCallback);

// ─── GITHUB PIPELINE ROUTES ───────────────────────────────────────────
app.get('/api/github/repos', getUserRepos);
app.get('/api/github/repos/:repo_name/commits', getRepoCommits);

// ─── LIVE GEMINI AI GENERATION ROUTE ──────────────────────────────────────────
app.post('/api/ai/generate-drafts', async (req, res) => {
  const { repo_name, commit_message, commit_sha } = req.body;

  if (!commit_message) {
    return res.status(400).json({ error: "Missing commit context for AI processing" });
  }

  const prompt = `
    You are an elite developer and growth hacker. Analyze this GitHub commit and generate highly contextual social media posts tailored for 4 distinct platforms: X (Twitter), LinkedIn, Reddit, and Instagram.

    CONTEXT:
    - Repository Name: ${repo_name}
    - Commit SHA: [${commit_sha}]
    - Commit Message: "${commit_message}"

    PLATFORM REQUIREMENTS:
    1. X: High-impact, punchy, "build in public" style. Use 1-2 relevant hashtags, maybe a single bullet point. Keep it under 280 characters.
    2. LinkedIn: Professional, educational, framework-oriented. Focus on engineering decisions, scalability, or clean code abstractions.
    3. Reddit: Authentic, collaborative, casual. Format it like a "Show r/dev" or "Today I optimized" post asking a technical question to ignite conversation. Do not use hashtags.
    4. Instagram: High-tech visual vibe. Short, clean caption with bulleted status metrics, followed by clean developer hashtags blocks.

    CRITICAL: Return your response ONLY as a valid JSON object matching this exact structure, with no extra text or markdown code blocks:
    {
      "X": "string content",
      "LinkedIn": "string content",
      "Reddit": "string content",
      "Instagram": "string content"
    }
  `;

  try {
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const drafts = JSON.parse(aiResponse.text);
    return res.json({ drafts });

  } catch (err) {
    console.error("Gemini AI text matrix composition failed:", err.message);
    return res.status(500).json({ error: "AI Engine encountered an execution fault." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Creator Engine server alive on: http://localhost:${PORT}`);
});