import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { buildPrompt } from '../prompts/buildPrompt.js';
import { generateContent } from '../services/openrouter.js';

const app = express();
const PORT = 3001;

// Rate limiting (in-memory, per IP)
const rateLimitMap = new Map();
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 30 // 30 requests per minute
};

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.timestamp > RATE_LIMIT.windowMs) {
      rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip) || { count: 0, timestamp: now };

  if (now - record.timestamp > RATE_LIMIT.windowMs) {
    // Reset window
    record.count = 1;
    record.timestamp = now;
  } else {
    record.count++;
  }

  rateLimitMap.set(ip, record);

  if (record.count > RATE_LIMIT.maxRequests) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.'
    });
  }

  next();
}

// Input sanitization - detect prompt injection attempts
function sanitizeInput(content) {
  if (!content) return '';

  const trimmed = content.trim();

  // Detect potential prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above)/i,
    /disregard\s+(all\s+)?(previous|above)/i,
    /forget\s+(all\s+)?(previous|above)/i,
    /new\s+(instructions?|rules?|directives?)/i,
    /override\s+(instructions?|rules?|directives?)/i,
    /system\s*:\s*/i,
    /<\|.*?\|>/g, // Special tokens
    /```[\s\S]*?```/g, // Code blocks (could contain injection)
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(trimmed)) {
      throw new Error(
        'Your input contains patterns that may interfere with the system. Please rephrase your content.'
      );
    }
  }

  // Length limit
  const maxLength = 5000;
  if (trimmed.length > maxLength) {
    throw new Error(`Content is too long. Maximum ${maxLength} characters allowed.`);
  }

  return trimmed.slice(0, maxLength);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit);

// Friendly error messages
const errorMessages = {
  default: 'Something went wrong. Please try again.',
  missing_content: 'Please enter some content to generate.',
  sanitize_failed: 'Your input contains unsupported patterns. Please rephrase.',
  rate_limited: 'You\'re generating too quickly. Please wait a moment.',
  api_error: 'AI service is unavailable. Please try again in a moment.',
  timeout: 'Request timed out. Please try again.',
};

// Routes
app.post('/generate', async (req, res) => {
  try {
    console.log('Received generate request:', { persona: req.body.persona, tone: req.body.tone });
    
    const { content, persona = 'storyteller', tone = 'professional', length = 'medium', emojiLevel = 'medium' } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: errorMessages.missing_content });
    }

    // Sanitize input
    const sanitizedContent = sanitizeInput(content);
    console.log('Content sanitized, length:', sanitizedContent.length);

    // Build prompt
    const prompt = buildPrompt({ content: sanitizedContent, persona, tone, length, emojiLevel });
    console.log('Prompt built, calling OpenRouter...');

    // Call OpenRouter with retry logic
    const output = await generateContent(prompt);
    console.log('OpenRouter response received, length:', output?.length);

    res.json({ output });
  } catch (error) {
    console.error('Error generating:', error.message);
    console.error('Full error:', error);

    // Return appropriate error message
    let statusCode = 500;
    let errorMessage = errorMessages.default;

    if (error.message.includes('patterns')) {
      statusCode = 400;
      errorMessage = errorMessages.sanitize_failed;
    } else if (error.message.includes('too long')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes('OpenRouter')) {
      errorMessage = errorMessages.api_error;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Draftly API running on http://localhost:${PORT}`);
  console.log(`Rate limit: ${RATE_LIMIT.maxRequests} requests per ${RATE_LIMIT.windowMs / 1000} seconds`);
  console.log(`Environment check - API Key present: ${!!process.env.OPENROUTER_API_KEY}`);
});

export default app;
