import { cn } from "@/lib/utils";

export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn("space-x-1 animate-pulse", className)}>
      <span className="inline-flex animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="inline-flex animate-bounce [animation-delay:-0.2s]">.</span>
      <span className="inline-flex animate-bounce [animation-delay:-0.1s]">.</span>
    </span>
  );
} 