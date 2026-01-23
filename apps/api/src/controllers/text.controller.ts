import { Request, Response, NextFunction } from "express";


export const getTexts = async (req: Request, res: Response) => {
  try {
    // TODO: Implement with Prisma
    res.json({ texts: [] });
  } catch (error) {
    console.error('Error fetching texts:', error);
    res.status(500).json({ error: 'Failed to fetch texts' });
  }
}

export const addText = async (req: Request, res: Response) => {
  try {
    const { title, content, source } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // TODO: Implement with Prisma
    res.status(201).json({ message: 'Text created' });
  } catch (error) {
    console.error('Error creating text:', error);
    res.status(500).json({ error: 'Failed to create text' });
  }
}

export const getTextDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implement with Prisma
    res.json({ text: null, vocabs: [] });
  } catch (error) {
    console.error('Error fetching text:', error);
    res.status(500).json({ error: 'Failed to fetch text' });
  }
}