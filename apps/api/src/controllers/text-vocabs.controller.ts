import {Request, Response} from 'express';

export const addTextVocab = async (req: Request, res: Response) => {
  try {
    const { vocabId, textId, sentence } = req.body;

    if (!vocabId || !textId || !sentence) {
      return res.status(400).json({
        error: 'vocabId, textId, and sentence are required'
      });
    }

    // TODO: Implement with Prisma
    res.status(201).json({ message: 'Text-vocab link created' });
  } catch (error) {
    console.error('Error creating text-vocab link:', error);
    res.status(500).json({ error: 'Failed to create text-vocab link' });
  }
}