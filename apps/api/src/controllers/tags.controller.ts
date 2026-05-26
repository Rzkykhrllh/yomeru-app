import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const getTags = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { _count: { select: { vocabTags: true } } },
    });
    res.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = tagSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@clerk.local` },
    });

    const tag = await prisma.tag.create({
      data: { userId, name: result.data.name, color: result.data.color },
    });

    res.status(201).json({ tag });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Tag name already exists" });
    }
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const result = tagSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const existing = await prisma.tag.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Tag not found" });

    const tag = await prisma.tag.update({
      where: { id },
      data: { name: result.data.name, color: result.data.color },
    });

    res.json({ tag });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Tag name already exists" });
    }
    console.error("Error updating tag:", error);
    res.status(500).json({ error: "Failed to update tag" });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const existing = await prisma.tag.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Tag not found" });

    await prisma.tag.delete({ where: { id } });
    res.json({ message: "Tag deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Tag not found" });
    }
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
};

// Assign/remove tags on a vocab
const assignTagsSchema = z.object({
  tagIds: z.array(z.string()),
});

export const setVocabTags = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { vocabId } = req.params;
    const result = assignTagsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    // Verify vocab ownership
    const vocab = await prisma.vocab.findFirst({ where: { id: vocabId, userId } });
    if (!vocab) return res.status(404).json({ error: "Vocab not found" });

    // Verify all tags belong to user
    const tags = await prisma.tag.findMany({
      where: { id: { in: result.data.tagIds }, userId },
    });
    if (tags.length !== result.data.tagIds.length) {
      return res.status(400).json({ error: "One or more tags not found" });
    }

    // Replace all tags for this vocab
    await prisma.vocabTag.deleteMany({ where: { vocabId } });
    if (result.data.tagIds.length > 0) {
      await prisma.vocabTag.createMany({
        data: result.data.tagIds.map((tagId) => ({ vocabId, tagId })),
      });
    }

    const updated = await prisma.vocab.findFirst({
      where: { id: vocabId },
      include: { vocabTags: { include: { tag: true } } },
    });

    res.json({ vocab: updated });
  } catch (error) {
    console.error("Error setting vocab tags:", error);
    res.status(500).json({ error: "Failed to set vocab tags" });
  }
};
