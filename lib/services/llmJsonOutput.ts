/**
 * LLM Prompt + JSON 解析（面试 Agent Loop MVP）
 *
 * 不接厂商 JSON mode：从模型纯文本中抽取 JSON，再按 outputs 字段映射。
 */

import type { LLMOutputVariable } from "@/lib/workflow/types";

/**
 * 从模型文本中抽取第一个 JSON 对象（支持 ```json 围栏）
 */
export function extractJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("模型返回为空，无法解析 JSON");
  }

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fence ? fence[1] : trimmed).trim();

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("响应中未找到 JSON 对象");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new Error("JSON 解析失败，请检查模型是否只返回合法 JSON");
  }

  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error("JSON 根节点必须是对象");
  }

  return parsed as Record<string, unknown>;
}

function coerceValue(value: unknown, type: LLMOutputVariable["type"]): unknown {
  if (value === undefined || value === null) {
    switch (type) {
      case "boolean":
        return false;
      case "number":
        return 0;
      case "array":
        return [];
      case "object":
        return {};
      default:
        return "";
    }
  }

  switch (type) {
    case "boolean":
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const lower = value.trim().toLowerCase();
        if (lower === "true") return true;
        if (lower === "false") return false;
      }
      return Boolean(value);
    case "number": {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
    case "object":
    case "array":
      return value;
    default:
      return typeof value === "string" ? value : String(value);
  }
}

export interface MapJsonOutputsResult {
  outputs: Record<string, unknown>;
  /** 配置的输出字段在 JSON 中缺失的名称 */
  missingFields: string[];
}

/**
 * 按 outputs[].name 从解析结果取值，并保留 raw / text 为原始响应
 */
export function mapJsonToLlmOutputs(
  parsed: Record<string, unknown>,
  outputDefs: LLMOutputVariable[] | undefined,
  rawText: string,
): MapJsonOutputsResult {
  const outputs: Record<string, unknown> = {
    raw: rawText,
    text: rawText,
  };
  const missingFields: string[] = [];

  if (!outputDefs?.length) {
    return { outputs, missingFields };
  }

  for (const def of outputDefs) {
    if (!(def.name in parsed)) {
      missingFields.push(def.name);
    }
    outputs[def.name] = coerceValue(parsed[def.name], def.type);
  }

  return { outputs, missingFields };
}

/**
 * text 模式：沿用「整段文本写入每个 output」的旧行为
 */
export function mapTextToLlmOutputs(
  text: string,
  outputDefs: LLMOutputVariable[] | undefined,
  model?: string,
): Record<string, unknown> {
  const outputs: Record<string, unknown> = {};

  if (!outputDefs?.length) {
    outputs.text = text;
    return outputs;
  }

  for (const output of outputDefs) {
    if (output.type === "object") {
      outputs[output.name] = { text, model };
    } else if (output.type === "array") {
      outputs[output.name] = [text];
    } else {
      outputs[output.name] = text;
    }
  }

  return outputs;
}
