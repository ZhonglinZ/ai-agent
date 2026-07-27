import { knowledgeBaseDbService } from "@/lib/services/knowledgeDb.service";
import { CreateKnowledgeBaseRequest } from "@/lib/types/knowledge";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const data = await knowledgeBaseDbService.listKnowledgeBases();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("获取知识库列表失败:", error);
    return NextResponse.json(
      { success: false, message: "获取知识库列表失败" },
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
        const body = JSON.parse(text) as CreateKnowledgeBaseRequest;
        if (body?.name) {
          const data = await knowledgeBaseDbService.createKnowledgeBase(body);
          return NextResponse.json({ success: true, data });
        }
      }
    }

    const data = await knowledgeBaseDbService.createEmptyKnowledgeBase();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("创建知识库失败:", error);
    return NextResponse.json(
      { success: false, message: "创建知识库失败" },
      { status: 500 },
    );
  }
}
