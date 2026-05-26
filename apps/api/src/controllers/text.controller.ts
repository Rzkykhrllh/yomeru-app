import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createTextSchema = z.object({
  content: z.string(),
  title: z.string().optional(),
  source: z.string().optional(),
  folderId: z.string().optional().nullable(),
});

const updateTextSchema = z.object({
  content: z.string().optional(),
  title: z.string().optional(),
  source: z.string().optional(),
  folderId: z.string().optional().nullable(),
});

export const getTexts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { folderId } = req.query;
    const texts = await prisma.text.findMany({
      where: {
        userId,
        ...(folderId === "none"
          ? { folderId: null }
          : folderId
          ? { folderId: String(folderId) }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { textVocabs: true } },
        folder: { select: { id: true, name: true } },
      },
    });
    res.json({ texts });
  } catch (error) {
    console.error("Error fetching texts:", error);
    res.status(500).json({ error: "Failed to fetch texts" });
  }
};

export const addText = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = createTextSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { title, content, source, folderId } = result.data;

    // Upsert user record (Clerk user may not exist in our DB yet)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@clerk.local` },
    });

    const text = await prisma.text.create({
      data: {
        userId,
        title: title || null,
        content: content || "",
        source: source || null,
        folderId: folderId || null,
      },
    });

    res.status(201).json({ text });
  } catch (error) {
    console.error("Error creating text:", error);
    res.status(500).json({ error: "Failed to create text" });
  }
};

export const getTextDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const text = await prisma.text.findFirst({
      where: { id, userId },
      include: {
        textVocabs: {
          include: { vocab: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!text) {
      return res.json({ text: null, vocabs: [] });
    }

    // Format vocabs with their sentence
    const vocabs = text.textVocabs.map((tv) => ({
      ...tv.vocab,
      sentence: tv.sentence,
      textVocabId: tv.id,
    }));

    res.json({
      text: {
        id: text.id,
        title: text.title,
        content: text.content,
        source: text.source,
        createdAt: text.createdAt,
      },
      vocabs,
    });
  } catch (error) {
    console.error("Error fetching text:", error);
    res.status(500).json({ error: "Failed to fetch text" });
  }
};

export const editText = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const result = updateTextSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    // Verify ownership
    const existing = await prisma.text.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Text not found" });

    const { title, content, source, folderId } = result.data;

    const text = await prisma.text.update({
      where: { id },
      data: { title, content, source, folderId },
    });

    res.json({ text });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Text not found" });
    }
    console.error("Error updating text:", error);
    res.status(500).json({ error: "Failed to update text" });
  }
};

export const deleteText = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Verify ownership before deleting
    const text = await prisma.text.findFirst({ where: { id, userId } });
    if (!text) return res.status(404).json({ error: "Text not found" });

    await prisma.text.delete({ where: { id } });
    res.json({ message: "Text deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Text not found" });
    }
    console.error("Error deleting text:", error);
    res.status(500).json({ error: "Failed to delete text" });
  }
};
