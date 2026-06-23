/**
 * 智能体集合 API
 * GET  /api/agent — 列表
 * POST /api/agent — 创建空白智能体，或传入完整 Agent 创建记录
 */

import { NextRequest, NextResponse } from "next/server";
import type { Agent } from "@/lib/types/agent";
import { agentDbService } from "@/lib/services/agentDb.service";

export async function GET() {
  try {
    const data = await agentDbService.getAgentList();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("获取智能体列表失败:", error);
    return NextResponse.json(
      { success: false, message: "获取智能体列表失败" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const text = await request.text();
      if (text.trim()) {
        const body = JSON.parse(text) as Agent;
        if (body?.id) {
          const data = await agentDbService.createAgent(body);
          return NextResponse.json({ success: true, data });
        }
      }
    }

    const data = await agentDbService.createEmptyAgent();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("创建智能体失败:", error);
    return NextResponse.json(
      { success: false, message: "创建智能体失败" },
      { status: 500 },
    );
  }
}
