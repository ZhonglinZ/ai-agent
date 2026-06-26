// lib/ai-client.ts
import { createOpenAI } from "@ai-sdk/openai";

export const qwen = createOpenAI({
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY,
});
