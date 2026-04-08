import {
  Search,
  Database,
  TrendingUp,
  LineChart,
  BookOpen,
  MessageSquare,
  Radio,
  GitCompare
} from "lucide-react";

export const SKILL_REGISTRY = [
  {
    id: "records_explorer",
    name: "Records",
    icon: Search,
    description: "Browse and search Griot records. Always active.",
    systemPromptAddition: "You are exploring records. Always use query_griot to find information.",
    tools: ["query_griot"],
  },
  {
    id: "dataset_builder",
    name: "Dataset Builder",
    icon: Database,
    description: "Build downloadable datasets from iterative Griot queries",
    systemPromptAddition: "You are building a dataset. Use query_griot to fetch data, then use build_dataset to compile it.",
    tools: ["query_griot", "build_dataset", "open_board", "update_board"],
  },
  {
    id: "market_intelligence",
    name: "Market Intel",
    icon: TrendingUp,
    description: "Brand/product sentiment, what Nigerians think",
    systemPromptAddition: "You are analyzing market intelligence. Focus on sentiment, brand perception, and market trends. Use render_chart for visual insights.",
    tools: ["query_griot", "render_chart"],
  },
  {
    id: "pattern_analysis",
    name: "Patterns",
    icon: LineChart,
    description: "Discourse trends over time with timeline UI",
    systemPromptAddition: "You are analyzing patterns over time. Use render_timeline to show how stories or sentiments evolve.",
    tools: ["query_griot", "render_timeline", "render_chart"],
  },
  {
    id: "pidgin_teacher",
    name: "Learn Pidgin",
    icon: BookOpen,
    description: "Interactive Naija Pidgin lessons, Duolingo-style",
    systemPromptAddition: "You are a Naija Pidgin teacher. Use render_lesson to create interactive quizzes and flashcards. Explain meanings clearly.",
    tools: ["render_lesson"],
  },
  {
    id: "nairaland_reader",
    name: "Nairaland",
    icon: MessageSquare,
    description: "Render threads as a proper forum UI",
    systemPromptAddition: "You are reading Nairaland. When you find Nairaland records, use render_thread to display them as a forum UI.",
    tools: ["query_griot", "render_thread"],
  },
  {
    id: "live_tracker",
    name: "Live Feed",
    icon: Radio,
    description: "Auto-refreshing topic feed every 60s",
    systemPromptAddition: "You are tracking live topics. Focus on the most recent records.",
    tools: ["query_griot"],
  },
  {
    id: "comparison_engine",
    name: "Compare",
    icon: GitCompare,
    description: "Side-by-side comparison of people, brands, sources",
    systemPromptAddition: "You are comparing entities. Use render_comparison to show side-by-side metrics.",
    tools: ["query_griot", "render_comparison"],
  }
];
