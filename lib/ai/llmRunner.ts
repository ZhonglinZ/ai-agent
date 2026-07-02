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
  console.log("runLLM", prompt);
  const result = await generateText({
    model: qwen(DEFAULT_MODEL),
    system: system || undefined,
    prompt,
    temperature,
    topP,
  });
  console.log("result", result.text, result.usage);
  return {
    text: result.text,
    usage: result.usage,
  };
}
