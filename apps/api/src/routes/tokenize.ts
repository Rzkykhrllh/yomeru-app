import { Router } from 'express';
import { tokenizeText } from '../services/tokenizer';

export const tokenizeRouter = Router();

// POST /api/tokenize - Tokenize Japanese text
tokenizeRouter.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const tokens = await tokenizeText(text);
    res.json({ tokens });
  } catch (error) {
    console.error('Tokenization error:', error);
    res.status(500).json({ error: 'Failed to tokenize text' });
  }
});
