import "dotenv/config";
import { prisma } from "../lib/db/prisma";
import { ingestDocument } from "../lib/rag/ingest";

async function main() {
  const content = `
# 退款说明
用户可在订单详情页申请退款。审核通过后 3 个工作日内原路退回。
联系客服请使用在线工单。
`.trim();

  const result = await ingestDocument({
    knowledgeBaseId: "kb_demo_1",
    name: "refund.md",
    content,
  });
  console.log(result);

  const chunks = await prisma.$queryRawUnsafe<
    { id: string; index: number; has_embedding: boolean }[]
  >(
    `SELECT id, index, (embedding IS NOT NULL) AS has_embedding
     FROM knowledge_chunks
     WHERE "documentId" = $1
     ORDER BY index`,
    result.documentId,
  );
  console.log(chunks);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
