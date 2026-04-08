import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { InputBar } from '../chat/InputBar';
import { MessageList } from '../chat/MessageList';

const SUGGESTED_PROMPTS = [
  "What is Nigeria talking about this week?",
  "Teach me Naija Pidgin from scratch",
  "Build me a dataset on fuel subsidy coverage",
  "Compare how Vanguard and Sahara Reporters cover the same stories",
  "What do Nigerians think about MTN?",
  "Show me the pattern on inflation discourse over 2024"
];

export function ChatArea({ messages, sendMessage, isLoading, activeToolCall, activeSkills }: any) {
  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 mt-32">
            <div className="text-center">
              <h1 className="text-3xl font-medium text-foreground">Grio</h1>
              <p className="text-muted-foreground mt-1">Nigeria's public discourse, made intelligible.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-4 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:border-amber-500/50 hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} activeToolCall={activeToolCall} isLoading={isLoading} />
        )}
      </ScrollArea>
      
      <div className="p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <InputBar onSend={sendMessage} disabled={isLoading} activeSkills={activeSkills} />
        </div>
      </div>
    </div>
  );
}
