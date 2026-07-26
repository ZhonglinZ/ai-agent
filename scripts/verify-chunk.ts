import assert from "node:assert/strict";
import { chunkText } from "../lib/rag/chunk";

// 1) 空串
assert.equal(chunkText("", { chunkSize: 10, chunkOverlap: 2 }).length, 0);

// 2) 短于一块
const short = chunkText("hello", { chunkSize: 10, chunkOverlap: 2 });
assert.equal(short.length, 1);
assert.equal(short[0].content, "hello");
assert.equal(short[0].startIndex, 0);
assert.equal(short[0].endIndex, 5);

// 3) 重叠
const text = "abcdefghijklmnopqrstuvwxyz"; // 26
const chunks = chunkText(text, { chunkSize: 10, chunkOverlap: 3 });
// step = 7 → 期望块大致: [0,10), [7,17), [14,24), [21,26)
assert.equal(chunks.length, 4);
assert.equal(chunks[0].content, "abcdefghij");
assert.equal(chunks[1].startIndex, 7);
assert.equal(chunks[1].content, text.slice(7, 17));
assert.equal(chunks[3].endIndex, 26);

// 4) 非法 overlap
assert.throws(() => chunkText("abc", { chunkSize: 5, chunkOverlap: 5 }));

console.log("chunkText OK");
