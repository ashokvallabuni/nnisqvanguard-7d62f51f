// ============================================================
// IVVAB AI Search & Research Copilot — Interactive Assistant UI
// Live Web Search, Grounded Evidence Citations, History & Controls
// ============================================================

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Minus,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  Compass,
  ArrowRight,
  Shield,
  Loader2,
  Terminal,
  BookOpen,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronsUpDown,
  Globe,
  Square,
  RotateCcw,
  History,
  ShieldCheck,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useIvvabChat,
  type IvvabMessage,
  type IvvabCitation,
  type SavedHistoryItem,
} from "@/lib/ivvab-chat";

// Code block with copy-to-clipboard functionality
function CodeBlock({ language, value }: { language?: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-border/70 bg-[#050b14] text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a1220] border-b border-border/40 text-[11px] text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5 uppercase font-medium text-primary">
          <Terminal className="w-3 h-3" />
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-100">
        <code>{value}</code>
      </pre>
    </div>
  );
}

// Source cards grid showing title, domain, snippet and external link
function SourceCardsView({ sources }: { sources: IvvabCitation[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="my-3 pt-1 border-t border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 font-semibold">
          <Globe className="w-3.5 h-3.5 text-primary" />
          Verified Sources ({sources.length}):
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, idx) => (
          <a
            key={idx}
            href={src.url || src.route || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-2 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/60 hover:border-primary/40 transition-all text-left"
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 truncate max-w-[80%]">
                <span className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center text-[9px]">
                  {src.id || idx + 1}
                </span>
                <span className="truncate">{src.domain || src.courseTitle || "Source"}</span>
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
            <p className="text-[11px] font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {src.title}
            </p>
            {src.snippet && (
              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                {src.snippet}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onSelectPrompt,
  onRegenerate,
}: {
  message: IvvabMessage;
  onSelectPrompt: (prompt: string) => void;
  onRegenerate: () => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const citationsMap = useMemo(() => {
    const map = new Map<string, IvvabCitation>();
    const list = message.citations || message.sources || [];
    list.forEach((c, idx) => {
      const key = c.id || String(idx + 1);
      map.set(key, c);
    });
    return map;
  }, [message.citations, message.sources]);

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-4`}>
      <div className="flex items-start gap-2.5 max-w-[95%] sm:max-w-[88%]">
        {!isUser && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-xs shadow-sm"
              : "bg-card border border-border text-card-foreground rounded-tl-xs shadow-xs w-full"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              {/* Web Verification Badge */}
              {message.isWebVerified && (
                <div className="mb-2 pb-1.5 border-b border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Live Web Grounded & Verified
                  </span>
                  {message.sources && message.sources.length > 0 && (
                    <span>{message.sources.length} sources analyzed</span>
                  )}
                </div>
              )}

              <div className="ivvab-markdown prose prose-sm dark:prose-invert max-w-none text-card-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { children, className } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      const strContent = String(children).replace(/\n$/, "");
                      if (match || strContent.includes("\n")) {
                        return <CodeBlock language={match?.[1]} value={strContent} />;
                      }
                      return (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-[12px] font-mono text-primary font-medium">
                          {children}
                        </code>
                      );
                    },
                    p(props) {
                      // Custom inline citation parser for [1], [2], etc.
                      const children = props.children;
                      if (typeof children === "string") {
                        const parts = children.split(/(\[\d+\])/g);
                        return (
                          <p className="mb-2 last:mb-0 leading-relaxed">
                            {parts.map((part, i) => {
                              const match = part.match(/^\[(\d+)\]$/);
                              if (match) {
                                const id = match[1];
                                const citation = citationsMap.get(id);
                                return (
                                  <a
                                    key={i}
                                    href={citation?.url || citation?.route || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center font-mono font-bold text-[10px] px-1 py-0.2 mx-0.5 rounded bg-primary/15 text-primary hover:bg-primary hover:text-white border border-primary/30 align-super transition-colors cursor-pointer select-none"
                                    title={
                                      citation
                                        ? `${citation.title} (${citation.domain || citation.courseTitle})`
                                        : `Verified Source [${id}]`
                                    }
                                  >
                                    [{id}]
                                  </a>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      }
                      return <p className="mb-2 last:mb-0 leading-relaxed" {...props} />;
                    },
                    ul(props) {
                      return <ul className="my-2 list-disc list-inside space-y-1" {...props} />;
                    },
                    ol(props) {
                      return <ol className="my-2 list-decimal list-inside space-y-1" {...props} />;
                    },
                    li(props) {
                      return <li className="leading-relaxed" {...props} />;
                    },
                    h2(props) {
                      return (
                        <h2
                          className="text-base font-display font-bold mt-3 mb-1 text-foreground"
                          {...props}
                        />
                      );
                    },
                    h3(props) {
                      return (
                        <h3
                          className="text-sm font-display font-semibold mt-2.5 mb-1 text-foreground"
                          {...props}
                        />
                      );
                    },
                    blockquote(props) {
                      return (
                        <blockquote
                          className="border-l-2 border-primary bg-primary/5 pl-3 py-1.5 my-2 rounded-r italic text-xs text-muted-foreground"
                          {...props}
                        />
                      );
                    },
                    a(props) {
                      return (
                        <a
                          className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                          target="_blank"
                          rel="noreferrer"
                          {...props}
                        />
                      );
                    },
                    table(props) {
                      return (
                        <div className="overflow-x-auto my-2 border border-border rounded">
                          <table className="w-full text-xs" {...props} />
                        </div>
                      );
                    },
                    th(props) {
                      return <th className="bg-muted/80 p-2 font-semibold text-left" {...props} />;
                    },
                    td(props) {
                      return <td className="p-2 border-t border-border/50" {...props} />;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Source Cards Carousel / Grid */}
              {message.sources && message.sources.length > 0 && (
                <SourceCardsView sources={message.sources} />
              )}

              {/* Action Toolbar on Assistant Messages */}
              <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span>IVVAB Research Engine</span>
                  {message.providerUsed && (
                    <span className="opacity-70">· {message.providerUsed}</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-muted/80 hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copy full answer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onRegenerate}
                    className="p-1 rounded hover:bg-muted/80 hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer ml-1"
                    title="Regenerate with fresh search"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-[10px]">Retry</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Suggested Follow-Ups */}
      {!isUser && message.followUps && message.followUps.length > 0 && (
        <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5">
          {message.followUps.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelectPrompt(prompt)}
              className="text-left inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary active:scale-[0.98] transition-all cursor-pointer font-medium"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function IvvabAssistant() {
  const {
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
  } = useIvvabChat();

  type HeightMode = "compact" | "standard" | "expanded";

  const [input, setInput] = useState("");
  const [heightMode, setHeightMode] = useState<HeightMode>("standard");
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragStartRef = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);

  // Track window resizing and mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxAvailableHeight = Math.max(280, viewportHeight - 156);

  const presetHeights = useMemo(() => {
    if (isMobile) {
      return {
        compact: Math.max(280, Math.min(360, Math.round(maxAvailableHeight * 0.48))),
        standard: Math.max(360, Math.min(540, Math.round(maxAvailableHeight * 0.74))),
        expanded: maxAvailableHeight,
      };
    }
    return {
      compact: 480,
      standard: 640,
      expanded: Math.min(840, Math.max(520, viewportHeight - 120)),
    };
  }, [isMobile, maxAvailableHeight, viewportHeight]);

  const activeHeight = useMemo(() => {
    if (isMinimized) return 56;
    if (customHeight !== null) {
      return Math.max(260, Math.min(maxAvailableHeight, customHeight));
    }
    return presetHeights[heightMode];
  }, [isMinimized, customHeight, presetHeights, heightMode, maxAvailableHeight]);

  const cycleHeightMode = useCallback(() => {
    setCustomHeight(null);
    setHeightMode((prev) => {
      if (prev === "compact") return "standard";
      if (prev === "standard") return "expanded";
      return "compact";
    });
  }, []);

  const setPresetMode = useCallback((mode: HeightMode) => {
    setCustomHeight(null);
    setHeightMode(mode);
  }, []);

  // Pointer drag to adjust height smoothly from top grab bar
  const handlePointerDownResize = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    const startY = e.clientY;
    const startH = activeHeight;
    dragStartRef.current = { startY, startH, moved: false };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) return;
      const deltaY = dragStartRef.current.startY - moveEvent.clientY;
      if (Math.abs(deltaY) > 5) {
        dragStartRef.current.moved = true;
      }
      const nextH = Math.max(260, Math.min(maxAvailableHeight, dragStartRef.current.startH + deltaY));
      setCustomHeight(nextH);
    };

    const handlePointerUp = () => {
      if (dragStartRef.current && !dragStartRef.current.moved) {
        cycleHeightMode();
      }
      dragStartRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized && !showHistoryPanel) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading, activeHeight, showHistoryPanel]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized && !showHistoryPanel) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, showHistoryPanel]);

  // Global keyboard shortcut: Ctrl+J or Cmd+J to toggle IVVAB
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleIvvab();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleIvvab]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const toSend = input.trim();
    setInput("");
    void sendMessage(toSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    void sendMessage(prompt);
  };

  const toggleHistory = () => {
    if (!showHistoryPanel) {
      void loadSavedHistory();
    }
    setShowHistoryPanel((prev) => !prev);
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Label: IVVAB) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.18 }}
            drag="y"
            dragMomentum={false}
            dragConstraints={{
              top: -Math.max(220, viewportHeight - 240),
              bottom: 12,
            }}
            whileDrag={{ scale: 1.06, cursor: "grabbing" }}
            className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3 sm:right-6 z-40 md:z-50 touch-none select-none"
          >
            <button
              onClick={toggleIvvab}
              aria-label="Open IVVAB AI Research Copilot (Ctrl+J)"
              title="Open IVVAB AI Research Copilot · Drag up or down to reposition"
              className="group flex items-center gap-2 px-3.5 py-2.5 sm:px-4.5 sm:py-3 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-display text-xs sm:text-sm font-bold tracking-wide shadow-xl shadow-primary/30 border border-white/20 active:scale-[0.96] transition-transform duration-150 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-primary animate-pulse" />
              </div>
              <span className="font-bold tracking-wider">IVVAB</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversational Research Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: `${activeHeight}px`,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-2 right-2 sm:left-auto sm:right-6 sm:w-[480px] z-50 bg-card/95 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl overscroll-contain transition-[height] duration-150 ease-out"
            style={{
              maxHeight: `calc(100dvh - 78px - 4.5rem - env(safe-area-inset-bottom, 0px))`,
            }}
          >
            {/* Top Resize / Grab Handle Bar */}
            <div
              onPointerDown={handlePointerDownResize}
              className="w-full flex flex-col items-center justify-center pt-2 pb-1 bg-card/90 border-b border-border/30 cursor-grab active:cursor-grabbing select-none touch-none group hover:bg-muted/40 transition-colors"
              title="Drag up or down to adjust height, or tap to cycle size"
            >
              <div className="w-12 h-1 rounded-full bg-border group-hover:bg-primary/60 transition-colors" />
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                <ChevronsUpDown className="w-2.5 h-2.5 text-primary" />
                <span>
                  {isMinimized
                    ? "Minimized · Tap to expand"
                    : `IVVAB Copilot (${customHeight ? `${customHeight}px` : heightMode}) · Tap or Drag`}
                </span>
              </div>
            </div>

            {/* Header: IVVAB AI Research Copilot */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border shrink-0 select-none">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-xs sm:text-sm tracking-tight text-foreground flex items-center gap-1.5 truncate">
                    IVVAB AI
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </h3>
                  <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground tracking-wider uppercase truncate">
                    Live Web & Threat Copilot
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                {/* New Chat Button */}
                <button
                  onClick={clearMessages}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  title="New research chat"
                  aria-label="New chat"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* History Drawer Toggle */}
                <button
                  onClick={toggleHistory}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    showHistoryPanel
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                  title="Saved Conversation History"
                  aria-label="Conversation history"
                >
                  <History className="w-3.5 h-3.5" />
                </button>

                {/* Size Cycle / Expand Button */}
                <button
                  onClick={cycleHeightMode}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  title={`Size: ${heightMode.toUpperCase()} (Tap to adjust)`}
                  aria-label="Adjust panel size"
                >
                  {heightMode === "expanded" ? (
                    <Minimize2 className="w-3.5 h-3.5 text-primary" />
                  ) : heightMode === "compact" ? (
                    <Maximize2 className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Minimize Toggle */}
                <button
                  onClick={toggleMinimize}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  title={isMinimized ? "Expand panel" : "Minimize panel"}
                  aria-label={isMinimized ? "Expand panel" : "Minimize panel"}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={closeIvvab}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  title="Close assistant"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Chat Body (Hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Sub-header with web search toggle & page context */}
                <div className="px-3 py-1 bg-muted/40 border-b border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground shrink-0 select-none">
                  <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                    {activeLearningContext ? (
                      <>
                        <Terminal className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate text-primary font-medium">
                          {activeLearningContext.taskTitle ||
                            activeLearningContext.labSlug ||
                            activeLearningContext.lessonTitle ||
                            "Learning Mode"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">Context: {window.location.pathname}</span>
                      </>
                    )}
                  </div>

                  {/* Web Search Live Toggle */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold transition-all cursor-pointer ${
                        webSearchEnabled
                          ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                      title={webSearchEnabled ? "Live Web Search Active" : "Direct Model Only"}
                    >
                      <Globe className="w-2.5 h-2.5" />
                      <span>{webSearchEnabled ? "Web ON" : "Web OFF"}</span>
                    </button>

                    {/* View preset pills */}
                    {(["compact", "standard", "expanded"] as HeightMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPresetMode(mode)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight transition-all cursor-pointer hidden xs:inline ${
                          heightMode === mode && customHeight === null
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                        }`}
                        title={`Switch to ${mode} height`}
                      >
                        {mode === "compact" ? "45%" : mode === "standard" ? "70%" : "Full"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation History Drawer (Slide-over view) */}
                {showHistoryPanel ? (
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background/95 custom-scrollbar">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-primary" />
                        Previous Research Sessions
                      </span>
                      {savedHistory.length > 0 && (
                        <button
                          onClick={() => void clearSavedHistory()}
                          className="text-[10px] text-destructive hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {isLoadingHistory ? (
                      <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Loading conversation history...</span>
                      </div>
                    ) : savedHistory.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="font-medium text-foreground">No saved conversations found</p>
                        <p className="text-[11px] mt-1 text-muted-foreground">
                          Sign in to sync your search and research chats across sessions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {savedHistory.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              loadHistoryConversation(item);
                              setShowHistoryPanel(false);
                            }}
                            className="p-2.5 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-muted/50 cursor-pointer transition-all text-left"
                          >
                            <p className="text-xs font-medium text-foreground line-clamp-1">
                              {item.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                              {item.reply.slice(0, 100)}...
                            </p>
                            <span className="text-[9px] font-mono text-muted-foreground/60 mt-1 block">
                              {new Date(item.created_at).toLocaleDateString()} ·{" "}
                              {new Date(item.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Messages Container */
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar overscroll-contain">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        onSelectPrompt={handlePromptClick}
                        onRegenerate={() => void regenerateLastMessage()}
                      />
                    ))}

                    {/* Adaptive Suggested Prompts */}
                    {messages.length <= 2 && (
                      <div className="pt-2 pb-1 space-y-1.5">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          Suggested Research Topics:
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {suggestedPrompts.map((prompt, index) => (
                            <button
                              key={index}
                              onClick={() => handlePromptClick(prompt)}
                              className="text-left w-full p-2.5 rounded-xl border border-border hover:border-primary/50 bg-background hover:bg-muted/50 text-xs font-medium text-foreground transition-all flex items-center justify-between group cursor-pointer active:scale-[0.99]"
                            >
                              <span>{prompt}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Search & Reasoning Progress Indicator */}
                    {isLoading && (
                      <div className="flex items-start gap-2.5 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-card border border-border text-xs text-muted-foreground flex flex-col gap-1 shadow-xs max-w-[85%]">
                          <div className="flex items-center gap-2">
                            {isSearchingWeb ? (
                              <Globe className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                            ) : (
                              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                            )}
                            <span className="font-medium text-foreground">
                              {searchProgressText || "IVVAB is researching..."}
                            </span>
                          </div>
                          {isSearchingWeb && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Inspecting authoritative sources & verifying threat telemetry...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Input Form with Stop Generation Control */}
                <div className="p-2.5 sm:p-3 border-t border-border bg-card/60 shrink-0">
                  <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        webSearchEnabled
                          ? "Search live web, CVE advisories, courses, or labs..."
                          : "Ask IVVAB directly..."
                      }
                      rows={1}
                      disabled={isLoading}
                      className="w-full resize-none min-h-[38px] sm:min-h-[42px] max-h-[80px] sm:max-h-[100px] p-2 sm:p-2.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                    />

                    {/* Action Button: Stop while loading, Send when idle */}
                    {isLoading ? (
                      <button
                        type="button"
                        onClick={stopGenerating}
                        aria-label="Stop generation"
                        className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center active:scale-[0.95] transition-all shadow-sm cursor-pointer shrink-0"
                        title="Stop generating"
                      >
                        <Square className="w-4 h-4 fill-current" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        aria-label="Send message"
                        className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center active:scale-[0.95] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm cursor-pointer shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </form>

                  <div className="flex items-center justify-between mt-1.5 px-0.5 text-[9px] sm:text-[10px] text-muted-foreground leading-none">
                    <span className="truncate flex items-center gap-1">
                      <Search className="w-2.5 h-2.5 text-primary" />
                      IVVAB AI · Live Research Copilot
                    </span>
                    <span className="font-mono text-primary/80 shrink-0 uppercase">
                      {customHeight ? `${customHeight}px` : heightMode}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
