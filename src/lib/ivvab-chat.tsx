import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";

export interface IvvabMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  followUps?: string[];
}

export interface IvvabChatContextType {
  isOpen: boolean;
  isMinimized: boolean;
  messages: IvvabMessage[];
  isLoading: boolean;
  suggestedPrompts: string[];
  openIvvab: (initialPrompt?: string) => void;
  closeIvvab: () => void;
  toggleIvvab: () => void;
  toggleMinimize: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

const INITIAL_MESSAGE: IvvabMessage = {
  id: "ivvab-welcome",
  role: "assistant",
  content:
    "Hello! I'm IVVAB, your AI assistant. I can help you navigate NISQ Vanguard, learn cybersecurity, explore IVVAB LABS, understand lessons, and find the right services.",
  timestamp: Date.now(),
};

const IvvabChatContext = createContext<IvvabChatContextType | undefined>(undefined);

export function IvvabChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<IvvabMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Dynamically adapt suggested prompts to the current website page
  const suggestedPrompts = useMemo(() => {
    const p = pathname.toLowerCase();

    if (p === "/" || p === "") {
      return [
        "How do I start learning on NISQ Vanguard?",
        "What is IVVAB LABS?",
        "What courses do you recommend for beginners?",
        "How does NISQ Vanguard help organizations?",
      ];
    }

    if (p.startsWith("/academy") || p.startsWith("/courses")) {
      return [
        "Which course should I take first?",
        "Explain Foundation vs. Practitioner levels",
        "What prerequisites are needed for SOC Analysis?",
        "How does hands-on lab practice connect to lessons?",
      ];
    }

    if (p.includes("/learn/")) {
      return [
        "Explain this lesson in simple terms",
        "Give me a practice quiz question on this topic",
        "What real-world security incidents involve this?",
        "How do defenders mitigate this weakness?",
      ];
    }

    if (p.startsWith("/cyber-range")) {
      return [
        "How do I spin up a lab container?",
        "How do flag submissions work in IVVAB LABS?",
        "Walk me through how to approach SQL Injection defense",
        "What tools are installed in the lab container?",
      ];
    }

    if (p.startsWith("/services")) {
      return [
        "What security consulting services do you offer?",
        "What is an API Security Assessment?",
        "How does an Architecture Review work?",
        "How do I book a security consultation?",
      ];
    }

    if (p.startsWith("/appointments")) {
      return [
        "How do I schedule an advisory session?",
        "What should our team prepare before our consultation?",
        "Which consulting tier fits a growth-stage company?",
      ];
    }

    if (p.startsWith("/reporting")) {
      return [
        "What is responsible disclosure?",
        "What details are required in a vulnerability report?",
        "How are reported vulnerabilities triaged?",
      ];
    }

    if (p.startsWith("/campus")) {
      return [
        "How can our college partner with NISQ Vanguard?",
        "What workshops and cyber education tiers are available?",
        "How do student cohort enrollments work?",
      ];
    }

    if (p.startsWith("/about")) {
      return [
        "Who founded NISQ Vanguard?",
        "What is the NISQ Vanguard security philosophy?",
        "Tell me about the command team",
      ];
    }

    if (p.startsWith("/dashboard")) {
      return [
        "How do I track my active course progress?",
        "Where do I see my completed lab flags?",
        "What should I study next to increase my Skill XP?",
      ];
    }

    return [
      "What is NISQ Vanguard?",
      "Explain the CIA Triad",
      "Tell me about IVVAB LABS",
      "How do I get started with cybersecurity?",
    ];
  }, [pathname]);

  const openIvvab = useCallback((initialPrompt?: string) => {
    setIsOpen(true);
    setIsMinimized(false);
    if (initialPrompt && initialPrompt.trim()) {
      void (async () => {
        // Small delay to ensure panel opened
        await new Promise((r) => setTimeout(r, 80));
        void executeSendMessage(initialPrompt.trim());
      })();
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
    setMessages([INITIAL_MESSAGE]);
  }, []);

  const executeSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

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
    };

    // Update conversation state with user message and pending assistant message
    setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
    setIsLoading(true);

    // Build history for backend multi-turn conversation
    const historyPayload = messages
      .filter((m) => m.content.trim().length > 0)
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          pageContext: {
            path: window.location.pathname,
            title: document.title,
          },
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";

      // Check if response is streaming SSE
      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let finalFollowUps: string[] | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          const lines = chunkText.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) {
                  accumulated += data.chunk;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg,
                    ),
                  );
                }
                if (data.done) {
                  finalFollowUps = data.followUps;
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        if (finalFollowUps && finalFollowUps.length > 0) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, followUps: finalFollowUps } : msg,
            ),
          );
        }
      } else {
        // Fallback to JSON response
        const data = (await response.json()) as { reply?: string; followUps?: string[] };
        const reply =
          data.reply || "I've analyzed your question and am ready to assist. Please let me know what specific aspect you'd like to explore next.";

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: reply,
                  followUps: data.followUps,
                }
              : msg,
          ),
        );
      }
    } catch (err) {
      console.error("[IVVAB Chat Error]:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  "I encountered a temporary connection issue reaching the AI backend. Please check your network connection or try asking again.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(
    async (text: string) => {
      await executeSendMessage(text);
    },
    [messages, isLoading],
  );

  return (
    <IvvabChatContext.Provider
      value={{
        isOpen,
        isMinimized,
        messages,
        isLoading,
        suggestedPrompts,
        openIvvab,
        closeIvvab,
        toggleIvvab,
        toggleMinimize,
        sendMessage,
        clearMessages,
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
