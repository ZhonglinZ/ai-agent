"use client";

import { useEffect, useRef } from "react";
import { useAgentDraftStore } from "@/lib/stores/agentDraftStore";

const DEFAULT_AUTO_SAVE_DELAY = 1200;

export const useAgentAutoSave = (delay = DEFAULT_AUTO_SAVE_DELAY) => {
  const isDirty = useAgentDraftStore.use.useIsDirty();
  const updatedAt = useAgentDraftStore.use.useDraft().updatedAt;
  const markSaved = useAgentDraftStore.use.useMarkSaved();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      markSaved();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [delay, isDirty, markSaved, updatedAt]);
};
