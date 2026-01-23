import { Router } from 'express';
import { addText, getTextDetails, getTexts, editText, deleteText } from '../controllers/text.controller';

export const textsRouter = Router();

// GET /api/texts - Get all texts
textsRouter.get('/', getTexts);

// POST /api/texts - Create text
textsRouter.post('/', addText);

// GET /api/texts/:id - Get text + vocabs
textsRouter.get('/:id', getTextDetails);

// PUT /api/texts/:id - Edit text
textsRouter.put('/:id', editText);

// DELETE /api/texts/:id - Delete text
textsRouter.delete('/:id', deleteText);