/**
 * 数据获取
 **/

import { prisma } from "../db/prisma";
import { chunkText } from "./chunk";
import { embedTexts } from "./embed";

export type IngestInput = {
  knowledgeBaseId: string;
  name: string; // 如 "refund.md"
  content: string; // 文件全文
  mimeType?: string; // 可选
};

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function ingestDocument(input: IngestInput) {
  const base = await prisma.knowledgeBase.findUnique({
    where: {
      id: input.knowledgeBaseId,
    },
  });
  if (!base) {
    throw new Error("知识库不存在");
  }

  // 只允许 txt/md（按文件名判断即可）
  const lower = input.name.toLowerCase();
  if (!lower.endsWith(".txt") && !lower.endsWith(".md")) {
    throw new Error("Only .txt and .md are supported");
  }
  const docId = newId("doc");
  const now = new Date();

  // 文件存入数据库
  const doc = await prisma.knowledgeDocument.create({
    data: {
      id: docId,
      name: input.name,
      knowledgeBaseId: input.knowledgeBaseId,
      size: Buffer.byteLength(input.content, "utf8"),
      type: input.mimeType || "text/plain",
      content: input.content,
      status: "chunking",
      uploadedAt: now,
    },
  });

  // 文本向量化
  try {
    const pieces = chunkText(input.content, {
      chunkSize: base.chunkSize,
      chunkOverlap: base.chunkOverlap,
    });

    if (pieces.length === 0) {
      await prisma.knowledgeDocument.update({
        where: { id: docId },
        data: {
          status: "completed",
          charCount: 0,
          chunkCount: 0,
          parsedAt: new Date(),
        },
      });
      return { documentId: docId, chunkCount: 0 };
    }

    const embeddings = await embedTexts(pieces.map((p) => p.content));

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      const chunkId = newId("chunk");
      await prisma.knowledgeChunk.create({
        data: {
          id: chunkId,
          documentId: docId,
          knowledgeBaseId: input.knowledgeBaseId,
          charCount: piece.charCount,
          index: piece.index,
          endIndex: piece.endIndex,
          content: piece.content,
          startIndex: piece.startIndex,
        },
      });

      await prisma.$executeRawUnsafe(
        `UPDATE knowledge_chunks SET embedding = $1::vector WHERE id = $2`,
        toVectorLiteral(embeddings[i]!), // → "[0.1,0.2,...]"
        chunkId,
      );
    }

    await prisma.knowledgeDocument.update({
      where: { id: docId },
      data: {
        status: "completed",
        charCount: input.content.length,
        chunkCount: pieces.length,
        parsedAt: new Date(),
        errorMessage: null,
      },
    });
    return { documentId: docId, chunkCount: pieces.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "ingest failed";
    await prisma.knowledgeDocument.update({
      where: { id: docId },
      data: { status: "error", errorMessage: message },
    });
    throw err;
  }
}
