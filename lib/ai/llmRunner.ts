import { generateText } from "ai";
import { qwen } from "../config/qwenConfig";
const DEFAULT_MODEL = "qwen3.7-plus";

export type RunLLMOptions = {
  prompt: string;
  system?: string;
  model?: string;
  temperature?: number;
  topP?: number;
};

export async function runLLM(options: RunLLMOptions) {
  const { prompt, system, model, temperature, topP } = options;
  const modelId = model?.trim() || DEFAULT_MODEL;

  // 通义 compatible-mode 走 Chat Completions，不要用默认的 responses
  const result = await generateText({
    model: qwen(DEFAULT_MODEL),
    system: system || undefined,
    prompt,
    temperature,
    topP,
  });

  return {
    text: result.text,
    usage: result.usage,
  };
}
