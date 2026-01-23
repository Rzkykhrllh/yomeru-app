import express from 'express';
import cors from 'cors';
import { tokenizeRouter } from './routes/tokenize.routes';
import { vocabsRouter } from './routes/vocabs.routes';
import { textsRouter } from './routes/texts.routes';
import { textVocabsRouter } from './routes/textVocabs.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/tokenize', tokenizeRouter);
app.use('/api/vocabs', vocabsRouter);
app.use('/api/texts', textsRouter);
app.use('/api/text-vocabs', textVocabsRouter);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
