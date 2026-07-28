import { retrieve } from "@/lib/rag/retrieve";
import { resolveVariables } from "@/lib/services/variableResolver";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { nodeData, variables } = await request.json();
    const query = resolveVariables(nodeData.query, variables);
    const { topK, scoreThreshold, knowledgeBaseId } = nodeData;
    if (!query.trim()) {
      return NextResponse.json(
        { success: false, message: "查询词不能为空" },
        { status: 400 },
      );
    }
    const hits = await retrieve({
      knowledgeBaseId,
      query,
      topK,
      scoreThreshold,
    });
    const context = hits
      .map(
        (h, i) =>
          `[${i + 1}] (score=${h.score.toFixed(3)})\n${h.chunk.content}`,
      )
      .join("\n\n");
    const outputs = {
      context: context,
      chunks: hits,
    };
    return NextResponse.json({
      success: true,
      data: {
        outputs,
        logs: [`知识库查询成功`],
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "请求体无效" },
      { status: 400 },
    );
  }
}
