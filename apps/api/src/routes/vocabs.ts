import { Router } from 'express';

export const vocabsRouter = Router();

// GET /api/vocabs - Get all vocabs
vocabsRouter.get('/', async (req, res) => {
  try {
    // TODO: Implement with Prisma
    res.json({ vocabs: [] });
  } catch (error) {
    console.error('Error fetching vocabs:', error);
    res.status(500).json({ error: 'Failed to fetch vocabs' });
  }
});

// POST /api/vocabs - Create vocab
vocabsRouter.post('/', async (req, res) => {
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
});

// GET /api/vocabs/:id - Get vocab + appearances
vocabsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement with Prisma
    res.json({ vocab: null, appearances: [] });
  } catch (error) {
    console.error('Error fetching vocab:', error);
    res.status(500).json({ error: 'Failed to fetch vocab' });
  }
});
