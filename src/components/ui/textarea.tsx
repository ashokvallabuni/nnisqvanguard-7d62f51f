import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
 ({ className, ...props }, ref) => {
 return (
 <textarea
 className={cn(
 "flex min-h-[96px] w-full rounded-lg border border-nisq-border bg-nisq-white px-3 py-2 text-base text-nisq-ink shadow-card placeholder:text-nisq-ash focus-visible:outline-none focus-visible:border-nisq-blue focus-visible:ring-2 focus-visible:ring-nisq-blue-soft disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
 className,
 )}
 ref={ref}
 {...props}
 />
 );
 },
);
Textarea.displayName = "Textarea";

export { Textarea };
