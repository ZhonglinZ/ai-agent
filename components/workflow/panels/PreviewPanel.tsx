"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Button, Input, Tag, Empty } from "antd";
import { ClearOutlined, SendOutlined } from "@ant-design/icons";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { useWorkflowRunStore } from "@/lib/stores/workflowRunStore";
import { NodeType, type LLMNodeData, type StartNodeData } from "@/lib/workflow";
import { workflowRunService } from "@/lib/services/workflowRun.service";

type PreviewMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

/**
 * 从开始节点收集默认变量（静默注入，不弹表单）
 */
function buildStartDefaultVariables(
  nodes: ReturnType<typeof useWorkflowStore.getState>["nodes"],
): Record<string, unknown> {
  const startNode = nodes.find((node) => node.type === NodeType.START);
  if (!startNode) return {};

  const data = startNode.data as StartNodeData;
  const variables: Record<string, unknown> = {};

  for (const input of data.inputs ?? []) {
    const value = input.defaultValue ?? "";
    variables[input.name] = value;
    variables[`${data.label}.${input.name}`] = value;
  }

  return variables;
}

/**
 * 工作流预览面板（简单版）
 * - 调试当前选中的 LLM 节点（未选中则用第一个 LLM）
 * - 开始节点变量用默认值静默注入
 * - 先走非流式完整回复（稳定）；流式可后续加
 */
export const PreviewPanel: React.FC = () => {
  const isPreviewPanelOpen = useWorkflowRunStore(
    (state) => state.isPreviewPanelOpen,
  );
  const closePreviewPanel = useWorkflowRunStore(
    (state) => state.closePreviewPanel,
  );

  const nodes = useWorkflowStore((state) => state.nodes);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const targetLlmNode = useMemo(() => {
    const selected = selectedNodeId
      ? nodes.find((node) => node.id === selectedNodeId)
      : null;
    if (selected?.type === NodeType.LLM) return selected;
    return nodes.find((node) => node.type === NodeType.LLM) ?? null;
  }, [nodes, selectedNodeId]);

  const llmData = targetLlmNode?.data as LLMNodeData | undefined;

  const startDefaultsHint = useMemo(() => {
    const startNode = nodes.find((node) => node.type === NodeType.START);
    if (!startNode) return null;
    const data = startNode.data as StartNodeData;
    const names = (data.inputs ?? []).map((item) => item.name).filter(Boolean);
    if (names.length === 0) return null;
    return `将使用开始节点默认值: ${names.join(", ")}`;
  }, [nodes]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isPreviewPanelOpen) return null;

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setInput("");
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    if (!targetLlmNode || !llmData) {
      setError("请先在画布上添加或选中一个大模型节点");
      return;
    }

    if (!llmData.prompt?.trim()) {
      setError("当前大模型节点的提示词为空，请先在属性面板填写 prompt");
      return;
    }

    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        role: "user",
        content,
      },
    ]);
    setIsLoading(true);

    try {
      const variables = {
        ...buildStartDefaultVariables(nodes),
        // 预览时把用户输入也放进变量，方便 prompt 写 {{user}} / {{message}}
        user: content,
        message: content,
        [`${llmData.label}.user`]: content,
      };

      // 预览：把用户消息拼到 prompt 后面，便于「聊天式」试调
      const previewNodeData: LLMNodeData = {
        ...llmData,
        prompt: `${llmData.prompt}\n\n用户输入：${content}`,
      };

      const result = await workflowRunService.executeLLMNode({
        runId: `preview_${Date.now()}`,
        nodeId: targetLlmNode.id,
        variables,
        nodeData: previewNodeData,
      });

      const text =
        (result.outputs.text as string) ??
        Object.values(result.outputs).find((v) => typeof v === "string") ??
        JSON.stringify(result.outputs);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          content: String(text),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "预览调用失败，请稍后重试";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg flex flex-col max-h-[70vh]">
      <div className="px-4 py-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="m-0 text-base font-medium">预览</h3>
          <div className="flex items-center gap-2">
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClear}
              disabled={isLoading || messages.length === 0}
            />
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              onClick={closePreviewPanel}
            >
              ×
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {targetLlmNode ? (
            <Tag color="blue">调试: {llmData?.label || "大模型"}</Tag>
          ) : (
            <Tag color="default">未找到大模型节点</Tag>
          )}
        </div>
        {startDefaultsHint && (
          <div className="mt-1 text-xs text-gray-400">{startDefaultsHint}</div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
        {messages.length === 0 && !isLoading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="输入消息，试调当前大模型节点"
          />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 rounded-lg px-3 py-2 text-sm">
              生成中...
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      {error && (
        <div className="px-4 pb-2 text-xs text-red-500 shrink-0">{error}</div>
      )}

      <div className="px-4 py-3 border-t flex gap-2 shrink-0">
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入试调内容..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={isLoading || !targetLlmNode}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={isLoading}
          disabled={!input.trim() || !targetLlmNode}
          onClick={() => void handleSend()}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
