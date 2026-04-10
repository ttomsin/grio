import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { ToolRenderers } from '../../lib/registry';

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

  // Find the index of the last board-related tool use in this message
  // so we only render the final plan state for this message
  let lastBoardToolIdx = -1;
  message.content.forEach((block: any, idx: number) => {
    if (block.type === 'tool_use' && (block.name === 'open_board' || block.name === 'update_board')) {
      lastBoardToolIdx = idx;
    }
  });

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
        if (block.type === 'text' && block.text.trim()) {
          return (
            <div key={idx} className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100 prose-p:text-zinc-900 dark:prose-p:text-zinc-100 prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-li:text-zinc-900 dark:prose-li:text-zinc-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
            </div>
          );
        }
        
        if (block.type === 'tool_use') {
          // Skip rendering older board states in the same message
          if ((block.name === 'open_board' || block.name === 'update_board') && idx !== lastBoardToolIdx) {
            return null;
          }

          // Use the decoupled registry to render tools dynamically
          const Renderer = ToolRenderers[block.name];
          if (Renderer) {
            return <Renderer key={idx} data={block.input} />;
          }
        }
        return null;
      })}
    </div>
  );
}
