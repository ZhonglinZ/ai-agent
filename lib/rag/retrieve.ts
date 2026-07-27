import { HitTestResult } from "@/lib/types/knowledge";
import { embedQuery } from "./embed";
import { prisma } from "../db/prisma";
export type RetrieveOptions = {
  knowledgeBaseId: string;
  query: string;
  topK?: number; // 默认 5
  scoreThreshold?: number; // 默认 0.2；低于此分丢弃
};

type ChunkRow = {
  id: string;
  documentId: string;
  knowledgeBaseId: string;
  content: string;
  charCount: number;
  index: number;
  startIndex: number;
  endIndex: number;
  distance: number; // 数据库算出来的距离
};

export async function retrieve(
  options: RetrieveOptions,
): Promise<HitTestResult[]> {
  const { knowledgeBaseId, query, topK = 5, scoreThreshold = 0.2 } = options;
  if (!knowledgeBaseId) {
    throw new Error("知识库不存在");
  }

  if (!query) {
    return [];
  }

  const vector = await embedQuery(query);
  const literal = `[${vector.join(",")}]`;

  const rows = await prisma.$queryRawUnsafe<ChunkRow[]>(
    `
     SELECT
    id,
    "documentId",
    "knowledgeBaseId",
    content,
    "charCount",
    index,
    "startIndex",
    "endIndex",
    (embedding <=> $1::vector) AS distance
  FROM knowledge_chunks
  WHERE "knowledgeBaseId" = $2
    AND embedding IS NOT NULL
  ORDER BY embedding <=> $1::vector
  LIMIT $3
    `,
    literal,
    knowledgeBaseId,
    topK * 2,
  );

  return rows
    .map((row) => ({
      chunk: {
        id: row.id,
        documentId: row.documentId,
        content: row.content,
        charCount: row.charCount,
        index: row.index,
        startIndex: row.startIndex,
        endIndex: row.endIndex,
      },
      score: 1 - Number(row.distance),
    }))
    .filter((item) => item.score >= scoreThreshold)
    .slice(0, topK);
}
