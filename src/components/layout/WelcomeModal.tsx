import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Database, BookOpen, ArrowRight } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('grio_welcomed');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('grio_welcomed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const features = [
    { icon: Database, title: "Real-time Intelligence", desc: "Access thousands of live records from top Nigerian sources instantly." },
    { icon: TrendingUp, title: "Deep Market Insights", desc: "Analyze brand sentiment, public discourse, and consumer trends." },
    { icon: BookOpen, title: "Interactive Learning", desc: "Learn Nigerian Pidgin and culture through interactive UI and lessons." },
    { icon: Sparkles, title: "Visual Data", desc: "Generate beautiful charts, timelines, and comparison matrices on the fly." }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Welcome to Grio <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-muted-foreground mt-2">Africa's most capable public discourse intelligence agent.</p>
        </div>
        <div className="p-6 space-y-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="flex items-start gap-4 animate-in slide-in-from-left-8 fade-in fill-mode-both"
              style={{ animationDelay: `${(i + 1) * 150}ms`, animationDuration: '500ms' }}
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-border bg-muted/30 flex justify-end">
          <button 
            onClick={handleClose}
            className="flex items-center gap-2 bg-amber-500 text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
