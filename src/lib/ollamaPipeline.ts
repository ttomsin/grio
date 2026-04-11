import { Message } from '../hooks/useAgent';

interface PipelineContext {
  apiKeys: any;
  model: string;
  queryGriot: (params: any) => Promise<any>;
  onUpdate: (text: string) => void;
  onToolUpdate: (toolName: string) => void;
  messages: Message[];
}

const parseJsonSafe = (text: string) => {
  try {
    // Try to find a JSON block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    // Fallback to stripping fences and parsing
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    // If it still fails, try to find the first { and last }
    try {
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
    } catch (e2) {}
    return null;
  }
};

const callOllama = async (systemPrompt: string, userMessage: string, temperature: number, apiKeys: any, model: string, stream: boolean = false, onUpdate?: (text: string) => void) => {
  const baseUrl = apiKeys.ollamaUrl?.replace(/\/$/, '') || 'http://localhost:11434';
  
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model || "gemma3:4b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature,
      stream
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama Error: ${await response.text()}`);
  }

  if (stream) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
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
              if (delta?.content) {
                fullText += delta.content;
                if (onUpdate) onUpdate(fullText);
              }
            } catch (e) {}
          }
        }
      }
    }
    return fullText;
  } else {
    const data = await response.json();
    return data.choices[0].message.content;
  }
};

export const runOllamaPipeline = async (ctx: PipelineContext) => {
  const { messages, apiKeys, model, queryGriot, onUpdate, onToolUpdate } = ctx;
  
  // Get the last user message
  const lastUserMsg = messages[messages.length - 1];
  const userText = lastUserMsg.content.filter(c => c.type === 'text').map(c => c.text).join('\n');

  // 1. Router Agent
  onToolUpdate('Router Agent');
  const routerPrompt = `You are the Router Agent for Grio, a Nigerian public intelligence assistant.
Your only job is to classify the user's message and output a JSON routing decision.

Classify into one of these intents:
- "search" — user wants information from Griot records
- "trend" — user wants patterns over time
- "risk" — user wants risk or safety related information
- "clarify" — message is too vague to search, ask one clarifying question
- "off_topic" — message has nothing to do with Nigerian public discourse

Respond ONLY with valid JSON. No explanation. No preamble.

Format:
{
  "intent": "search" | "trend" | "risk" | "clarify" | "off_topic",
  "search_type": "semantic" | "structured" | "hybrid",
  "reasoning": "one sentence explanation"
}`;

  let routerResponse = await callOllama(routerPrompt, userText, 0.1, apiKeys, model);
  let routerJson = parseJsonSafe(routerResponse);
  
  if (!routerJson) {
    // Retry once
    routerResponse = await callOllama(routerPrompt, userText, 0.1, apiKeys, model);
    routerJson = parseJsonSafe(routerResponse) || { intent: "search", search_type: "semantic", reasoning: "Fallback to search due to parse error" };
  }

  let insightsJson = null;
  let vizJson = null;
  let records = [];

  if (["search", "trend", "risk"].includes(routerJson.intent)) {
    // 2. Search Agent
    onToolUpdate('Search Agent');
    const searchPrompt = `You are the Search Agent for Grio.
You receive a user message and produce a Griot search query as JSON.

Griot supports these query parameters:
- q: string (keyword or semantic query)
- source: one of [saharareporters, vanguard, nairaland, nairametrics, healthwatch, nigeriapropertycentre]
- tags: array of strings
- category: string
- severity: low | medium | high | critical
- risk_min: number (0-100)
- limit: number (default 10, max 30)
- search_type: "semantic" | "fulltext"

Rules:
- Always set search_type based on the nature of the query
- Use semantic for vague, emotional, or conceptual queries
- Use fulltext for specific names, places, or exact topics
- Never include parameters you are not confident about
- Prefer broader queries over narrow ones

Respond ONLY with valid JSON. No explanation. No preamble.`;

    let searchResponse = await callOllama(searchPrompt, userText, 0.1, apiKeys, model);
    let searchJson = parseJsonSafe(searchResponse);
    
    if (!searchJson) {
      searchResponse = await callOllama(searchPrompt, userText, 0.1, apiKeys, model);
      searchJson = parseJsonSafe(searchResponse) || { q: userText, search_type: "semantic" };
    }

    // 3. Griot API
    onToolUpdate('Griot API');
    try {
      const result = await queryGriot(searchJson);
      records = result.records || result.data || result;
      if (!Array.isArray(records)) records = [];
    } catch (e) {
      console.error("Griot API Error:", e);
      records = [];
    }

    // 4. Analyst Agent
    onToolUpdate('Analyst Agent');
    const analystPrompt = `You are the Analyst Agent for Grio, a Nigerian public intelligence assistant.
You receive a list of records from Griot and a user question.
Your job is to extract meaningful patterns, trends, and insights from the records.

Rules:
- Only make claims supported by the records given to you
- Never hallucinate facts not present in the records
- Identify patterns across records (recurring locations, rising risk, sentiment shifts)
- Note which sources the insight comes from
- If records are insufficient to answer, say so clearly
- Be specific to Nigeria — name states, cities, institutions where relevant

Output a JSON object:
{
  "insights": ["insight 1", "insight 2", ...],
  "key_locations": ["Lagos", "Abuja", ...],
  "dominant_sentiment": "positive" | "negative" | "neutral" | "mixed",
  "risk_summary": "one sentence on overall risk level",
  "record_count": number,
  "sources_used": ["vanguard", ...]
}

Respond ONLY with valid JSON. No explanation. No preamble.`;

    // Truncate records to avoid context limits
    const recordsStr = JSON.stringify(records).substring(0, 20000);
    const analystInput = `User Question: ${userText}\n\nRecords:\n${recordsStr}`;
    
    let analystResponse = await callOllama(analystPrompt, analystInput, 0.1, apiKeys, model);
    insightsJson = parseJsonSafe(analystResponse);
    
    if (!insightsJson) {
      analystResponse = await callOllama(analystPrompt, analystInput, 0.1, apiKeys, model);
      insightsJson = parseJsonSafe(analystResponse) || { error: "Failed to parse insights" };
    }

    // 5. Viz Agent
    onToolUpdate('Viz Agent');
    const vizPrompt = `You are the Visualization Agent for Grio.
You receive analyst insights and decide if a chart or table would help the user understand the data better.

Supported visualization types:
- "bar_chart" — comparing values across categories
- "line_chart" — trends over time
- "risk_feed" — list of records sorted by risk score with badges
- "table" — structured comparison of records
- "none" — no visualization needed

Rules:
- Only suggest a visualization if it genuinely adds value
- For trend questions always suggest line_chart
- For risk questions always suggest risk_feed
- For comparisons suggest bar_chart or table
- For simple factual answers use none

Output JSON:
{
  "type": "bar_chart" | "line_chart" | "risk_feed" | "table" | "none",
  "title": "chart title",
  "data": [...],  // shaped for the chosen type
  "x_key": "field name for x axis if chart",
  "y_key": "field name for y axis if chart"
}

For risk_feed data shape: [{ title, source, risk_score, severity, url }]
For table data shape: [{ column: value }]
For bar/line data shape: [{ label, value }]

Respond ONLY with valid JSON. No explanation. No preamble.`;

    let vizResponse = await callOllama(vizPrompt, JSON.stringify(insightsJson), 0.1, apiKeys, model);
    vizJson = parseJsonSafe(vizResponse);
    
    if (!vizJson) {
      vizResponse = await callOllama(vizPrompt, JSON.stringify(insightsJson), 0.1, apiKeys, model);
      vizJson = parseJsonSafe(vizResponse) || { type: "none" };
    }
  }

  // 6. Response Agent
  onToolUpdate('Response Agent');
  const responsePrompt = `You are the Response Agent for Grio, a Nigerian public intelligence assistant.
You receive analyst insights and a visualization spec and write the final response to the user.

Rules:
- Write in clear, confident prose
- Be direct — lead with the most important finding
- Reference specific locations, sources, and data points from the insights
- Do not repeat what a chart already shows — reference it instead ("as shown above")
- Keep responses between 3-6 sentences unless the question demands more
- Never say "based on the data provided to me" — just speak naturally
- If risk is high, communicate urgency clearly
- Write for a Nigerian audience — local context matters
- Never hallucinate. If insights are thin, be honest about it.`;

  let responseInput = `User Question: ${userText}\n\n`;
  if (insightsJson) {
    responseInput += `Analyst Insights:\n${JSON.stringify(insightsJson, null, 2)}\n\n`;
  } else {
    responseInput += `Router Reasoning: ${routerJson.reasoning}\n\n`;
  }
  
  if (vizJson && vizJson.type !== 'none') {
    responseInput += `Visualization Planned: ${vizJson.type} titled "${vizJson.title}"\n`;
  }

  const finalProse = await callOllama(responsePrompt, responseInput, 0.4, apiKeys, model, true, onUpdate);

  // Return the content blocks to be added to the message
  const contentBlocks: any[] = [];
  if (finalProse) {
    contentBlocks.push({ type: 'text', text: finalProse });
  }

  // If there's a visualization, we can inject a tool use and tool result to render it using the existing UI components
  if (vizJson && vizJson.type !== 'none') {
    let toolName = '';
    let toolInput = {};

    if (vizJson.type === 'bar_chart' || vizJson.type === 'line_chart') {
      toolName = 'render_chart';
      toolInput = {
        chart_type: vizJson.type === 'bar_chart' ? 'bar' : 'line',
        title: vizJson.title,
        data: {
          labels: vizJson.data.map((d: any) => d.label || d[vizJson.x_key]),
          datasets: [{
            label: vizJson.y_key || 'Value',
            data: vizJson.data.map((d: any) => d.value || d[vizJson.y_key])
          }]
        }
      };
    } else if (vizJson.type === 'table') {
      toolName = 'render_table';
      if (vizJson.data && vizJson.data.length > 0) {
        const columns = Object.keys(vizJson.data[0]);
        const rows = vizJson.data.map((row: any) => columns.map(col => String(row[col])));
        toolInput = {
          title: vizJson.title,
          columns,
          rows
        };
      }
    } else if (vizJson.type === 'risk_feed') {
      // We don't have a specific risk_feed tool, but we can use render_table or similar
      toolName = 'render_table';
      if (vizJson.data && vizJson.data.length > 0) {
        const columns = ['Title', 'Source', 'Risk Score', 'Severity'];
        const rows = vizJson.data.map((row: any) => [
          row.title || '',
          row.source || '',
          String(row.risk_score || ''),
          row.severity || ''
        ]);
        toolInput = {
          title: vizJson.title,
          columns,
          rows
        };
      }
    }

    if (toolName && Object.keys(toolInput).length > 0) {
      contentBlocks.push({
        type: 'tool_use',
        id: `call_${Math.random().toString(36).substr(2, 9)}`,
        name: toolName,
        input: toolInput
      });
    }
  }

  return contentBlocks;
};
