import React, { useState } from 'react';
import { Brain, ChevronRight, ChevronDown } from 'lucide-react';

export function ThinkRender({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!data || !data.thought) return null;

  return (
    <div className="my-3 text-[13px] text-muted-foreground font-mono">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors select-none w-fit"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <Brain className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-medium">Thought Process</span>
      </div>
      {isOpen && (
        <div className="ml-1.5 mt-2 pl-4 border-l-2 border-border/50 py-1 space-y-2">
          {data.thought.split('\n').map((line: string, i: number) => (
            <p key={i} className="leading-relaxed">{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
