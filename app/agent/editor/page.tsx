"use client";

import React, { useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import {
  AgentEditorHeader,
  AgentEditorWorkspace,
} from "@/components/agent/editor";
import { useAgentAutoSave } from "@/lib/hooks/useAgentAutoSave";
import { useAgentUIStore } from "@/lib/stores/agentUIStore";
import { useAgentEditor } from "@/lib/hooks/useAgentEditor";

const AgentEditorPage = () => {
  const { saveDraft, publishAgent, validateForPublish } = useAgentEditor();
  useAgentAutoSave(saveDraft);
  const activeTab = useAgentUIStore.use.useActiveTab();

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.height = prevHtmlHeight;
    };
  }, []);

  return (
    <MainLayout>
      <div className="h-full flex flex-col overflow-hidden">
        <AgentEditorHeader
          saveDraft={saveDraft}
          publishAgent={publishAgent}
          validateForPublish={validateForPublish}
        />
        <div className="flex-1 min-h-0 px-6 py-4 overflow-hidden">
          {activeTab === "config" ? (
            <AgentEditorWorkspace />
          ) : (
            <div className="h-full rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 flex items-center justify-center">
              暂无内容
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentEditorPage;
