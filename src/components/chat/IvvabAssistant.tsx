import React, { useState, useRef, useEffect } from "react";
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

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

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
      {/* Floating Chat Launcher Button (Label: IVVAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleIvvab}
          aria-label="Open IVVAB AI Assistant (Ctrl+J)"
          className={`group flex items-center gap-2.5 px-4.5 py-3 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-display text-sm font-bold tracking-wide shadow-xl shadow-primary/25 border border-white/20 active:scale-[0.96] transition-all duration-200 cursor-pointer select-none ${
            isOpen ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-primary animate-pulse" />
          </div>
          <span className="font-bold tracking-wider">IVVAB</span>
        </button>
      </div>

      {/* Conversational Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "64px" : "620px",
            }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`fixed bottom-22 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 backdrop-blur-md`}
            style={{
              maxHeight: "calc(100vh - 110px)",
            }}
          >
            {/* Header: IVVAB AI */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                    IVVAB AI
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
                    IVVAB AI Assistant · Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearMessages}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={toggleMinimize}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  title={isMinimized ? "Expand panel" : "Minimize panel"}
                  aria-label={isMinimized ? "Expand panel" : "Minimize panel"}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={closeIvvab}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
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
                {/* Active Context Banner */}
                {activeLearningContext ? (
                  <div className="px-4 py-1.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-[11px] font-mono text-primary shrink-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <Terminal className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate font-medium">
                        {activeLearningContext.taskTitle
                          ? `Task: ${activeLearningContext.taskTitle}`
                          : activeLearningContext.labSlug
                          ? `Lab: ${activeLearningContext.labSlug}`
                          : activeLearningContext.lessonTitle || "Learning Mode"}
                      </span>
                    </div>
                    <button
                      onClick={() => setLearningContext(null)}
                      className="text-[10px] text-primary/80 hover:text-primary underline ml-2 shrink-0 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-1.5 bg-muted/30 border-b border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <Compass className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">Context: {window.location.pathname}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/80 shrink-0 font-sans">
                      Press Ctrl+J
                    </span>
                  </div>
                )}

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onSelectPrompt={handlePromptClick}
                    />
                  ))}

                  {/* Adaptive Suggested Prompts (Shown below initial message or when few messages) */}
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
                <div className="p-3 border-t border-border bg-card/50 shrink-0">
                  <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask IVVAB about cybersecurity, labs, courses..."
                      rows={1}
                      disabled={isLoading}
                      className="w-full resize-none min-h-[42px] max-h-[100px] p-2.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      aria-label="Send message"
                      className="min-h-[42px] min-w-[42px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center active:scale-[0.95] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-[10px] text-muted-foreground text-center mt-2 leading-none">
                    IVVAB provides AI security guidance. Always test inside IVVAB LABS.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
