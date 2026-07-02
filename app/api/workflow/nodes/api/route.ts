import { NextRequest, NextResponse } from "next/server";
import type { APINodeExecuteRequest } from "@/lib/types/workflowRun";
import { runHttpRequest } from "@/lib/services/httpExecutor";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as APINodeExecuteRequest;
    const { nodeData, variables } = body;
    if (!nodeData.url?.trim()) {
      return NextResponse.json(
        { success: false, message: "url 不能为空" },
        { status: 400 },
      );
    }

    const result = await runHttpRequest(nodeData, variables);

    return NextResponse.json({
      success: true,
      data: {
        outputs: {
          body: result.body,
          status_code: result.status_code,
          headers: result.headers,
        },
        logs: [
          `${nodeData.method} ${nodeData.url}`,
          `状态码: ${result.status_code}`,
        ],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "API 节点执行失败";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
