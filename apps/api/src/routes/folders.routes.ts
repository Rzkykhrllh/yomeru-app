import { Router } from 'express';
import { getFolders, createFolder, updateFolder, deleteFolder } from '../controllers/folders.controller';

export const foldersRouter = Router();

// GET /api/folders
foldersRouter.get('/', getFolders);

// POST /api/folders
foldersRouter.post('/', createFolder);

// PUT /api/folders/:id
foldersRouter.put('/:id', updateFolder);

// DELETE /api/folders/:id
foldersRouter.delete('/:id', deleteFolder);
