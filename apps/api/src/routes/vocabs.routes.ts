import { Router } from 'express';
import { addVocab, getVocabDetails, getVocabs } from '../controllers/vocabs.controller';

export const vocabsRouter = Router();

// GET /api/vocabs - Get all vocabs
vocabsRouter.get('/', getVocabs);

// POST /api/vocabs - Create vocab
vocabsRouter.post('/', addVocab);

// GET /api/vocabs/:id - Get vocab + appearances
vocabsRouter.get('/:id',  getVocabDetails);
