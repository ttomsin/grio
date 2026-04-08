import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowUp } from 'lucide-react';

export function InputBar({ onSend, disabled, activeSkills }: any) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '60px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
      {activeSkills && activeSkills.length > 0 && (
        <div className="absolute -top-10 left-0 flex gap-2 flex-wrap">
          {activeSkills.filter((s: any) => s.id !== 'records_explorer').map((skill: any) => (
            <Badge key={skill.id} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground">
              <skill.icon className="w-3 h-3" />
              {skill.name}
            </Badge>
          ))}
        </div>
      )}
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask Grio..."
        disabled={disabled}
        className="min-h-[60px] bg-card border-border rounded-2xl pr-14 text-base py-4 scrollbar-hide"
        rows={1}
      />
      <Button 
        type="submit" 
        disabled={disabled || !text.trim()} 
        size="icon"
        className="absolute right-2 bottom-2 h-10 w-10 bg-muted hover:bg-muted/80 text-amber-500 rounded-full"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </form>
  );
}
