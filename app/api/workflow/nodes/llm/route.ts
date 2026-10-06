import { runLLM } from "@/lib/ai/llmRunner";
import {
  extractJsonObject,
  mapJsonToLlmOutputs,
  mapTextToLlmOutputs,
} from "@/lib/services/llmJsonOutput";
import { resolveVariables } from "@/lib/services/variableResolver";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { nodeData, variables } = await request.json();
    const prompt = resolveVariables(nodeData.prompt, variables);
    const system = resolveVariables(nodeData.context, variables);
    if (!prompt.trim()) {
      return NextResponse.json(
        { success: false, message: "prompt 不能为空" },
        { status: 400 },
      );
    }
    const llmResult = await runLLM({
      prompt,
      system: system || undefined,
      model: nodeData.model,
      temperature: nodeData.temperatureEnabled
        ? nodeData.temperature
        : undefined,
      topP: nodeData.topPEnabled ? nodeData.topP : undefined,
    });

    const responseFormat = nodeData.responseFormat ?? "text";
    const logs: string[] = [
      `模型 ${nodeData.model || "qwen-plus"} 调用成功`,
    ];

    if (responseFormat === "json") {
      try {
        const parsed = extractJsonObject(llmResult.text);
        const { outputs, missingFields } = mapJsonToLlmOutputs(
          parsed,
          nodeData.outputs,
          llmResult.text,
        );
        if (missingFields.length > 0) {
          logs.push(`⚠️ JSON 缺少字段: ${missingFields.join(", ")}`);
        }
        logs.push("📦 已按 JSON 映射输出字段");
        return NextResponse.json({
          success: true,
          data: { outputs, logs },
        });
      } catch (parseError) {
        const message =
          parseError instanceof Error
            ? parseError.message
            : "JSON 解析失败";
        return NextResponse.json(
          { success: false, message: `结构化输出校验失败: ${message}` },
          { status: 400 },
        );
      }
    }

    const outputs = mapTextToLlmOutputs(
      llmResult.text,
      nodeData.outputs,
      nodeData.model,
    );
    return NextResponse.json({
      success: true,
      data: { outputs, logs },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "请求体无效或模型调用失败";
    return NextResponse.json(
      { success: false, message },
      { status: 400 },
    );
  }
}
