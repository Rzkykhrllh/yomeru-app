import { Router } from 'express';
import { tokenizeTextController } from '../controllers/tokenize.controller';

export const tokenizeRouter = Router();

// POST /api/tokenize - Tokenize Japanese text
tokenizeRouter.post('/', tokenizeTextController);
