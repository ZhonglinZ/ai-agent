import { knowledgeBaseDbService } from "@/lib/services/knowledgeDb.service";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ docId: string }> },
) {
  try {
    const { docId } = await params;
    if (!docId) {
      return NextResponse.json(
        { success: false, message: "文档ID不能为空" },
        { status: 400 },
      );
    }
    const detail = await knowledgeBaseDbService.getDocumentDetail(docId);
    if (!detail) {
      return NextResponse.json(
        { success: false, message: "文档不存在" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: detail }, { status: 200 });
  } catch (error) {
    console.error("获取文档失败:", error);
    return NextResponse.json(
      { success: false, message: "获取文档失败" },
      { status: 500 },
    );
  }
}
