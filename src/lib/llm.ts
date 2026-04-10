import { GoogleGenAI } from '@google/genai';

export async function callLLM({ provider, model, messages, tools, system, apiKeys, onUpdate }: any) {
  if (provider === 'anthropic') {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKeys.anthropic,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: model || "claude-3-7-sonnet-20250219",
        max_tokens: 4096,
        system: system,
        tools: tools,
        messages: messages,
        stream: true
      })
    });
    
    if (!response.ok) throw new Error(`Anthropic Error: ${await response.text()}`);
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    const toolUses: any[] = [];
    let buffer = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'content_block_delta' && data.delta.type === 'text_delta') {
                fullText += data.delta.text;
                if (onUpdate) onUpdate(fullText);
              } else if (data.type === 'content_block_start' && data.content_block.type === 'tool_use') {
                toolUses.push({
                  id: data.content_block.id,
                  name: data.content_block.name,
                  inputStr: ''
                });
              } else if (data.type === 'content_block_delta' && data.delta.type === 'input_json_delta') {
                toolUses[toolUses.length - 1].inputStr += data.delta.partial_json;
              }
            } catch (e) {}
          }
        }
      }
    }
    
    const content = [];
    if (fullText) content.push({ type: 'text', text: fullText });
    for (const tu of toolUses) {
      try {
        content.push({
          type: 'tool_use',
          id: tu.id,
          name: tu.name,
          input: JSON.parse(tu.inputStr || '{}')
        });
      } catch (e: any) {
        console.error(`Failed to parse JSON for tool ${tu.name}:`, tu.inputStr);
        content.push({
          type: 'text',
          text: `\n\n[System Error: The AI attempted to use the tool '${tu.name}' but generated invalid or incomplete JSON parameters. This usually happens if the response was too long and got cut off.]`
        });
      }
    }
    return content;
  } 
  
  if (provider === 'openrouter') {
    const openAiMessages = [{ role: 'system', content: system }];
    
    for (const msg of messages) {
      if (msg.role === 'user') {
        if (typeof msg.content === 'string') {
          openAiMessages.push({ role: 'user', content: msg.content });
        } else {
          const toolResults = msg.content.filter((c: any) => c.type === 'tool_result');
          if (toolResults.length > 0) {
            for (const tr of toolResults) {
              openAiMessages.push({
                role: 'tool',
                tool_call_id: tr.tool_use_id,
                content: tr.content
              } as any);
            }
          } else {
            const texts = msg.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n');
            if (texts) openAiMessages.push({ role: 'user', content: texts });
          }
        }
      } else if (msg.role === 'assistant') {
        const toolUses = msg.content.filter((c: any) => c.type === 'tool_use');
        const texts = msg.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n');
        
        const openAiMsg: any = { role: 'assistant' };
        if (texts) openAiMsg.content = texts;
        if (toolUses.length > 0) {
          openAiMsg.tool_calls = toolUses.map((tu: any) => ({
            id: tu.id,
            type: 'function',
            function: {
              name: tu.name,
              arguments: JSON.stringify(tu.input)
            }
          }));
        }
        openAiMessages.push(openAiMsg);
      }
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKeys.openrouter}`
      },
      body: JSON.stringify({
        model: model || "anthropic/claude-3.5-sonnet",
        max_tokens: 4096,
        messages: openAiMessages,
        tools: tools.map((t: any) => ({
          type: "function",
          function: { name: t.name, description: t.description, parameters: t.input_schema }
        })),
        stream: true
      })
    });
    
    if (!response.ok) throw new Error(`OpenRouter Error: ${await response.text()}`);
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    const toolUses: any[] = [];
    let buffer = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              const delta = data.choices[0]?.delta;
              if (!delta) continue;
              
              if (delta.content) {
                fullText += delta.content;
                if (onUpdate) onUpdate(fullText);
              }
              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (tc.id) {
                    toolUses.push({
                      id: tc.id,
                      name: tc.function.name,
                      inputStr: tc.function.arguments || ''
                    });
                  } else if (tc.function?.arguments) {
                    toolUses[toolUses.length - 1].inputStr += tc.function.arguments;
                  }
                }
              }
            } catch (e) {}
          }
        }
      }
    }
    
    const content = [];
    if (fullText) content.push({ type: 'text', text: fullText });
    for (const tu of toolUses) {
      try {
        content.push({
          type: 'tool_use',
          id: tu.id,
          name: tu.name,
          input: JSON.parse(tu.inputStr || '{}')
        });
      } catch (e: any) {
        console.error(`Failed to parse JSON for tool ${tu.name}:`, tu.inputStr);
        content.push({
          type: 'text',
          text: `\n\n[System Error: The AI attempted to use the tool '${tu.name}' but generated invalid or incomplete JSON parameters. This usually happens if the response was too long and got cut off.]`
        });
      }
    }
    return content;
  }

  if (provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const geminiTools = [{ functionDeclarations: tools.map((t: any) => ({ name: t.name, description: t.description, parameters: t.input_schema })) }];
    
    const contents = [];
    const toolIdToName: Record<string, string> = {};
    
    for (const msg of messages) {
      if (msg.role === 'user') {
        if (typeof msg.content === 'string') {
          contents.push({ role: 'user', parts: [{ text: msg.content }] });
        } else {
          const toolResults = msg.content.filter((c: any) => c.type === 'tool_result');
          if (toolResults.length > 0) {
            contents.push({
              role: 'user',
              parts: toolResults.map((tr: any) => ({
                functionResponse: {
                  name: toolIdToName[tr.tool_use_id] || 'unknown_tool',
                  response: typeof tr.content === 'string' ? JSON.parse(tr.content) : tr.content
                }
              }))
            });
          } else {
             const texts = msg.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n');
             if (texts) contents.push({ role: 'user', parts: [{ text: texts }] });
          }
        }
      } else if (msg.role === 'assistant') {
        const parts = [];
        const texts = msg.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n');
        if (texts) parts.push({ text: texts });
        
        const toolUses = msg.content.filter((c: any) => c.type === 'tool_use');
        for (const tu of toolUses) {
          toolIdToName[tu.id] = tu.name;
          parts.push({
            functionCall: {
              name: tu.name,
              args: tu.input
            }
          });
        }
        contents.push({ role: 'model', parts });
      }
    }

    const responseStream = await ai.models.generateContentStream({
      model: model || 'gemini-2.5-pro',
      contents: contents,
      config: {
        systemInstruction: system,
        tools: geminiTools,
        temperature: 0.2
      }
    });

    let fullText = '';
    const toolUses: any[] = [];

    for await (const chunk of responseStream) {
      // Safely extract text without calling the .text getter which might throw on function calls
      const textPart = chunk.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
      if (textPart && textPart.text) {
        fullText += textPart.text;
        if (onUpdate) onUpdate(fullText);
      }
      
      if (chunk.functionCalls && chunk.functionCalls.length > 0) {
        for (const fc of chunk.functionCalls) {
          toolUses.push({
            id: `call_${Math.random().toString(36).substr(2, 9)}`,
            name: fc.name,
            input: fc.args
          });
        }
      }
    }

    const content = [];
    if (fullText) content.push({ type: 'text', text: fullText });
    for (const tu of toolUses) {
      content.push({
        type: 'tool_use',
        id: tu.id,
        name: tu.name,
        input: tu.input
      });
    }
    return content;
  }
}
