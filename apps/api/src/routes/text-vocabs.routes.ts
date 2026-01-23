import { Router } from 'express';
import { addTextVocab } from '../controllers/text-vocabs.controller';

export const textVocabsRouter = Router();

// POST /api/text-vocabs - Link vocab to text with sentence
textVocabsRouter.post('/', addTextVocab);
