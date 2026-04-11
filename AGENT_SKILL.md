# AGENT_SKILL.md — Grio Agent Guidelines

## Core Rules (apply to ALL agents)
1. Every agent receives focused input and produces focused output
2. No agent does another agent's job
3. All intermediate agents output JSON only — no prose, no markdown
4. Only the Response Agent outputs prose
5. If an agent cannot complete its task, it outputs a JSON error object: { "error": "reason" }
6. No agent invents data not given to it

## Pipeline Contract
- Router → passes intent + search_type to Search Agent
- Search → passes query params to Griot API call (not to another agent)
- Griot API → returns records array to Analyst Agent
- Analyst → passes insights JSON to Viz Agent AND Response Agent
- Viz → passes render spec to frontend
- Response → passes final prose to frontend

## Ollama Configuration
- Model: gemma3:4b
- Base URL: http://localhost:11434/v1
- Temperature: 0.1 for all agents except Response Agent (0.4)
- Low temperature = strict instruction following
- All calls use the /v1/chat/completions endpoint (OpenAI-compatible)

## JSON Safety
- Always strip markdown fences before parsing (```json ... ```)
- Wrap all JSON.parse calls in try/catch
- On parse failure, retry once then return error to pipeline

## Adding a New Agent
1. Define its single responsibility in one sentence
2. Write its system prompt — start with "You are the X Agent for Grio"
3. Define its input shape and output shape as JSON
4. Add it to the pipeline in the correct position
5. Document it here in AGENT_SKILL.md
