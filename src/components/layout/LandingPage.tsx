import React, { useState } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { Search, ArrowRight, Database, TrendingUp, MessageSquare } from 'lucide-react';

export function LandingPage({ onStart }: { onStart: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onStart(query);
    }
  };

  const suggestions = [
    "What are people saying about the new fuel prices?",
    "Compare sentiment between Vanguard and Nairaland on the election.",
    "Build a dataset of real estate trends in Lagos.",
    "Teach me some common Naija Pidgin phrases."
  ];

  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Futuristic Particle Background */}
      <ParticleBackground />

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
        
        {/* Logo / Title */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-6 ring-1 ring-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4">
            Grio
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Nigeria's public discourse, made intelligible. Turning thousands of live records into instant intelligence.
          </p>
        </div>

        {/* Search Input */}
        <form 
          onSubmit={handleSubmit}
          className="w-full relative group animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150"
        >
          <div className="absolute inset-0 bg-amber-500/5 rounded-2xl blur-xl transition-all group-hover:bg-amber-500/10" />
          <div className="relative flex items-center bg-card border border-border rounded-2xl shadow-lg overflow-hidden transition-all focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50">
            <div className="pl-6 pr-2 text-muted-foreground">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Grio about Nigeria..."
              className="w-full py-5 px-2 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
            />
            <button 
              type="submit"
              disabled={!query.trim()}
              className="m-2 p-3 bg-amber-500 text-primary-foreground rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onStart(suggestion)}
              className="text-left p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/50 hover:border-amber-500/30 transition-all text-sm text-muted-foreground hover:text-foreground flex items-start gap-3 group"
            >
              {i % 2 === 0 ? <TrendingUp className="w-4 h-4 mt-0.5 text-amber-500/70 group-hover:text-amber-500" /> : <MessageSquare className="w-4 h-4 mt-0.5 text-amber-500/70 group-hover:text-amber-500" />}
              {suggestion}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
