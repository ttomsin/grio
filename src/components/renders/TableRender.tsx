import React from 'react';
import { Table as TableIcon } from 'lucide-react';

export function TableRender({ data }: { data: any }) {
  if (!data || !data.columns || !data.rows) return null;

  return (
    <div className="my-4 rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <TableIcon className="w-4 h-4 text-amber-500" />
        <h3 className="font-medium text-sm text-foreground">{data.title || 'Data Table'}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
            <tr>
              {data.columns.map((col: string, i: number) => (
                <th key={i} className="px-4 py-3 font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.rows.map((row: any[], i: number) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                {row.map((cell: any, j: number) => (
                  <td key={j} className="px-4 py-3 text-foreground">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
