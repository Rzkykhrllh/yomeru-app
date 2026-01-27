import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getVocabs = async (req: Request, res: Response) => {
  try {
    const vocabs = await prisma.vocab.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { textVocabs: true },
        },
      },
    });
    res.json({ vocabs });
  } catch (error) {
    console.error("Error fetching vocabs:", error);
    res.status(500).json({ error: "Failed to fetch vocabs" });
  }
};

export const addVocab = async (req: Request, res: Response) => {
  try {
    const { word, furigana, meaning, notes } = req.body;

    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    // check if vocab already exists
    const isExist = await prisma.vocab.findFirst({
      where: { word },
    });

    if (isExist) {
      return res.status(400).json({ error: "Vocab already exists" });
    }

    const vocab = await prisma.vocab.create({
      data: {
        word,
        furigana: furigana || null,
        meaning: meaning || null,
        notes: notes || null,
      },
    });
    res.status(201).json({ message: "Vocab created", vocab });
  } catch (error) {
    console.error("Error creating vocab:", error);
    res.status(500).json({ error: "Failed to create vocab" });
  }
};

export const getVocabDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vocab = await prisma.vocab.findUnique({
      where: { id },
      include: {
        textVocabs: {
          include: {
            text: {
              select: {
                id: true,
                title: true,
                content: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!vocab) {
      return res.status(404).json({ error: "Vocab not found" });
    }

    // Format Appearances
    const appearances = vocab.textVocabs.map((tv) => ({
      textId: tv.text.id,
      textTitle: tv.text.title,
      sentence: tv.sentence,
    }));

    res.json({
      id: vocab.id,
      word: vocab.word,
      furigana: vocab.furigana,
      meaning: vocab.meaning,
      notes: vocab.notes,
      createdAt: vocab.createdAt,
      appearances,
    });
  } catch (error) {
    console.error("Error fetching vocab:", error);
    res.status(500).json({ error: "Failed to fetch vocab" });
  }
};

export const deleteVocab = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const isDeleted = await prisma.vocab.delete({
      where: { id },
    });

    res.json({ message: "Vocab deleted successfully", vocab: isDeleted });
  } catch (error) {
    console.error("Error deleting vocab:", error);
    res.status(500).json({ error: "Failed to delete vocab" });
  }
};
