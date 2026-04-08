import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export function TimelineRender({ data }: { data: any }) {
  const { title, events } = data;

  if (!events || events.length === 0) return null;

  return (
    <Card className="my-4">
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="relative border-l border-zinc-700 ml-3 space-y-8">
          {events.map((event: any, i: number) => (
            <div key={i} className="relative pl-6">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-zinc-900" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <span className="text-xs font-medium text-amber-500">{event.date}</span>
                {event.sentiment && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 h-4 border-transparent ${
                      event.sentiment === 'positive' ? 'bg-green-500/10 text-green-500' :
                      event.sentiment === 'negative' ? 'bg-red-500/10 text-red-500' :
                      'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {event.sentiment}
                  </Badge>
                )}
              </div>
              
              <h4 className="text-sm font-medium text-zinc-50 mb-1">{event.label}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{event.description}</p>
              
              {event.volume !== undefined && (
                <div className="mt-2 text-xs text-zinc-500">
                  Volume: {event.volume} mentions
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
