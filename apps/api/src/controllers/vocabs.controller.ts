import { Request, Response, NextFunction } from "express";

export const getVocabs = async (req: Request, res: Response) => {
  try {
    // TODO: Implement with Prisma
    res.json({ vocabs: [] });
  } catch (error) {
    console.error('Error fetching vocabs:', error);
    res.status(500).json({ error: 'Failed to fetch vocabs' });
  }
}

export const addVocab = async (req: Request, res: Response) => {
  try {
    const { word, furigana, meaning, notes } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    // TODO: Implement with Prisma
    res.status(201).json({ message: 'Vocab created' });
  } catch (error) {
    console.error('Error creating vocab:', error);
    res.status(500).json({ error: 'Failed to create vocab' });
  }
}

export const getVocabDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implement with Prisma
    res.json({ vocab: null, appearances: [] });
  } catch (error) {
    console.error('Error fetching vocab:', error);
    res.status(500).json({ error: 'Failed to fetch vocab' });
  }
}