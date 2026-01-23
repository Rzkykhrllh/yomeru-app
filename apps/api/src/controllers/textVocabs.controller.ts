import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Controller to link a vocabulary word to a text with a specific sentence
export const addTextVocab = async (req: Request, res: Response) => {
  try {
    const { vocabId, textId, sentence } = req.body;

    if (!vocabId || !textId || !sentence) {
      return res.status(400).json({
        error: "vocabId, textId, and sentence are required",
      });
    }

    // check if link already exists
    const existingLink = await prisma.textVocab.findFirst({
      where: {
        vocabId,
        textId,
        sentence,
      },
    });

    if (existingLink) {
      return res.status(409).json({
        error: "This text-vocab link already exists",
      });
    }

    // Create the new text-vocab link
    const textVocab = await prisma.textVocab.create({
      data: {
        vocabId,
        textId,
        sentence,
      },
      include: { vocab: true, text: true },
    });

    res.status(201).json({ textVocab });
  } catch (error) {
    console.error("Error creating text-vocab link:", error);
    res.status(500).json({ error: "Failed to create text-vocab link" });
  }
};

export const getTextVocabsByTextId = async (req: Request, res: Response) => {
  try {
    const { textId } = req.params;

    const textVocabs = await prisma.textVocab.findMany({
      where: { textId },
      include: {
        vocab: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ textVocabs });
  } catch (error) {
    console.error("Error fetching text vocabs:", error);
    res.status(500).json({ error: "Failed to fetch text vocabs" });
  }
};

export const deleteTextVocab = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.textVocab.delete({
      where: { id },
    });

    res.json({ message: "Text-vocab link deleted successfully" });
  } catch (error) {
    console.error("Error deleting text-vocab link:", error);
    res.status(500).json({ error: "Failed to delete text-vocab link" });
  }
};
