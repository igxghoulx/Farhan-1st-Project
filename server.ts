/**
 * TrustLens AI - Full-Stack Express Server
 * Handles API routes for real cybersecurity risk analysis with SSE progress streaming
 * and Vite middleware in development.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { runMessageAnalysis, runUrlAnalysis, StageCallback } from './src/server/modules/analysisOrchestrator.js';
import { reportStore } from './src/server/modules/reportStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '500kb' }));

// Simple in-memory sliding-window rate limiter
const ipRequests = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40; // 40 requests per minute

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = ipRequests.get(ip);
  if (!record || now > record.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before running additional scans.',
    });
    return;
  }

  record.count += 1;
  next();
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TrustLens AI Real Analysis Core',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Demo samples
app.get('/api/samples', (_req, res) => {
  const samples = reportStore.getSampleReports();
  res.json({ samples });
});

// Get analysis result by ID
app.get('/api/result/:id', (req, res) => {
  const report = reportStore.get(req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Assessment report not found or session has expired.' });
    return;
  }
  res.json({ report });
});

// Analyze URL (Standard JSON endpoint)
app.post('/api/analyze/url', rateLimiter, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      res.status(400).json({ error: 'Please paste a valid website address or URL.' });
      return;
    }

    const report = await runUrlAnalysis(url.trim());
    res.json({ success: true, report });
  } catch (err: unknown) {
    console.error('[API /api/analyze/url] Error:', err);
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Unable to complete URL risk assessment.',
    });
  }
});

// Real-Time SSE Stream Endpoint for Progress Tracking
app.post('/api/analyze/url/stream', rateLimiter, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || !url.trim()) {
    res.status(400).json({ error: 'Please paste a valid website address or URL.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onStage: StageCallback = (stageId, label, status, detail) => {
    sendEvent('stage', { stageId, label, status, detail });
  };

  try {
    const report = await runUrlAnalysis(url.trim(), onStage);
    sendEvent('complete', { report });
    res.end();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Analysis failed';
    sendEvent('error', { error: msg });
    res.end();
  }
});

// Analyze Message / Email
app.post('/api/analyze/message', rateLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      res.status(400).json({
        error: 'Please paste a suspicious message or email containing at least 5 characters.',
      });
      return;
    }

    const report = await runMessageAnalysis(message.trim());
    res.json({ success: true, report });
  } catch (err: unknown) {
    console.error('[API /api/analyze/message] Error:', err);
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Unable to complete message risk assessment.',
    });
  }
});

// Multi-Turn Gemini Chatbot Endpoint
app.post('/api/chat', rateLimiter, async (req, res) => {
  try {
    const { messages, persona, context } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please provide messages array for the conversation.' });
      return;
    }

    const { handleChatMessage } = await import('./src/server/modules/chatService.js');
    const result = await handleChatMessage({ messages, persona, context });
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error('[API /api/chat] Error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Chat processing failed.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TrustLens AI] Server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[TrustLens AI] Server startup failure:', err);
  process.exit(1);
});
