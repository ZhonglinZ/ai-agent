import { runLLM } from "@/lib/ai/llmRunner";
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

    const outputs: Record<string, unknown> = {};

    if (nodeData.outputs?.length) {
      for (const output of nodeData.outputs) {
        if (output.type === "object") {
          outputs[output.name] = {
            text: llmResult.text,
            model: nodeData.model,
          };
        } else if (output.type === "array") {
          outputs[output.name] = [llmResult.text];
        } else {
          outputs[output.name] = llmResult.text;
        }
      }
    } else {
      outputs.text = llmResult.text;
    }
    return NextResponse.json({
      success: true,
      data: {
        outputs,
        logs: [`模型 ${nodeData.model || "qwen-plus"} 调用成功`],
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "请求体无效" },
      { status: 400 },
    );
  }
}
