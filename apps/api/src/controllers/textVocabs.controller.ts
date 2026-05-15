import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const addTextVocabSchema = z.object({
  vocabId: z.string().min(1, "vocabId is required"),
  textId: z.string().min(1, "textId is required"),
  sentence: z.string().min(1, "sentence is required"),
});

// Controller to link a vocabulary word to a text with a specific sentence
export const addTextVocab = async (req: Request, res: Response) => {
  try {
    const result = addTextVocabSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { vocabId, textId, sentence } = result.data;

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
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Text-vocab link not found" });
    }
    console.error("Error deleting text-vocab link:", error);
    res.status(500).json({ error: "Failed to delete text-vocab link" });
  }
};
