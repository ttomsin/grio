import { useState } from 'react';
import { buildSystemPrompt } from '../lib/systemPrompt';
import { GRIO_TOOLS } from '../lib/tools';
import { useGriot } from './useGriot';
import { useBoard } from './useBoard';
import { callLLM } from '../lib/llm';
import { ToolExecutors } from '../lib/registry';
import { runOllamaPipeline } from '../lib/ollamaPipeline';

export type Message = {
  role: 'user' | 'assistant';
  content: any[];
};

export function useAgent(activeSkills: any[], provider: string, model: string, apiKeys: any, setActiveSkillIds: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolCall, setActiveToolCall] = useState<string | null>(null);
  
  const { queryGriot } = useGriot();
  const board = useBoard();

  const sendMessage = async (text: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: [{ type: 'text', text }] }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      await runAgentLoop(newMessages);
    } catch (error: any) {
      console.error("Agent error:", error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: [{ type: 'text', text: `Sorry, I encountered an error: ${error.message}` }] }
      ]);
    } finally {
      setIsLoading(false);
      setActiveToolCall(null);
    }
  };

  const runAgentLoop = async (currentMessages: Message[]) => {
    if (provider === 'ollama') {
      const content = await runOllamaPipeline({
        apiKeys,
        model,
        queryGriot,
        messages: currentMessages,
        onUpdate: (text: string) => {
          setMessages((prev) => {
            const next = [...prev];
            if (next.length === currentMessages.length) {
              next.push({ role: 'assistant', content: [{ type: 'text', text }] });
            } else {
              next[next.length - 1] = { role: 'assistant', content: [{ type: 'text', text }] };
            }
            return next;
          });
        },
        onToolUpdate: (toolName: string) => {
          setActiveToolCall(`Running ${toolName}...`);
        }
      });

      // Add the final content blocks (text + potential viz tool)
      setMessages((prev) => {
        const next = [...prev];
        if (next.length === currentMessages.length) {
          next.push({ role: 'assistant', content });
        } else {
          next[next.length - 1] = { role: 'assistant', content };
        }
        return next;
      });

      // If there are tool uses (viz), we need to execute them to render the UI
      const toolUses = content.filter((c: any) => c.type === 'tool_use');
      if (toolUses.length > 0) {
        const toolResults = [];
        for (const toolUse of toolUses) {
          setActiveToolCall(toolUse.name);
          let result;
          try {
            result = await executeTool(toolUse.name, toolUse.input);
          } catch (e: any) {
            result = { error: e.message };
          }
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: typeof result === 'string' ? result : JSON.stringify(result)
          });
        }
        setMessages((prev) => [...prev, { role: 'user', content: toolResults }]);
      }
      return;
    }

    let loopMessages = [...currentMessages];
    
    while (true) {
      let streamingMessageIndex = loopMessages.length;
      
      // Keep only the last 30 messages to prevent context window overflow over long conversations
      let messagesToSend = loopMessages;
      if (messagesToSend.length > 30) {
        messagesToSend = messagesToSend.slice(messagesToSend.length - 30);
      }
      
      const content = await callLLM({
        provider,
        model,
        messages: messagesToSend,
        tools: GRIO_TOOLS,
        system: buildSystemPrompt(activeSkills),
        apiKeys,
        onUpdate: (text: string) => {
          setMessages((prev) => {
            const next = [...prev];
            next[streamingMessageIndex] = {
              role: 'assistant',
              content: [{ type: 'text', text }]
            };
            return next;
          });
        }
      });

      loopMessages.push({ role: 'assistant', content: content });
      setMessages([...loopMessages]);

      const toolUses = content.filter((c: any) => c.type === 'tool_use');
      
      if (toolUses.length === 0) {
        break; // No more tools, we are done
      }

      const toolResults = [];
      for (const toolUse of toolUses) {
        setActiveToolCall(toolUse.name);
        let result;
        try {
          result = await executeTool(toolUse.name, toolUse.input);
        } catch (e: any) {
          result = { error: e.message };
        }
        
        let resultStr = typeof result === 'string' ? result : JSON.stringify(result);
        
        // Truncate massive tool results to prevent token limit errors
        if (resultStr.length > 40000) {
          resultStr = resultStr.substring(0, 40000) + '\n\n...[TRUNCATED DUE TO LENGTH. IF YOU NEED MORE DATA, REFINE YOUR SEARCH QUERY OR PAGINATE]';
        }
        
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: resultStr
        });
      }

      loopMessages.push({ role: 'user', content: toolResults });
      setMessages([...loopMessages]);
    }
  };

  const executeTool = async (name: string, input: any) => {
    const executor = ToolExecutors[name];
    if (executor) {
      return await executor(input, { queryGriot, board, setActiveSkillIds });
    }
    throw new Error(`Unknown tool: ${name}`);
  };

  return { messages, sendMessage, isLoading, activeToolCall, board };
}
