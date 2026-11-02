// ============================================================
// IVVAB AI Search & Research Copilot — Chat State Provider
// Live streaming, Web Search Grounding, Conversational Memory, and Auth
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { SearchSource } from "@/lib/search/types";

export interface IvvabCitation {
  id?: string;
  title: string;
  url?: string;
  domain?: string;
  snippet?: string;
  publishedDate?: string;
  courseTitle?: string;
  route?: string;
  score?: number;
  isVerified?: boolean;
  provider?: string;
}

export interface IvvabLearningContext {
  courseSlug?: string;
  moduleSlug?: string;
  lessonTitle?: string;
  labSlug?: string;
  taskId?: string;
  taskTitle?: string;
  datasetInfo?: string;
  learningMode?: "general" | "lesson" | "lab" | "assessment";
}

export interface IvvabMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  sources?: IvvabCitation[];
  citations?: IvvabCitation[];
  followUps?: string[];
  isWebVerified?: boolean;
  providerUsed?: string;
  searchProgress?: string;
}

export interface SavedHistoryItem {
  id: string;
  message: string;
  reply: string;
  created_at: string;
}

export interface IvvabChatContextType {
  isOpen: boolean;
  isMinimized: boolean;
  messages: IvvabMessage[];
  isLoading: boolean;
  isSearchingWeb: boolean;
  webSearchEnabled: boolean;
  searchProgressText: string;
  suggestedPrompts: string[];
  activeLearningContext: IvvabLearningContext | null;
  savedHistory: SavedHistoryItem[];
  isLoadingHistory: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  setLearningContext: (ctx: IvvabLearningContext | null) => void;
  openIvvab: (initialPrompt?: string, context?: IvvabLearningContext) => void;
  closeIvvab: () => void;
  toggleIvvab: () => void;
  toggleMinimize: () => void;
  sendMessage: (text: string, context?: IvvabLearningContext) => Promise<void>;
  stopGenerating: () => void;
  regenerateLastMessage: () => Promise<void>;
  clearMessages: () => void;
  loadSavedHistory: () => Promise<void>;
  clearSavedHistory: () => Promise<void>;
  loadHistoryConversation: (item: SavedHistoryItem) => void;
}

const INITIAL_MESSAGE: IvvabMessage = {
  id: "ivvab-welcome",
  role: "assistant",
  content:
    "Hello! I'm **IVVAB**, your AI research copilot and cybersecurity assistant. I combine real-time live web search, threat intelligence (CVE advisories), and NISQ Vanguard Academy curriculum to deliver accurate, source-grounded answers. What would you like to research today?",
  timestamp: Date.now(),
};

const IvvabChatContext = createContext<IvvabChatContextType | undefined>(undefined);

export function IvvabChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<IvvabMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchProgressText, setSearchProgressText] = useState("");
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [activeLearningContext, setActiveLearningContext] = useState<IvvabLearningContext | null>(null);
  const [savedHistory, setSavedHistory] = useState<SavedHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const activeAbortRef = useRef<AbortController | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Dynamically adapt suggested prompts to page context
  const suggestedPrompts = useMemo(() => {
    const p = pathname.toLowerCase();

    if (activeLearningContext?.labSlug || p.includes("/lab/")) {
      return [
        "Give me a hint for this investigation task",
        "Explain what this dataset telemetry represents",
        "What terminal command should I use to filter this log?",
        "Explain why this vulnerability happened",
      ];
    }

    if (p === "/" || p === "") {
      return [
        "What are the latest NIST post-quantum cryptography standards?",
        "Explain CVE-2024-3094 xz backdoor severity and impact",
        "What are the latest cybersecurity threats in 2025/2026?",
        "How do I start hands-on defense training in IVVAB LABS?",
      ];
    }

    if (p.startsWith("/academy") || p.startsWith("/courses")) {
      return [
        "Which cybersecurity roadmap should a beginner start with?",
        "Explain Foundation vs. Practitioner levels in Academy",
        "What prerequisites are needed for SOC Analysis & Threat Hunting?",
        "How does hands-on lab practice connect to lessons?",
      ];
    }

    if (p.includes("/learn/")) {
      return [
        "Explain this lesson in simple terms with an example",
        "Give me a practice quiz question on this topic",
        "What real-world security incidents involve this technique?",
        "How do defenders mitigate this weakness in production?",
      ];
    }

    if (p.startsWith("/cyber-range")) {
      return [
        "How do I investigate Linux auth.log brute force attacks?",
        "How does DNS tunneling work in Suricata labs?",
        "Walk me through SQL injection forensics in Apache logs",
        "How do I analyze Windows processes with Volatility 3?",
      ];
    }

    if (p.startsWith("/services") || p.startsWith("/appointments")) {
      return [
        "What security consulting services does NISQ Vanguard offer?",
        "What is an API Security Assessment?",
        "How does an Architecture Review work?",
        "How do I book an advisory session?",
      ];
    }

    return [
      "What is NISQ Vanguard?",
      "Explain the CIA Triad with practical mitigations",
      "Look up recent CVE advisories from NIST NVD",
      "How do I get started with cybersecurity?",
    ];
  }, [pathname, activeLearningContext]);

  // Load saved history from Supabase if logged in
  const loadSavedHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setSavedHistory([]);
        return;
      }

      const res = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = (await res.json()) as { history?: SavedHistoryItem[] };
        setSavedHistory(json.history || []);
      }
    } catch (err) {
      console.warn("[IVVAB Chat] Failed to load history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const clearSavedHistory = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        await fetch("/api/chat", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setSavedHistory([]);
    } catch (err) {
      console.warn("[IVVAB Chat] Failed to clear history:", err);
    }
  }, []);

  const loadHistoryConversation = useCallback((item: SavedHistoryItem) => {
    const userMsg: IvvabMessage = {
      id: "hist-u-" + item.id,
      role: "user",
      content: item.message,
      timestamp: new Date(item.created_at).getTime(),
    };
    const assistantMsg: IvvabMessage = {
      id: "hist-a-" + item.id,
      role: "assistant",
      content: item.reply,
      timestamp: new Date(item.created_at).getTime(),
      isWebVerified: true,
    };
    setMessages([INITIAL_MESSAGE, userMsg, assistantMsg]);
  }, []);

  const openIvvab = useCallback((initialPrompt?: string, context?: IvvabLearningContext) => {
    setIsOpen(true);
    setIsMinimized(false);
    if (context) {
      setActiveLearningContext(context);
    }
    if (initialPrompt && initialPrompt.trim()) {
      setTimeout(() => {
        void executeSendMessage(initialPrompt.trim(), context);
      }, 100);
    }
  }, []);

  const closeIvvab = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleIvvab = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (isMinimized) setIsMinimized(false);
  }, [isMinimized]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
      activeAbortRef.current = null;
    }
    setMessages([INITIAL_MESSAGE]);
    setIsLoading(false);
    setIsSearchingWeb(false);
    setSearchProgressText("");
  }, []);

  const stopGenerating = useCallback(() => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
      activeAbortRef.current = null;
    }
    setIsLoading(false);
    setIsSearchingWeb(false);
    setSearchProgressText("");
  }, []);

  const executeSendMessage = async (text: string, context?: IvvabLearningContext) => {
    if (!text.trim() || isLoading) return;

    // Abort previous in-flight request if any
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const abortController = new AbortController();
    activeAbortRef.current = abortController;

    const effectiveContext = context || activeLearningContext;

    const userMsgId = "u-" + Date.now();
    const userMessage: IvvabMessage = {
      id: userMsgId,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    const assistantMsgId = "a-" + Date.now();
    const pendingAssistantMessage: IvvabMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      sources: [],
      citations: [],
    };

    setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
    setIsLoading(true);
    setIsSearchingWeb(webSearchEnabled);
    setSearchProgressText(webSearchEnabled ? "Analyzing inquiry & searching live web..." : "Reasoning...");

    // Build history for backend multi-turn conversation
    const historyPayload = messages
      .filter((m) => m.content.trim().length > 0)
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      // Retrieve auth token if user is signed in
      let authToken: string | undefined;
      try {
        const { data } = await supabase.auth.getSession();
        authToken = data.session?.access_token;
      } catch {
        // Continue unauthenticated
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        signal: abortController.signal,
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          forceSearch: webSearchEnabled,
          pageContext: {
            path: typeof window !== "undefined" ? window.location.pathname : "/",
            title: typeof document !== "undefined" ? document.title : "",
          },
          learningContext: effectiveContext || undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let finalFollowUps: string[] | undefined;
        let finalCitations: SearchSource[] | undefined;
        let finalSources: SearchSource[] | undefined;
        let isWebVerified = false;
        let providerUsed: string | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                // Live search events
                if (data.type === "search_start") {
                  setIsSearchingWeb(true);
                  setSearchProgressText(`Searching live web for "${data.query}"...`);
                } else if (data.type === "search_done") {
                  setIsSearchingWeb(false);
                  finalSources = data.sources;
                  isWebVerified = data.isWebVerified;
                  setSearchProgressText("");
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? {
                            ...msg,
                            sources: data.sources,
                            isWebVerified: data.isWebVerified,
                          }
                        : msg,
                    ),
                  );
                } else if (data.chunk || data.type === "chunk") {
                  const chunkStr = data.chunk || "";
                  accumulated += chunkStr;
                  setIsSearchingWeb(false);
                  setSearchProgressText("");
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId
                        ? { ...msg, content: accumulated }
                        : msg,
                    ),
                  );
                } else if (data.type === "citations") {
                  finalCitations = data.citations;
                } else if (data.type === "done" || data.done) {
                  finalFollowUps = data.followUps;
                  if (data.citations) finalCitations = data.citations;
                  if (data.isWebVerified !== undefined) isWebVerified = data.isWebVerified;
                  providerUsed = data.providerUsed;
                } else if (data.type === "error" || data.error) {
                  throw new Error(data.error);
                }
              } catch (parseErr) {
                if ((parseErr as Error).name === "AbortError") throw parseErr;
                // Ignore partial json parse error
              }
            }
          }
        }

        // Finalize message state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: accumulated || msg.content,
                  sources: finalSources || msg.sources,
                  citations: finalCitations || finalSources || msg.citations,
                  followUps: finalFollowUps,
                  isWebVerified,
                  providerUsed,
                }
              : msg,
          ),
        );
      } else {
        // Non-streaming JSON response fallback
        const data = (await response.json()) as {
          reply?: string;
          followUps?: string[];
          citations?: SearchSource[];
          isWebVerified?: boolean;
          provider?: string;
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: data.reply || "No response received.",
                  followUps: data.followUps,
                  sources: data.citations,
                  citations: data.citations,
                  isWebVerified: data.isWebVerified,
                  providerUsed: data.provider,
                }
              : msg,
          ),
        );
      }

      // Proactively refresh saved history for logged in user
      if (authToken) {
        void loadSavedHistory();
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        console.log("[IVVAB Chat] Generation stopped by user.");
      } else {
        console.error("[IVVAB Chat Error]:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    `⚠️ **Connection Issue**: Unable to reach the AI research pipeline (${(err as Error).message}). Please check your internet connection and retry.`,
                }
              : msg,
          ),
        );
      }
    } finally {
      setIsLoading(false);
      setIsSearchingWeb(false);
      setSearchProgressText("");
      activeAbortRef.current = null;
    }
  };

  const sendMessage = useCallback(
    async (text: string, context?: IvvabLearningContext) => {
      await executeSendMessage(text, context);
    },
    [messages, isLoading, activeLearningContext, webSearchEnabled],
  );

  const regenerateLastMessage = useCallback(async () => {
    // Find last user message
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    await executeSendMessage(lastUser.content);
  }, [messages]);

  return (
    <IvvabChatContext.Provider
      value={{
        isOpen,
        isMinimized,
        messages,
        isLoading,
        isSearchingWeb,
        webSearchEnabled,
        searchProgressText,
        suggestedPrompts,
        activeLearningContext,
        savedHistory,
        isLoadingHistory,
        setWebSearchEnabled,
        setLearningContext: setActiveLearningContext,
        openIvvab,
        closeIvvab,
        toggleIvvab,
        toggleMinimize,
        sendMessage,
        stopGenerating,
        regenerateLastMessage,
        clearMessages,
        loadSavedHistory,
        clearSavedHistory,
        loadHistoryConversation,
      }}
    >
      {children}
    </IvvabChatContext.Provider>
  );
}

export function useIvvabChat() {
  const context = useContext(IvvabChatContext);
  if (!context) {
    throw new Error("useIvvabChat must be used within an IvvabChatProvider");
  }
  return context;
}
