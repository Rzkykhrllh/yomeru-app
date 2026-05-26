import { Router } from 'express';
import { getTags, createTag, updateTag, deleteTag, setVocabTags } from '../controllers/tags.controller';

export const tagsRouter = Router();

// GET /api/tags
tagsRouter.get('/', getTags);

// POST /api/tags
tagsRouter.post('/', createTag);

// PUT /api/tags/:id
tagsRouter.put('/:id', updateTag);

// DELETE /api/tags/:id
tagsRouter.delete('/:id', deleteTag);

// PUT /api/tags/vocab/:vocabId — set tags on a vocab (replace all)
tagsRouter.put('/vocab/:vocabId', setVocabTags);
