import { prisma } from "@/lib/db/prisma";
import { KnowledgeBase, Prisma } from "@/generated/prisma/client";
import { generateId } from "../utils";

class KnowledgeDbService {
  async createKnowledgeBase(name: string): Promise<KnowledgeBase> {
    const id = generateId();
    const now = new Date();
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: {
        id,
        name,
        description: "",
        createdAt: now,
        updatedAt: now,
      },
    });
    return knowledgeBase;
  }
}
