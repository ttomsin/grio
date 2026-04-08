import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { SKILL_REGISTRY } from '@/lib/skills';
import { cn } from '@/lib/utils';
import { Moon, Sun, Settings } from 'lucide-react';

export function Sidebar({ activeSkillIds, setActiveSkillIds, onNewChat, apiKeyStatus, onOpenSettings }: any) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleSkill = (id: string) => {
    if (id === 'records_explorer') return; // Always active
    if (activeSkillIds.includes(id)) {
      setActiveSkillIds(activeSkillIds.filter((s: string) => s !== id));
    } else {
      setActiveSkillIds([...activeSkillIds, id]);
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Grio</h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={onOpenSettings}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <Button onClick={onNewChat} className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-500/90">
          New chat
        </Button>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills</p>
        <div className="space-y-1">
          <TooltipProvider>
            {SKILL_REGISTRY.map(skill => {
              const isActive = activeSkillIds.includes(skill.id);
              return (
                <Tooltip key={skill.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleSkill(skill.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive 
                          ? "bg-amber-500/10 text-amber-500 font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <skill.icon className="w-4 h-4" />
                      {skill.name}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{skill.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 overflow-y-auto px-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">History</p>
        {/* History list would go here */}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={cn("w-2 h-2 rounded-full", apiKeyStatus ? "bg-amber-500" : "bg-red-500")} />
          {apiKeyStatus ? "Griot Connected" : "Griot Disconnected"}
        </div>
      </div>
    </div>
  );
}
