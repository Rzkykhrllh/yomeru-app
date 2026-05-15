
import { Request, Response } from 'express'
import { z } from 'zod';
import { tokenizeText } from '../services/tokenizer';

const tokenizeSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

export const tokenizeTextController = async (req: Request, res: Response) => {
  try {
    const result = tokenizeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const tokens = await tokenizeText(result.data.text);
    res.json({ tokens });
  } catch (error) {
    console.error('Tokenization error:', error);
    res.status(500).json({ error: 'Failed to tokenize text' });
  }
}
