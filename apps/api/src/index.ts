import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { tokenizeRouter } from './routes/tokenize.routes';
import { vocabsRouter } from './routes/vocabs.routes';
import { textsRouter } from './routes/texts.routes';
import { textVocabsRouter } from './routes/textVocabs.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — restrict to known frontend origin in production
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// Rate limiter for the tokenize endpoint (CPU-bound NLP)
const tokenizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/tokenize', tokenizeLimiter, tokenizeRouter);
app.use('/api/vocabs', vocabsRouter);
app.use('/api/texts', textsRouter);
app.use('/api/text-vocabs', textVocabsRouter);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
