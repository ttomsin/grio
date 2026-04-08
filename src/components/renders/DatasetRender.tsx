import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Database, Download } from 'lucide-react';

export function DatasetRender({ data }: { data: any }) {
  const { name, description, records, schema, format = 'both' } = data;

  if (!records || records.length === 0) return null;

  const handleDownload = (type: 'json' | 'csv') => {
    let dataStr = '';
    let mimeType = '';
    let extension = '';

    if (type === 'json') {
      dataStr = JSON.stringify(records, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      if (records.length > 0) {
        const headers = Object.keys(records[0]).join(',');
        const rows = records.map((row: any) => 
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
    a.download = `${name.replace(/\s+/g, '_').toLowerCase()}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="my-4 border-amber-500/20 bg-zinc-900/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-amber-500">
          <Database className="w-4 h-4" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm text-zinc-400 mb-4">{description}</p>}
        
        <div className="flex items-center gap-4 mb-6">
          <div className="text-sm">
            <span className="text-zinc-500">Records: </span>
            <span className="text-zinc-50 font-medium">{records.length}</span>
          </div>
        </div>

        {schema && schema.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Schema</p>
            <div className="flex flex-wrap gap-2">
              {schema.map((field: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-[10px] bg-zinc-950 border border-zinc-800">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {(format === 'json' || format === 'both') && (
            <Button onClick={() => handleDownload('json')} variant="outline" className="flex-1 border-zinc-800 hover:bg-zinc-800">
              <Download className="w-4 h-4 mr-2" /> JSON
            </Button>
          )}
          {(format === 'csv' || format === 'both') && (
            <Button onClick={() => handleDownload('csv')} variant="outline" className="flex-1 border-zinc-800 hover:bg-zinc-800">
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
