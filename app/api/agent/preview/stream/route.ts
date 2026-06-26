import { NextRequest } from "next/server";
import { qwen } from "@/lib/config/qwenConfig";
import { streamText } from "ai";

export const runtime = "nodejs";

const buildSseMessage = (event: string, payload: Record<string, unknown>) =>
  `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get("message")?.trim() ?? "";
  const rolePrompt = searchParams.get("rolePrompt")?.trim();
  const modelId = "qwen3.7-plus";

  const result = streamText({
    model: qwen(modelId),
    system: rolePrompt || undefined,
    prompt: message,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const closeStream = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      const pushEvent = (event: string, payload: Record<string, unknown>) => {
        if (closed) return;
        controller.enqueue(encoder.encode(buildSseMessage(event, payload)));
      };

      const abortHandler = () => {
        closeStream();
      };

      request.signal.addEventListener("abort", abortHandler);

      try {
        for await (const delta of result.textStream) {
          if (request.signal.aborted || closed) break;
          pushEvent("chunk", { chunk: delta });
        }

        if (!request.signal.aborted && !closed) {
          pushEvent("done", { message: "done" });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "模型调用失败，请稍后重试";
        pushEvent("error", { message: errorMessage });
      } finally {
        request.signal.removeEventListener("abort", abortHandler);
        closeStream();
      }
    },
    cancel() {
      // 连接被关闭时，ReadableStream 会自动清理。
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
