import { knowledgeBaseDbService } from "@/lib/services/knowledgeDb.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "知识库ID不能为空" }, { status: 400 });
    }
    const knowledgeBase = await knowledgeBaseDbService.getKnowledgeBaseById(id);
    if (!knowledgeBase) {
      return NextResponse.json({ error: "知识库不存在" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: knowledgeBase });
  } catch (error) {
    console.error("获取知识库失败:", error);
    return NextResponse.json({ error: "获取知识库失败" }, { status: 500 });
  }
}
