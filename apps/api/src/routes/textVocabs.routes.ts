import { Router } from "express";
import {
  addTextVocab,
  getTextVocabsByTextId,
  deleteTextVocab,
} from "../controllers/textVocabs.controller";

export const textVocabsRouter = Router();

// POST /api/text-vocabs - Link vocab to text with sentence
textVocabsRouter.post("/", addTextVocab);

// GET /api/text-vocabs/text/:textId - Get all vocab links for a specific text
textVocabsRouter.get("/text/:textId", getTextVocabsByTextId);

textVocabsRouter.delete("/:id", deleteTextVocab);
