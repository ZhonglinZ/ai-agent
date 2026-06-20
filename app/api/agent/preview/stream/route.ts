import { NextRequest } from "next/server";

export const runtime = "nodejs";

const MOCK_THOUGHT_STEPS = [
  "解析用户需求，明确输出的结构与重点。",
  "拆分成文本、表格、代码、图表、图片等模块。",
  "准备示例数据，保证可直接渲染。",
  "规划输出顺序，先概述再给细节。",
  "整理格式细节，确保 Markdown 可读。",
  "检查数据一致性，避免表格与图表不匹配。",
  "确认展示效果，适配预览区的宽度。",
  "补充结论段，方便用户快速复述。",
  "校验公式语法，保证渲染正常。",
  "准备自定义表单与组件示例数据。",
  "最终检查排版与字体层级。",
];

const createChunks = (text: string, size = 10) => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
};

const shouldMockError = (content: string) => /error|错误|失败/i.test(content);

const buildRichReply = (content: string) => {
  const title = content?.trim()
    ? `下面是围绕「${content.trim()}」生成的示例输出，包含文本、表格、代码、图表、图片与 CSV：`
    : "下面是示例输出，包含文本、表格、代码、图表、图片与 CSV：";

  return [
    title,
    "",
    "## 1. 文字说明",
    "- 这是一个用于演示渲染能力的输出模板。",
    "- 实际业务中可根据场景替换内容与数据。",
    '- 预览区将同时展示"思考过程 + 正文"。',
    "",
    "## 2. 代码块",
    "```ts",
    "type ReportItem = { month: string; revenue: number; cost: number };",
    "",
    "const data: ReportItem[] = [",
    "  { month: '1月', revenue: 120, cost: 80 },",
    "  { month: '2月', revenue: 160, cost: 95 },",
    "  { month: '3月', revenue: 190, cost: 110 },",
    "];",
    "```",
    "",
    "## 3. Markdown 表格（可当作简易 Excel）",
    "| 指标 | 1月 | 2月 | 3月 |",
    "| --- | --- | --- | --- |",
    "| 收入 | 120 | 160 | 190 |",
    "| 成本 | 80 | 95 | 110 |",
    "| 利润 | 40 | 65 | 80 |",
    "",
    "## 4. Excel/CSV",
    "```csv",
    "月份,收入,成本,利润",
    "1月,120,80,40",
    "2月,160,95,65",
    "3月,190,110,80",
    "```",
    "",
    "## 5. 公式",
    "当输入是公式时，可直接渲染：",
    "",
    "$",
    "E = mc^2",
    "$",
    "",
    "## 6. 图表（chart 配置）",
    "```chart",
    "{",
    '  "type": "line",',
    '  "data": [',
    '    { "month": "1月", "value": 120, "category": "收入" },',
    '    { "month": "2月", "value": 160, "category": "收入" },',
    '    { "month": "3月", "value": 190, "category": "收入" },',
    '    { "month": "1月", "value": 80, "category": "成本" },',
    '    { "month": "2月", "value": 95, "category": "成本" },',
    '    { "month": "3月", "value": 110, "category": "成本" }',
    "  ],",
    '  "xField": "month",',
    '  "yField": "value",',
    '  "seriesField": "category",',
    '  "smooth": true',
    "}",
    "```",
    "",
    "## 7. 图片",
    "![示例图片](/globe.svg)",
    "",
    "## 8. 自定义表单",
    "```form",
    "{",
    '  "title": "审批表单",',
    '  "description": "用于演示自定义表单渲染",',
    '  "fields": [',
    '    { "label": "申请人", "type": "input", "placeholder": "请输入姓名", "required": true },',
    '    { "label": "部门", "type": "select", "options": ["市场部", "财务部", "法务部"] },',
    '    { "label": "金额", "type": "number", "placeholder": "请输入金额" },',
    '    { "label": "备注", "type": "textarea", "placeholder": "补充说明" }',
    "  ]",
    "}",
    "```",
    "",
    "## 9. 自定义组件",
    "```component",
    "{",
    '  "title": "关键指标",',
    '  "description": "自定义组件示例",',
    '  "type": "stat",',
    '  "items": [',
    '    { "label": "激活用户", "value": "12,480", "desc": "较上周 +6%" },',
    '    { "label": "留存率", "value": "42.3%", "desc": "较上周 +1.2%" },',
    '    { "label": "平均时长", "value": "5m 24s", "desc": "较上周 -0.3%" },',
    '    { "label": "转化率", "value": "3.8%", "desc": "较上周 +0.4%" }',
    "  ]",
    "}",
    "```",
    "",
    "## 10. 结论",
    "- 以上内容覆盖了文本、代码、表格、图表、图片等通用格式。",
    "- 可在后续接入真实模型输出后直接复用渲染能力。",
  ].join("\n");
};

const buildSseMessage = (event: string, payload: Record<string, unknown>) =>
  `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const content = searchParams.get("message") ?? "";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let closed = false;
      let thoughtIndex = 0;
      let chunkIndex = 0;
      const thoughtChunks = createChunks(MOCK_THOUGHT_STEPS.join(" "), 8);
      const answerChunks = createChunks(buildRichReply(content), 24);

      const clearTimer = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      const closeStream = () => {
        if (closed) return;
        closed = true;
        clearTimer();
        controller.close();
      };

      const pushEvent = (event: string, payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(buildSseMessage(event, payload)));
      };

      const abortHandler = () => {
        closeStream();
      };

      request.signal.addEventListener("abort", abortHandler);

      if (shouldMockError(content)) {
        timer = setTimeout(() => {
          pushEvent("error", { message: "模拟服务异常，请稍后重试。" });
          closeStream();
        }, 400);
        return;
      }

      const tick = () => {
        if (closed) return;

        if (thoughtIndex < thoughtChunks.length) {
          pushEvent("thought", { chunk: thoughtChunks[thoughtIndex] });
          thoughtIndex += 1;
        } else if (chunkIndex < answerChunks.length) {
          pushEvent("chunk", { chunk: answerChunks[chunkIndex] });
          chunkIndex += 1;
        } else {
          pushEvent("done", { message: "done" });
          closeStream();
          return;
        }

        timer = setTimeout(tick, 160);
      };

      timer = setTimeout(tick, 200);
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
