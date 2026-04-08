import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';
import { ChartRender } from '../renders/ChartRender';
import { ThreadRender } from '../renders/ThreadRender';
import { ComparisonRender } from '../renders/ComparisonRender';
import { TimelineRender } from '../renders/TimelineRender';
import { LessonRender } from '../renders/LessonRender';
import { DatasetRender } from '../renders/DatasetRender';

export function MessageBubble({ message, isLast, activeToolCall }: any) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    // User messages just have text content
    const text = typeof message.content === 'string' 
      ? message.content 
      : message.content.find((c: any) => c.type === 'text')?.text;
    
    if (!text) return null; // Hide tool result messages from user

    return (
      <div className="group flex justify-end mb-6 gap-2 items-center">
        <button 
          onClick={() => handleCopy(text)} 
          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-foreground transition-opacity rounded-md hover:bg-muted"
          title="Copy message"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <div className="max-w-[80%] bg-muted text-foreground px-4 py-3 rounded-2xl text-[15px] leading-relaxed">
          {text}
        </div>
      </div>
    );
  }

  // Extract all text content for the assistant copy button
  const assistantText = message.content
    .filter((c: any) => c.type === 'text')
    .map((c: any) => c.text)
    .join('\n\n');

  // Assistant messages can have text and tool uses
  return (
    <div className="group relative flex flex-col gap-4 mb-8">
      {assistantText && (
        <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => handleCopy(assistantText)} 
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
            title="Copy response"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
      
      {message.content.map((block: any, idx: number) => {
        if (block.type === 'text') {
          return (
            <div key={idx} className="prose prose-zinc dark:prose-invert max-w-none text-[15px] leading-relaxed">
              <ReactMarkdown>{block.text}</ReactMarkdown>
            </div>
          );
        }
        
        if (block.type === 'tool_use') {
          // Render specific tools inline
          switch (block.name) {
            case 'render_chart':
              return <ChartRender key={idx} data={block.input} />;
            case 'render_thread':
              return <ThreadRender key={idx} data={block.input} />;
            case 'render_comparison':
              return <ComparisonRender key={idx} data={block.input} />;
            case 'render_timeline':
              return <TimelineRender key={idx} data={block.input} />;
            case 'render_lesson':
              return <LessonRender key={idx} data={block.input} />;
            case 'build_dataset':
              return <DatasetRender key={idx} data={block.input} />;
            default:
              return null; // Other tools are background or board updates
          }
        }
        return null;
      })}
    </div>
  );
}
