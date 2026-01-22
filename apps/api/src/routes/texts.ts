import { Router } from 'express';

export const textsRouter = Router();

// GET /api/texts - Get all texts
textsRouter.get('/', async (req, res) => {
  try {
    // TODO: Implement with Prisma
    res.json({ texts: [] });
  } catch (error) {
    console.error('Error fetching texts:', error);
    res.status(500).json({ error: 'Failed to fetch texts' });
  }
});

// POST /api/texts - Create text
textsRouter.post('/', async (req, res) => {
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
});

// GET /api/texts/:id - Get text + vocabs
textsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement with Prisma
    res.json({ text: null, vocabs: [] });
  } catch (error) {
    console.error('Error fetching text:', error);
    res.status(500).json({ error: 'Failed to fetch text' });
  }
});
