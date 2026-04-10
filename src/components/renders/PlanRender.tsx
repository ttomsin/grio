import React, { useState } from 'react';
import { ListTodo, ChevronRight, ChevronDown, CheckCircle2, Circle } from 'lucide-react';

export function PlanRender({ data, isUpdate }: { data: any, isUpdate?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!data) return null;

  const task = data.task || "Executing Plan";
  const status = data.status || "In Progress";
  
  // For open_board
  const steps = data.steps || [];
  
  // For update_board
  const completed_steps = data.completed_steps || [];
  const current_step = data.current_step;

  return (
    <div className="my-3 text-[13px] text-muted-foreground font-mono">
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors select-none w-fit"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <ListTodo className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-medium">{isUpdate ? "Plan Update" : task}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 ml-2">
          {status}
        </span>
      </div>
      {isOpen && (
        <div className="ml-1.5 mt-2 pl-4 border-l-2 border-border/50 py-1 space-y-2">
          {isUpdate ? (
            <>
              {completed_steps.map((step: string, i: number) => (
                <div key={i} className="flex items-start gap-2 line-through opacity-70">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
              {current_step && (
                <div className="flex items-start gap-2 text-foreground font-medium">
                  <Circle className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0 animate-pulse" />
                  <span>{current_step}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {steps.map((step: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <Circle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
