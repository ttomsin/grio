import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function ComparisonRender({ data }: { data: any }) {
  const { title, items, metrics } = data;

  if (!items || !metrics) return null;

  return (
    <Card className="my-4 overflow-hidden">
      {title && (
        <CardHeader className="pb-3 border-b border-zinc-800 bg-zinc-900/50">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium w-1/3">Metric</th>
                {items.map((item: string, i: number) => (
                  <th key={i} className="px-4 py-3 font-medium">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {metrics.map((metric: any, i: number) => {
                // Find the best value to highlight if it's a number
                let bestIndex = -1;
                if (metric.format === 'number' || metric.format === 'percentage' || metric.format === 'bar') {
                  const numValues = metric.values.map((v: any) => parseFloat(String(v).replace(/[^0-9.-]+/g,"")));
                  const maxVal = Math.max(...numValues.filter((v: number) => !isNaN(v)));
                  bestIndex = numValues.findIndex((v: number) => v === maxVal);
                }

                return (
                  <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-300">{metric.label}</td>
                    {metric.values.map((val: any, j: number) => {
                      const isBest = j === bestIndex;
                      
                      if (metric.format === 'bar') {
                        const numVal = parseFloat(String(val).replace(/[^0-9.-]+/g,""));
                        const maxVal = Math.max(...metric.values.map((v: any) => parseFloat(String(v).replace(/[^0-9.-]+/g,""))).filter((v: number) => !isNaN(v)));
                        const pct = maxVal > 0 ? (numVal / maxVal) * 100 : 0;
                        
                        return (
                          <td key={j} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={isBest ? "text-amber-500 font-medium" : "text-zinc-300"}>{val}</span>
                              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={j} className={`px-4 py-3 ${isBest ? 'text-amber-500 font-medium' : 'text-zinc-300'}`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
