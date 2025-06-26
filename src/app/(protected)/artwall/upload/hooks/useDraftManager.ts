import { useState, useCallback } from "react";

interface DraftData {
  title: string;
  content: string;
  labels: string;
  timestamp: number;
}

export function useDraftManager() {
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const saveDraft = useCallback((data: Omit<DraftData, "timestamp">) => {
    if (data.title.trim() || data.content.trim()) {
      const draftData: DraftData = {
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem("draft-post", JSON.stringify(draftData));
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    }
  }, []);

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const draft = localStorage.getItem("draft-post");
      if (draft) {
        const parsed: DraftData = JSON.parse(draft);
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000; // 24 hours

        if (isRecent && (parsed.title || parsed.content)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
    return null;
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem("draft-post");
  }, []);

  return {
    isDraftSaved,
    saveDraft,
    loadDraft,
    clearDraft,
  };
}
