import { retrieve, RetrieveOptions } from "@/lib/rag/retrieve";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "知识库ID不能为空" },
        { status: 400 },
      );
    }
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const text = await request.text();
      if (text.trim()) {
        const body = JSON.parse(text) as RetrieveOptions;
        const res = await retrieve({
          knowledgeBaseId: id,
          query: body.query,
          topK: body.topK,
          scoreThreshold: body.scoreThreshold,
        });
        return NextResponse.json({ success: true, data: res });
      }
    }
    return NextResponse.json(
      { success: false, message: "请求体格式错误" },
      { status: 400 },
    );
  } catch (error) {
    console.error("检索失败:", error);
    return NextResponse.json(
      { success: false, message: "检索失败" },
      { status: 500 },
    );
  }
}
