import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

// Initialize mermaid with NISQ Vanguard styling
mermaid.initialize({
 startOnLoad: false,
 theme: 'base',
 themeVariables: {
 fontFamily: 'Inter, sans-serif',
 primaryColor: '#0052cc', // NISQ Blue
 primaryTextColor: '#ffffff',
 primaryBorderColor: '#0052cc',
 lineColor: '#3b82f6',
 secondaryColor: '#1e293b',
 tertiaryColor: '#0f172a',
 },
 securityLevel: 'loose',
});

const MermaidChart = ({ chart }: { chart: string }) => {
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (ref.current && chart) {
 const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
 try {
 mermaid.render(id, chart).then(({ svg }) => {
 if (ref.current) {
 ref.current.innerHTML = svg;
 }
 });
 } catch (error) {
 console.error("Mermaid parsing failed", error);
 if (ref.current) {
 ref.current.innerHTML = `<div class="text-destructive text-sm p-4 border border-destructive/20 rounded bg-destructive/10">Diagram syntax error</div>`;
 }
 }
 }
 }, [chart]);

 return (
 <div className="my-8">
 <div 
 ref={ref} 
 className="mermaid-diagram flex justify-center bg-card/50 p-6 rounded-xl border border-border/60 overflow-x-auto shadow-sm" 
 />
 <div className="text-center mt-2 text-xs text-muted-foreground">Interactive Security Architecture Diagram</div>
 </div>
 );
};

export const MarkdownRenderer = ({ content }: { content: string }) => {
 return (
 <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/90 prose-invert prose-headings:font-display prose-h2:text-2xl prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-2 prose-h3:text-xl">
 <ReactMarkdown
 remarkPlugins={[remarkGfm]}
 components={{
 code(props) {
 const {children, className, node, ...rest} = props;
 const match = /language-(\w+)/.exec(className || '');
 if (match && match[1] === 'mermaid') {
 return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
 }
 return (
 <code 
 {...rest} 
 className={`${className} bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm text-primary`}
 >
 {children}
 </code>
 );
 },
 // Custom styling for blockquotes (Defensive thinking, callouts)
 blockquote(props) {
 return (
 <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-3 pr-4 rounded-r-lg my-6 not-prose">
 <div className="text-foreground/90 italic font-medium">{props.children}</div>
 </blockquote>
 );
 },
 // Custom styling for tables
 table(props) {
 return (
 <div className="overflow-x-auto my-6 border border-border rounded-lg">
 <table className="w-full text-left text-sm" {...props} />
 </div>
 );
 },
 th(props) {
 return <th className="bg-muted px-4 py-3 font-semibold text-foreground" {...props} />;
 },
 td(props) {
 return <td className="px-4 py-3 border-t border-border/50 text-foreground/80" {...props} />;
 },
 }}
 >
 {content}
 </ReactMarkdown>
 </div>
 );
};
