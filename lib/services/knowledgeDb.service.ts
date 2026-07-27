import { prisma } from "@/lib/db/prisma";
import { KnowledgeBase, Prisma } from "@/generated/prisma/client";
import { generateId } from "../utils";
import {
  CreateKnowledgeBaseRequest,
  FileDataType,
  KnowledgeStatus,
  type KnowledgeBase as UIKnowledgeBase,
} from "../types/knowledge";
import { ingestDocument } from "../rag/ingest";

function formatStoredTime(d: Date): string {
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function rowToKnowledgeBase(row: KnowledgeBase): UIKnowledgeBase {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    icon: row.icon || "📚",
    fileType: row.fileType as FileDataType,
    tags: (row.tags as string[]) || [],
    fileCount: 0,
    charCount: 0,
    chunkCount: row.chunkSize || 0,
    status: row.status as KnowledgeStatus,
    createdAt: formatStoredTime(row.createdAt),
    updatedAt: formatStoredTime(row.updatedAt),
  };
}

class KnowledgeDbService {
  async createKnowledgeBase(
    kb: CreateKnowledgeBaseRequest,
  ): Promise<{ knowledgeBaseId: string }> {
    const id = generateId();
    const now = new Date();
    await prisma.knowledgeBase.create({
      data: {
        id,
        name: kb.name,
        description: kb.description || "",
        icon: kb.icon ?? "📚",
        fileType: kb.fileType ?? "text",
        tags: kb.tags ?? [],
        chunkSize: kb.config?.chunkSize ?? 500,
        chunkOverlap: kb.config?.chunkOverlap ?? 50,
        parseStrategy: kb.config?.parseStrategy ?? "text",
        chunkStrategy: kb.config?.chunkStrategy ?? "auto",
        createdAt: now,
        updatedAt: now,
      },
    });
    return { knowledgeBaseId: id };
  }

  async listKnowledgeBases(): Promise<UIKnowledgeBase[]> {
    const knowledgeBases = await prisma.knowledgeBase.findMany();
    return knowledgeBases.map(rowToKnowledgeBase) || [];
  }

  async getKnowledgeBaseById(id: string): Promise<UIKnowledgeBase | null> {
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id },
    });
    return knowledgeBase ? rowToKnowledgeBase(knowledgeBase) : null;
  }

  async deleteKnowledgeBaseById(id: string): Promise<void> {
    await prisma.knowledgeBase.delete({
      where: { id },
    });
  }

  async createEmptyKnowledgeBase(): Promise<{ knowledgeBaseId: string }> {
    const id = generateId();
    const now = new Date();
    await prisma.knowledgeBase.create({
      data: {
        id,
        name: "未命名知识库",
        description: "",
        icon: "📚",
        fileType: "text",
        tags: [],
        chunkSize: 500,
        chunkOverlap: 50,
        parseStrategy: "text",
        chunkStrategy: "auto",
        createdAt: now,
        updatedAt: now,
      },
    });
    return { knowledgeBaseId: id };
  }

  async addDocumentAndIngest(
    id: string,
    document: {
      name: string;
      content: string;
    },
  ): Promise<void> {
    const { name, content } = document;
    const knowledgeBase = await this.getKnowledgeBaseById(id);
    if (!knowledgeBase) {
      throw new Error("知识库不存在");
    }
    if (!name || !content) {
      throw new Error("文件名和内容不能为空");
    }

    await ingestDocument({
      knowledgeBaseId: id,
      name,
      content,
    });
  }
}

export const knowledgeBaseDbService = new KnowledgeDbService();
