import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getTexts = async (req: Request, res: Response) => {
  try {
    const texts = await prisma.text.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { textVocabs: true } } },
    });
    res.json({ texts });
  } catch (error) {
    console.error("Error fetching texts:", error);
    res.status(500).json({ error: "Failed to fetch texts" });
  }
};

export const addText = async (req: Request, res: Response) => {
  try {
    const { title, content, source } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const text = await prisma.text.create({
      data: {
        title: title || null,
        content,
        source: source || null,
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
    const { id } = req.params;

    const text = await prisma.text.findUnique({
      where: { id },
      include: {
        textVocabs: {
          include: {
            vocab: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!text) {
      return res.json({ text: null, vocabs: [] });
    }

    // Format vocabs with their sentece
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
    const { id } = req.params;
    const { title, content, source } = req.body;

    const text = await prisma.text.update({
      where: { id },
      data: {
        title,
        content,
        source,
      },
    });

    res.json({ text });
  } catch (error) {
    console.error("Error updating text:", error);
    res.status(500).json({ error: "Failed to update text" });
  }
};

export const deleteText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.text.delete({
      where: { id },
    });

    res.json({ message: "Text deleted successfully" });
  } catch (error) {
    console.error("Error deleting text:", error);
    res.status(500).json({ error: "Failed to delete text" });
  }
};
