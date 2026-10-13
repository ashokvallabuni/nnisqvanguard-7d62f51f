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
  GripHorizontal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useIvvabChat, type IvvabMessage } from "@/lib/ivvab-chat";

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
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Copied</span>
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

function MessageBubble({
  message,
  onSelectPrompt,
}: {
  message: IvvabMessage;
  onSelectPrompt: (prompt: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-4`}>
      <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
        {!isUser && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-xs shadow-sm"
              : "bg-card border border-border text-card-foreground rounded-tl-xs shadow-xs"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
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
          )}
        </div>
      </div>

      {/* Verified Course Citations */}
      {!isUser && message.citations && message.citations.length > 0 && (
        <div className="mt-2 ml-9 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
            <BookOpen className="w-3 h-3 text-primary" /> Verified Curriculum:
          </span>
          {message.citations.slice(0, 3).map((cit, cIdx) => (
            <a
              key={cIdx}
              href={cit.route}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors font-medium"
            >
              <span>{cit.courseTitle || cit.title}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ))}
        </div>
      )}

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
    suggestedPrompts,
    activeLearningContext,
    setLearningContext,
    openIvvab,
    closeIvvab,
    toggleIvvab,
    toggleMinimize,
    sendMessage,
    clearMessages,
  } = useIvvabChat();

  type HeightMode = "compact" | "standard" | "expanded";

  const [input, setInput] = useState("");
  const [heightMode, setHeightMode] = useState<HeightMode>("standard");
  const [customHeight, setCustomHeight] = useState<number | null>(null);

  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 800
  );
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
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

  // Safe vertical bounds on mobile:
  // TopNav is 72px tall -> top buffer of 78px
  // BottomNav is ~64px tall -> bottom buffer of 72px (4.5rem + safe-area)
  // Max available height between top nav and bottom nav:
  const maxAvailableHeight = Math.max(260, viewportHeight - 156);

  // Height presets for mobile vs desktop
  const presetHeights = useMemo(() => {
    if (isMobile) {
      return {
        compact: Math.max(260, Math.min(340, Math.round(maxAvailableHeight * 0.46))),
        standard: Math.max(340, Math.min(520, Math.round(maxAvailableHeight * 0.72))),
        expanded: maxAvailableHeight,
      };
    }
    return {
      compact: 460,
      standard: 620,
      expanded: Math.min(820, Math.max(500, viewportHeight - 120)),
    };
  }, [isMobile, maxAvailableHeight, viewportHeight]);

  const activeHeight = useMemo(() => {
    if (isMinimized) return 56;
    if (customHeight !== null) {
      return Math.max(240, Math.min(maxAvailableHeight, customHeight));
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
      // In bottom-anchored modal, dragging UP (smaller clientY) increases height
      const deltaY = dragStartRef.current.startY - moveEvent.clientY;
      if (Math.abs(deltaY) > 5) {
        dragStartRef.current.moved = true;
      }
      const nextH = Math.max(240, Math.min(maxAvailableHeight, dragStartRef.current.startH + deltaY));
      setCustomHeight(nextH);
    };

    const handlePointerUp = () => {
      if (dragStartRef.current && !dragStartRef.current.moved) {
        // Tapped without dragging: cycle preset
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
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading, activeHeight]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

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

  return (
    <>
      {/* Floating Chat Launcher Button (Label: IVVAB)
          Positioned safely above BottomNav (bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] on mobile)
          Draggable vertically so user can move it out of the way when reading/scrolling content */}
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
              aria-label="Open IVVAB AI Assistant (Ctrl+J) · Drag to reposition"
              title="Open IVVAB AI Assistant · Drag up or down to reposition"
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

      {/* Conversational Chat Panel
          Bounded safely between TopNav (top-[78px]) and BottomNav (bottom-[calc(4.25rem+safe-area)])
          Adjustable via top drag handle or 1-tap size pills (Compact 45% | Standard 72% | Full) */}
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
            className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-2 right-2 sm:left-auto sm:right-6 sm:w-[440px] z-50 bg-card/95 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl overscroll-contain transition-[height] duration-150 ease-out"
            style={{
              maxHeight: `calc(100dvh - 78px - 4.5rem - env(safe-area-inset-bottom, 0px))`,
            }}
          >
            {/* Top Resize / Grab Handle Bar (Mobile-first adjustable control) */}
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
                    : `Adjustable (${customHeight ? `${customHeight}px` : heightMode}) · Tap or Drag`}
                </span>
              </div>
            </div>

            {/* Header: IVVAB AI */}
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
                    Security Assistant · Online
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-0.5 sm:gap-1">
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

                {/* Clear Conversation */}
                <button
                  onClick={clearMessages}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
                {/* Sub-header with context and 1-tap size pills */}
                <div className="px-3 py-1 bg-muted/40 border-b border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground shrink-0 select-none">
                  <div className="flex items-center gap-1.5 truncate max-w-[55%]">
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

                  {/* 1-Tap Quick Size Selector Pills */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 hidden xs:inline">
                      View:
                    </span>
                    {(["compact", "standard", "expanded"] as HeightMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPresetMode(mode)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight transition-all cursor-pointer ${
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

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 custom-scrollbar overscroll-contain">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onSelectPrompt={handlePromptClick}
                    />
                  ))}

                  {/* Adaptive Suggested Prompts */}
                  {messages.length <= 2 && (
                    <div className="pt-2 pb-1 space-y-1.5">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Suggested for this page:
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

                  {isLoading && (
                    <div className="flex items-start gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-card border border-border text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                        <span>IVVAB is reasoning...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <div className="p-2.5 sm:p-3 border-t border-border bg-card/60 shrink-0">
                  <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask IVVAB about cybersecurity, labs, courses..."
                      rows={1}
                      disabled={isLoading}
                      className="w-full resize-none min-h-[38px] sm:min-h-[42px] max-h-[80px] sm:max-h-[100px] p-2 sm:p-2.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      aria-label="Send message"
                      className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center active:scale-[0.95] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <div className="flex items-center justify-between mt-1.5 px-0.5 text-[9px] sm:text-[10px] text-muted-foreground leading-none">
                    <span className="truncate">IVVAB AI Security Assistant</span>
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
