import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const folderSchema = z.object({
  name: z.string().min(1).max(100),
});

export const getFolders = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { _count: { select: { texts: true } } },
    });
    res.json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = folderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@clerk.local` },
    });

    const folder = await prisma.folder.create({
      data: { userId, name: result.data.name },
    });

    res.status(201).json({ folder });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Folder name already exists" });
    }
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const result = folderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const existing = await prisma.folder.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Folder not found" });

    const folder = await prisma.folder.update({
      where: { id },
      data: { name: result.data.name },
    });

    res.json({ folder });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Folder name already exists" });
    }
    console.error("Error updating folder:", error);
    res.status(500).json({ error: "Failed to update folder" });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const existing = await prisma.folder.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: "Folder not found" });

    await prisma.folder.delete({ where: { id } });
    res.json({ message: "Folder deleted successfully" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Folder not found" });
    }
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};
