import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle2, Circle, Loader2, Download } from 'lucide-react';
import { useBoard } from '@/hooks/useBoard';

export function BoardPanel() {
  const board = useBoard();

  const handleDownload = (format: 'json' | 'csv') => {
    if (!board.dataPreview) return;
    
    let dataStr = '';
    let mimeType = '';
    let extension = '';

    if (format === 'json') {
      dataStr = JSON.stringify(board.dataPreview, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      // Basic CSV conversion for preview
      if (Array.isArray(board.dataPreview) && board.dataPreview.length > 0) {
        const headers = Object.keys(board.dataPreview[0]).join(',');
        const rows = board.dataPreview.map((row: any) => 
          Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        dataStr = `${headers}\n${rows}`;
      }
      mimeType = 'text/csv';
      extension = 'csv';
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grio_dataset.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={board.isOpen} onOpenChange={(open) => !open && board.closeBoard()}>
      <SheetContent side="right" className="w-96 flex flex-col p-0">
        <div className="p-6 border-b border-zinc-800">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl">{board.task || "Grio Board"}</SheetTitle>
              {board.status && <Badge variant="amber">{board.status}</Badge>}
            </div>
            <SheetDescription>
              Task progress and data preview
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {board.steps.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Plan</h4>
              <div className="space-y-3">
                {board.steps.map((step, i) => {
                  const isCompleted = board.completedSteps.includes(step);
                  const isCurrent = board.currentStep === step;
                  
                  return (
                    <div key={i} className="flex items-start gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-700 shrink-0" />
                      )}
                      <span className={`text-sm ${isCompleted ? 'text-zinc-500 line-through' : isCurrent ? 'text-zinc-50 font-medium' : 'text-zinc-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {board.dataPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Data Preview</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownload('json')} className="h-8 text-xs">
                    <Download className="w-3 h-3 mr-1" /> JSON
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownload('csv')} className="h-8 text-xs">
                    <Download className="w-3 h-3 mr-1" /> CSV
                  </Button>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-400 bg-zinc-900/50 border-b border-zinc-800">
                      <tr>
                        {Object.keys(board.dataPreview[0] || {}).slice(0, 4).map(key => (
                          <th key={key} className="px-4 py-3 font-medium">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(board.dataPreview) ? board.dataPreview.slice(0, 5) : []).map((row: any, i: number) => (
                        <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                          {Object.values(row).slice(0, 4).map((val: any, j: number) => (
                            <td key={j} className="px-4 py-3 text-zinc-300 truncate max-w-[150px]">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {Array.isArray(board.dataPreview) && board.dataPreview.length > 5 && (
                  <div className="p-2 text-center text-xs text-zinc-500 border-t border-zinc-800">
                    + {board.dataPreview.length - 5} more rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
