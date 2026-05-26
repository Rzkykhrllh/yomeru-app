import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const vocabSchema = z.object({
  word: z.string().min(1, "Word is required"),
  furigana: z.string().min(1, "Furigana is required"),
  meaning: z.string().min(1, "Meaning is required"),
  notes: z.string().optional(),
});

export const getVocabs = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const vocabs = await prisma.vocab.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { textVocabs: true } },
        vocabTags: { include: { tag: true } },
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
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = vocabSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { word, furigana, meaning, notes } = result.data;

    // Check if vocab already exists for this user
    const isExist = await prisma.vocab.findFirst({
      where: { userId, word },
    });

    if (isExist) {
      return res.status(400).json({ error: "Vocab already exists" });
    }

    // Upsert user record (Clerk user may not exist in our DB yet)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@clerk.local` },
    });

    const vocab = await prisma.vocab.create({
      data: { userId, word, furigana, meaning, notes: notes || null },
    });
    res.status(201).json({ message: "Vocab created", vocab });
  } catch (error) {
    console.error("Error creating vocab:", error);
    res.status(500).json({ error: "Failed to create vocab" });
  }
};

export const getVocabDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const vocab = await prisma.vocab.findFirst({
      where: { id, userId },
      include: {
        textVocabs: {
          include: {
            text: { select: { id: true, title: true, source: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vocab) {
      return res.status(404).json({ error: "Vocab not found" });
    }

    const appearances = vocab.textVocabs.map((tv) => ({
      textId: tv.text.id,
      textTitle: tv.text.title,
      textSource: tv.text.source,
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
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Verify ownership before deleting
    const vocab = await prisma.vocab.findFirst({ where: { id, userId } });
    if (!vocab) return res.status(404).json({ error: "Vocab not found" });

    const isDeleted = await prisma.vocab.delete({ where: { id } });
    res.json({ message: "Vocab deleted successfully", vocab: isDeleted });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Vocab not found" });
    }
    console.error("Error deleting vocab:", error);
    res.status(500).json({ error: "Failed to delete vocab" });
  }
};

export const updateVocab = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const result = vocabSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { word, furigana, meaning, notes } = result.data;

    // Verify ownership
    const existing = await prisma.vocab.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Vocab not found" });

    const vocab = await prisma.vocab.update({
      where: { id },
      data: { word, furigana, meaning, notes: notes || null },
    });

    res.json({ vocab });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Vocab not found" });
    }
    console.error("Error updating vocab:", error);
    res.status(500).json({ error: "Failed to update vocab" });
  }
};
