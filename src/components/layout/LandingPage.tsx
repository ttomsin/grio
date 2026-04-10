import React, { useState, useEffect } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { Search, ArrowRight, TrendingUp, MessageSquare, Moon, Sun } from 'lucide-react';
import { WelcomeModal } from './WelcomeModal';

export function LandingPage({ onStart }: { onStart: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
      <WelcomeModal />
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Futuristic Particle Background */}
      <ParticleBackground />

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
        
        {/* Logo / Title */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground mb-4 flex items-center justify-center">
            <span className="relative flex items-center justify-center mr-1">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 md:w-24 md:h-24 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                {/* Vertical Bar (Smaller, centered behind the G) */}
                <line x1="24" y1="16" x2="24" y2="32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.4" />
                {/* The G */}
                <path d="M 34 14 A 14 14 0 1 0 38 24 H 24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            rio
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
