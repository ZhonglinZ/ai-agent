import "dotenv/config";
import { retrieve } from "../lib/rag/retrieve";

async function main() {
  const kbId = "uwx1ats0licki4992eow9b";

  const hits = await retrieve({
    knowledgeBaseId: kbId,
    query: "怎么退钱", // 语义近，但字面不一定相同
    topK: 5,
    scoreThreshold: 0.2,
  });
  console.log(
    "related:",
    hits.map((h) => ({
      score: h.score,
      preview: h.chunk.content.slice(0, 40),
    })),
  );

  const noise = await retrieve({
    knowledgeBaseId: kbId,
    query: "今天股市怎么样",
    topK: 5,
    scoreThreshold: 0.2,
  });
  console.log(
    "noise:",
    noise.map((h) => ({
      score: h.score,
      preview: h.chunk.content.slice(0, 40),
    })),
  );
}

main().catch(console.error);
