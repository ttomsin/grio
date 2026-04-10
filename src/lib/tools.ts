export const GRIO_TOOLS = [
  {
    name: "think",
    description: "Use this tool to show your thought process to the user before executing complex actions or queries. This helps the user understand your reasoning.",
    input_schema: {
      type: "object",
      required: ["thought"],
      properties: {
        thought: { type: "string", description: "Your internal reasoning or plan." }
      }
    }
  },
  {
    name: "read_skill",
    description: "Read the detailed instructions for a specific skill. Use this before executing complex workflows for an active skill.",
    input_schema: {
      type: "object",
      required: ["skill_id"],
      properties: {
        skill_id: { type: "string", description: "The ID of the skill to read (e.g., 'dataset_builder', 'market_intelligence')" }
      }
    }
  },
  {
    name: "query_griot",
    description: "Query the Griot API for records. Always try this first. Never say data is unavailable without querying.",
    input_schema: {
      type: "object",
      properties: {
        q:        { type: "string", description: "Full-text search" },
        sources:  { type: "string", description: "Comma-separated: vanguard,nairaland,saharareporters..." },
        tags:     { type: "string", description: "Comma-separated tags" },
        location: { type: "string", description: "Nigerian state or city" },
        min_risk: { type: "integer" },
        date_from:{ type: "string", description: "YYYY-MM-DD" },
        date_to:  { type: "string", description: "YYYY-MM-DD" },
        page:     { type: "integer" },
        page_size:{ type: "integer", description: "Max 50" },
        latest:   { type: "boolean" }
      }
    }
  },
  {
    name: "render_chart",
    description: "Render an inline Recharts chart. Use for trends, sentiment, market share, probability distributions.",
    input_schema: {
      type: "object",
      required: ["chart_type", "title", "data"],
      properties: {
        chart_type: { type: "string", enum: ["bar", "line", "pie", "area"] },
        title:      { type: "string" },
        data:       { type: "object", description: "{ labels: [], datasets: [] }" },
        insight:    { type: "string", description: "One-sentence insight shown below the chart" }
      }
    }
  },
  {
    name: "render_thread",
    description: "Render Nairaland records as a forum thread UI.",
    input_schema: {
      type: "object",
      required: ["posts"],
      properties: {
        thread_title: { type: "string" },
        posts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              author:    { type: "string" },
              content:   { type: "string" },
              likes:     { type: "integer" },
              timestamp: { type: "string" },
              url:       { type: "string" }
            }
          }
        }
      }
    }
  },
  {
    name: "render_comparison",
    description: "Render a side-by-side comparison. Use for brands, politicians, sources, time periods.",
    input_schema: {
      type: "object",
      required: ["items", "metrics"],
      properties: {
        title: { type: "string" },
        items: { type: "array", items: { type: "string" } },
        metrics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label:  { type: "string" },
              values: { type: "array", items: {} },
              format: { type: "string", enum: ["number", "percentage", "text", "bar"] }
            }
          }
        }
      }
    }
  },
  {
    name: "render_timeline",
    description: "Render a timeline of events. Use for pattern analysis, story evolution over time.",
    input_schema: {
      type: "object",
      required: ["title", "events"],
      properties: {
        title: { type: "string" },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date:       { type: "string" },
              label:      { type: "string" },
              description:{ type: "string" },
              sentiment:  { type: "string", enum: ["positive", "negative", "neutral"] },
              volume:     { type: "integer" }
            }
          }
        }
      }
    }
  },
  {
    name: "open_board",
    description: "Open the Grio Board and post a task plan. Use at the start of any complex multi-step task.",
    input_schema: {
      type: "object",
      required: ["task", "status"],
      properties: {
        task:   { type: "string" },
        status: { type: "string" },
        steps:  { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "update_board",
    description: "Update the Grio Board progress.",
    input_schema: {
      type: "object",
      required: ["status", "completed_steps", "current_step"],
      properties: {
        status:          { type: "string" },
        completed_steps: { type: "array", items: { type: "string" } },
        current_step:    { type: "string" },
        data_preview:    { type: "object" }
      }
    }
  },
  {
    name: "build_dataset",
    description: "Compile collected records into a downloadable dataset (JSON + CSV).",
    input_schema: {
      type: "object",
      required: ["name", "records", "schema"],
      properties: {
        name:        { type: "string" },
        description: { type: "string" },
        records:     { type: "array" },
        schema:      { type: "array", items: { type: "string" } },
        format:      { type: "string", enum: ["json", "csv", "both"], default: "both" }
      }
    }
  },
  {
    name: "manage_skills",
    description: "Enable or disable skills based on the user's request. Use this when the user asks to switch skills or when you realize a different skill is needed for the task.",
    input_schema: {
      type: "object",
      properties: {
        enable_skills: { 
          type: "array", 
          items: { type: "string" }, 
          description: "List of skill IDs to enable (e.g., 'dataset_builder', 'market_intelligence')" 
        },
        disable_skills: { 
          type: "array", 
          items: { type: "string" }, 
          description: "List of skill IDs to disable" 
        }
      }
    }
  },
  {
    name: "render_lesson",
    description: "Render an interactive lesson. Use for pidgin teaching, cultural explainers, quiz-style learning.",
    input_schema: {
      type: "object",
      required: ["lesson_type", "content"],
      properties: {
        lesson_type: { type: "string", enum: ["quiz", "flashcard", "fill_blank", "translate"] },
        title:       { type: "string" },
        content: {
          type: "array",
          items: {
            type: "object",
            properties: {
              prompt:      { type: "string" },
              answer:      { type: "string" },
              options:     { type: "array", items: { type: "string" } },
              explanation: { type: "string" }
            }
          }
        }
      }
    }
  }
];
