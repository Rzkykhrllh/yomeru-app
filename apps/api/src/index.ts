import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { tokenizeRouter } from './routes/tokenize.routes';
import { vocabsRouter } from './routes/vocabs.routes';
import { textsRouter } from './routes/texts.routes';
import { textVocabsRouter } from './routes/textVocabs.routes';
import { foldersRouter } from './routes/folders.routes';
import { tagsRouter } from './routes/tags.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — restrict to known frontend origin in production
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// Clerk auth middleware — attaches auth state to all requests
app.use(clerkMiddleware());

// Rate limiter for the tokenize endpoint (CPU-bound NLP)
const tokenizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes — require valid Clerk session
app.use('/api/tokenize', requireAuth(), tokenizeLimiter, tokenizeRouter);
app.use('/api/vocabs', requireAuth(), vocabsRouter);
app.use('/api/texts', requireAuth(), textsRouter);
app.use('/api/text-vocabs', requireAuth(), textVocabsRouter);
app.use('/api/folders', requireAuth(), foldersRouter);
app.use('/api/tags', requireAuth(), tagsRouter);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
