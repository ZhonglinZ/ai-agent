import { http } from "../services/http";
import {
  DASHSCOPE_COMPAT_BASE_URL,
  EMBEDDING_BATCH_SIZE,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
} from "./constants";

type EmbeddingApiItem = {
  index: number;
  embedding: number[];
};
function getApiKey(): string {
  const key = process.env.QWEN_API_KEY?.trim();
  if (!key) {
    throw new Error("QWEN_API_KEY is not set");
  }
  return key;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const res = await fetch(`${DASHSCOPE_COMPAT_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIM,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding API failed: ${res.status} ${body}`);
  }

  const json = (await res.json()) as { data: EmbeddingApiItem[] };
  // API 返回顺序不一定保证，按 index 排好
  const sorted = [...json.data].sort((a, b) => a.index - b.index);
  return sorted.map((item) => {
    if (item.embedding.length !== EMBEDDING_DIM) {
      throw new Error(
        `Expected dim ${EMBEDDING_DIM}, got ${item.embedding.length}`,
      );
    }
    return item.embedding;
  });
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const all: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const slice = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    const vectors = await embedBatch(slice);
    all.push(...vectors);
  }
  return all;
}
export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embedTexts([query]);
  if (!vector) {
    throw new Error("embedQuery got empty result");
  }
  return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
