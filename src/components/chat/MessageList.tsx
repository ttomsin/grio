import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';

function getToolStatusText(tool: string) {
  switch(tool) {
    case 'query_griot': return 'Searching records...';
    case 'build_dataset': return 'Creating dataset...';
    case 'render_chart': return 'Generating chart...';
    case 'render_thread': return 'Formatting thread...';
    case 'render_comparison': return 'Analyzing comparison...';
    case 'render_timeline': return 'Building timeline...';
    case 'render_lesson': return 'Preparing lesson...';
    case 'manage_skills': return 'Adjusting skills...';
    case 'open_board': return 'Updating board...';
    case 'update_board': return 'Updating board...';
    default: return 'Working...';
  }
}

export function MessageList({ messages, activeToolCall, isLoading }: any) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeToolCall, isLoading]);

  return (
    <div className="max-w-3xl mx-auto py-6">
      {messages.map((msg: any, idx: number) => (
        <MessageBubble 
          key={idx} 
          message={msg} 
          isLast={idx === messages.length - 1}
          activeToolCall={activeToolCall}
        />
      ))}
      
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 mb-8">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          {activeToolCall ? getToolStatusText(activeToolCall) : "Thinking..."}
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
