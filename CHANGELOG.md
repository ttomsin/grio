# Changelog

All notable changes to Grio will be documented in this file.

## [Unreleased]

### Added
- **Plugin Architecture**: Decoupled tools, skills, and UI renderers into a central registry system (`src/lib/registry.ts`). This allows for easy addition of new features without modifying core agent logic.
- **Landing Page**: Added a futuristic, intuitive landing page with an interactive AI particle background.
- **Collapsible Process UI**: Thought processes and execution plans are now rendered as clean, collapsible text nodes connected by vertical lines, rather than bulky cards.
- **Streaming Responses**: LLM responses now stream in real-time for Anthropic, OpenRouter, and Gemini providers.
- **Markdown Typography**: Integrated `@tailwindcss/typography` for beautiful, readable markdown rendering in chat bubbles.
- **Skill Reading Tool**: Added `read_skill` tool to allow the agent to dynamically load detailed instructions for active skills, saving context window space.
- **Context Window Management**: Implemented a sliding window (last 30 messages) and tool result truncation to prevent token limit errors during long conversations.

### Changed
- **Tool UI Theming**: Updated all custom renderers (Charts, Comparisons, Datasets, etc.) to use semantic CSS variables, ensuring perfect compatibility with both Light and Dark modes.
- **Chart Labels**: Automatically translates generic labels like "records" or "value" to "Discussions" for more expressive data visualization.
- **System Prompt**: Optimized the system prompt to enforce conversational follow-ups after tool usage and encourage multiple/parallel tool executions.
- **Skill Instructions**: Massively expanded the detailed instructions for all skills, providing the agent with strict, multi-step workflows (e.g., pagination for Dataset Builder).

### Fixed
- **Vertical Spacing Bug**: Fixed an issue where empty text blocks were rendering during tool execution, causing awkward vertical gaps in the chat.
- **Focus Rings**: Removed default browser focus rings from the chat input area for a cleaner UI.
