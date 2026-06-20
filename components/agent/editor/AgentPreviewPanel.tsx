"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Tag } from "antd";
import { useAgentDraftStore } from "@/lib/stores/agentDraftStore";
import { AgentLogo } from "./AgentLogo";
import { useAgentPreviewStore } from "@/lib/stores/agentPreviewStore";
import {
  DEFAULT_OPENING_STATEMENT,
  MAX_SUGGESTED_QUESTIONS,
  normalizeSuggestedQuestions,
} from "./agentConversationDefaults";
import { useAgentPreviewSession } from "@/lib/hooks/useAgentPreviewSession";
import { AgentPreviewComposer } from "./AgentPreviewComposer";
import { AgentPreviewMessageList } from "./AgentPreviewMessageList";
import { AgentPreviewDebugPanel } from "./AgentPreviewDebugPanel";

export const AgentPreviewPanel: React.FC = () => {
  const draft = useAgentDraftStore.use.useDraft();
  const messages = useAgentPreviewStore.use.useMessages();
  const debugEvents = useAgentPreviewStore.use.useDebugEvents();
  const clearDebugEvents = useAgentPreviewStore.use.useClearDebugEvents();
  const {
    input,
    isStreaming,
    lastError,
    setInput,
    sendMessage,
    quickAsk,
    resetSession,
    stopStreaming,
    retryLast,
  } = useAgentPreviewSession();
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef(true);
  const displayName = draft.name || "智能体名称";
  const displayDescription =
    draft.description || "在这里展示智能体定位与能力边界";
  const openingStatement =
    draft.conversation.openingStatement || DEFAULT_OPENING_STATEMENT;
  const suggestedQuestions = normalizeSuggestedQuestions(
    draft.conversation.suggestedQuestions,
  );
  const hasConversation = messages.length > 0 || isStreaming;

  // 消息摘要，用于触发滚动
  const messageDigest = useMemo(
    () =>
      messages
        .map(
          (message) =>
            `${message.id}:${message.content.length}:${message.thoughts?.length ?? 0}:${message.status ?? ""}`,
        )
        .join("|"),
    [messages],
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const container = scrollAreaRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  // 消息变化时自动滚动
  useEffect(() => {
    if (!autoScrollRef.current) return;
    const behavior: ScrollBehavior = isStreaming ? "auto" : "smooth";
    requestAnimationFrame(() => {
      scrollToBottom(behavior);
    });
  }, [isStreaming, messageDigest, scrollToBottom]);

  // 内容高度变化时自动滚动
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!autoScrollRef.current) return;
      scrollToBottom("auto");
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [scrollToBottom]);

  // 用户滚动时判断是否在底部
  const handleScroll = () => {
    const container = scrollAreaRef.current;
    if (!container) return;
    const threshold = 120;
    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    autoScrollRef.current = distance <= threshold;
  };

  const handleSend = () => {
    sendMessage();
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col h-full min-h-0 overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">预览与调试</h2>
          <Tag color="blue" className="m-0">
            对话预览
          </Tag>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Button type="text" size="small" onClick={resetSession}>
            清空对话
          </Button>
          <span>调试模式</span>
        </div>
      </div>

      {/* 内容区 */}
      <div
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-auto overscroll-contain mt-4"
      >
        <div ref={contentRef} className="space-y-3">
          {hasConversation ? (
            <AgentPreviewMessageList
              messages={messages}
              isStreaming={isStreaming}
              error={lastError}
              onRetry={retryLast}
            />
          ) : (
            <>
              {/* 信息卡片 */}
              <div className="rounded-2xl border border-gray-200 p-4 text-center">
                <AgentLogo
                  logo={draft.logo}
                  name={draft.name}
                  className="w-16 h-16 rounded-2xl bg-blue-50 mx-auto overflow-hidden"
                  textClassName="text-xl font-semibold text-blue-500"
                />
                <h3 className="mt-3 text-base font-semibold text-gray-900">
                  {displayName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {displayDescription}
                </p>

                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-600 space-y-2">
                  <p>{openingStatement}</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
                    {suggestedQuestions
                      .slice(0, MAX_SUGGESTED_QUESTIONS)
                      .map((question, index) => (
                        <li key={`preview-question-${index}`}>{question}</li>
                      ))}
                  </ol>
                </div>
              </div>

              {/* 推荐问按钮 */}
              <div className="space-y-2">
                {suggestedQuestions
                  .slice(0, MAX_SUGGESTED_QUESTIONS)
                  .map((question, index) => (
                    <Button
                      key={`preview-chip-${index}`}
                      block
                      className="text-left justify-start"
                      type="default"
                      onClick={() => quickAsk(question)}
                    >
                      {question}
                    </Button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 输入区 */}
      <AgentPreviewComposer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={!input.trim()}
        isStreaming={isStreaming}
        onStop={stopStreaming}
        onRetry={retryLast}
        canRetry={Boolean(lastError)}
      />

      {/* 调试面板 */}
      <AgentPreviewDebugPanel
        open={isDebugOpen}
        events={debugEvents}
        onToggle={() => setIsDebugOpen((prev) => !prev)}
        onClear={clearDebugEvents}
      />
    </section>
  );
};
