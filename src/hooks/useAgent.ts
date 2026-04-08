import { useState } from 'react';
import { buildSystemPrompt } from '../lib/systemPrompt';
import { GRIO_TOOLS } from '../lib/tools';
import { useGriot } from './useGriot';
import { useBoard } from './useBoard';
import { callLLM } from '../lib/llm';

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
    } catch (error) {
      console.error("Agent error:", error);
    } finally {
      setIsLoading(false);
      setActiveToolCall(null);
    }
  };

  const runAgentLoop = async (currentMessages: Message[]) => {
    let loopMessages = [...currentMessages];
    
    while (true) {
      const content = await callLLM({
        provider,
        model,
        messages: loopMessages,
        tools: GRIO_TOOLS,
        system: buildSystemPrompt(activeSkills),
        apiKeys
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
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: typeof result === 'string' ? result : JSON.stringify(result)
        });
      }

      loopMessages.push({ role: 'user', content: toolResults });
      setMessages([...loopMessages]);
    }
  };

  const executeTool = async (name: string, input: any) => {
    switch (name) {
      case 'query_griot':
        return await queryGriot(input);
      case 'open_board':
        board.openBoard(input);
        return { success: true };
      case 'update_board':
        board.updateBoard(input);
        return { success: true };
      case 'manage_skills':
        setActiveSkillIds((prev: string[]) => {
          let next = [...prev];
          if (input.enable_skills) {
            input.enable_skills.forEach((s: string) => {
              if (!next.includes(s)) next.push(s);
            });
          }
          if (input.disable_skills) {
            next = next.filter(s => !input.disable_skills.includes(s) || s === 'records_explorer');
          }
          return next;
        });
        return { success: true };
      case 'render_chart':
      case 'render_thread':
      case 'render_comparison':
      case 'render_timeline':
      case 'render_lesson':
      case 'build_dataset':
        // These are UI rendering tools. We just acknowledge them so the agent knows it worked.
        return { success: true, rendered: true };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  };

  return { messages, sendMessage, isLoading, activeToolCall, board };
}
