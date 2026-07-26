import "dotenv/config";
import assert from "node:assert/strict";
import { cosineSimilarity, embedQuery } from "../lib/rag/embed";
import { EMBEDDING_DIM } from "../lib/rag/constants";

async function main() {
  const a = await embedQuery("用户如何申请退款");
  const b = await embedQuery("怎么退钱");
  const c = await embedQuery("今天天气怎么样");

  assert.equal(a.length, EMBEDDING_DIM);

  const simAb = cosineSimilarity(a, b);
  const simAc = cosineSimilarity(a, c);

  console.log({ dim: a.length, simAb, simAc });
  assert.ok(simAb > simAc);
  console.log("embed OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
