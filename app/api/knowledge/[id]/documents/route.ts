import { knowledgeBaseDbService } from "@/lib/services/knowledgeDb.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const text = await request.text();
      if (text.trim()) {
        const body = JSON.parse(text) as { name: string; content: string };
        if (body?.name && body?.content) {
          await knowledgeBaseDbService.addDocumentAndIngest(id, body);
        }
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  } catch (error) {
    console.error("添加文档失败:", error);
    return NextResponse.json({ error: "添加文档失败" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "知识库ID不能为空" }, { status: 400 });
  }
  try {
    const docs = await knowledgeBaseDbService.listDocsByKnowledgeBaseId(id);
    return NextResponse.json({ success: true, data: docs }, { status: 200 });
  } catch (error) {
    console.error("获取文档失败:", error);
    return NextResponse.json({ error: "获取文档失败" }, { status: 500 });
  }
}
