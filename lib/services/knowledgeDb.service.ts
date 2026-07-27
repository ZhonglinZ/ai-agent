import { prisma } from "@/lib/db/prisma";
import { generateId } from "../utils";
// 只从 UI 类型包 import，Prisma 用命名空间或 row 推断
import type {
  KnowledgeBase as KnowledgeBaseDTO,
  KnowledgeDocument as KnowledgeDocumentDTO,
  DocumentDetail,
  DocumentChunk,
  CreateKnowledgeBaseRequest,
  FileDataType,
  KnowledgeStatus,
  DocumentStatus,
} from "@/lib/types/knowledge";
import { ingestDocument } from "../rag/ingest";

function formatStoredTime(d: Date): string {
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags) && tags.every((t) => typeof t === "string")) {
    return tags;
  }
  return [];
}

/** Prisma 行 → 前端 KnowledgeBaseDTO（统计字段 MVP 先填 0） */
function rowToKnowledgeBase(row: {
  id: string;
  name: string;
  description: string;
  icon: string;
  fileType: string;
  tags: unknown; // Prisma JsonValue
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): KnowledgeBaseDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    icon: row.icon || "📚",
    fileType: row.fileType as FileDataType,
    tags: normalizeTags(row.tags),
    fileCount: 0,
    charCount: 0,
    chunkCount: 0, // 不是 chunkSize；真正数量应对 documents 聚合
    status: row.status as KnowledgeStatus,
    createdAt: formatStoredTime(row.createdAt),
    updatedAt: formatStoredTime(row.updatedAt),
  };
}

function rowToDocument(row: {
  id: string;
  knowledgeBaseId: string;
  name: string;
  size: number;
  type: string;
  charCount: number;
  chunkCount: number;
  status: string;
  errorMessage: string | null;
  uploadedAt: Date;
  parsedAt: Date | null;
}): KnowledgeDocumentDTO {
  return {
    /** 文档基本信息 */
    id: row.id,
    knowledgeBaseId: row.knowledgeBaseId,
    name: row.name,
    size: row.size,
    type: row.type,
    charCount: row.charCount,
    chunkCount: row.chunkCount,
    status: row.status as DocumentStatus, // 仅枚举字段允许窄化断言
    errorMessage: row.errorMessage ?? undefined,
    uploadedAt: row.uploadedAt.toISOString(),
    parsedAt: row.parsedAt?.toISOString(),
  };
}

function rowToChunk(row: {
  id: string;
  documentId: string;
  content: string;
  charCount: number;
  index: number;
  startIndex: number;
  endIndex: number;
}): DocumentChunk {
  return {
    id: row.id,
    documentId: row.documentId,
    content: row.content,
    charCount: row.charCount,
    index: row.index,
    startIndex: row.startIndex,
    endIndex: row.endIndex,
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

  async listKnowledgeBases(): Promise<KnowledgeBaseDTO[]> {
    const knowledgeBases = await prisma.knowledgeBase.findMany();
    return knowledgeBases.map(rowToKnowledgeBase) || [];
  }

  async getKnowledgeBaseById(id: string): Promise<KnowledgeBaseDTO | null> {
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

  async getDocumentDetail(docId: string): Promise<DocumentDetail | null> {
    const row = await prisma.knowledgeDocument.findUnique({
      where: { id: docId },
      include: {
        chunks: {
          orderBy: { index: "asc" },
          // embedding 是 Unsupported，一般 select 里别带它；默认 include 也可能带上
          // 若生成类型别扭，可改成单独 findMany chunks 只选需要的列
        },
      },
    });
    if (!row) return null;
    return {
      document: rowToDocument(row),
      content: row.content,
      chapters: [],
      chunks: row.chunks.map(rowToChunk),
    };
  }

  async listDocsByKnowledgeBaseId(
    kbId: string,
  ): Promise<KnowledgeDocumentDTO[]> {
    const rows = await prisma.knowledgeDocument.findMany({
      where: { knowledgeBaseId: kbId },
    });
    return rows.map(rowToDocument);
  }
}

export const knowledgeBaseDbService = new KnowledgeDbService();
