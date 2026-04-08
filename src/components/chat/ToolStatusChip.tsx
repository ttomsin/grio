import React from 'react';
import { Loader2 } from 'lucide-react';

export function ToolStatusChip({ toolName }: { toolName: string }) {
  const formatName = (name: string) => {
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium animate-pulse">
      <Loader2 className="w-3 h-3 animate-spin" />
      {formatName(toolName)}...
    </div>
  );
}
