import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#f59e0b', '#d97706', '#b45309', '#78350f', '#fbbf24'];

export function ChartRender({ data }: { data: any }) {
  const { chart_type, title, data: chartData, insight } = data;

  if (!chartData || !chartData.labels || !chartData.datasets) return null;

  // Transform data for Recharts
  const transformedData = chartData.labels.map((label: string, i: number) => {
    const item: any = { name: label };
    chartData.datasets.forEach((ds: any, j: number) => {
      item[`val${j}`] = ds.data[i];
    });
    return item;
  });

  const getLabel = (label: string) => {
    if (!label || label.toLowerCase() === 'records' || label.toLowerCase() === 'value') return 'Discussions';
    return label;
  };

  const renderChart = () => {
    switch (chart_type) {
      case 'bar':
        return (
          <BarChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-card-foreground)' }}
              itemStyle={{ color: '#f59e0b' }}
            />
            {chartData.datasets.map((ds: any, i: number) => (
              <Bar key={i} dataKey={`val${i}`} name={getLabel(ds.label)} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-card-foreground)' }}
            />
            {chartData.datasets.map((ds: any, i: number) => (
              <Line key={i} type="monotone" dataKey={`val${i}`} name={getLabel(ds.label)} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4, fill: 'var(--color-card)', strokeWidth: 2 }} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-card-foreground)' }}
            />
            {chartData.datasets.map((ds: any, i: number) => (
              <Area key={i} type="monotone" dataKey={`val${i}`} name={getLabel(ds.label)} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} fillOpacity={0.3} />
            ))}
          </AreaChart>
        );
      case 'pie':
        // Pie needs different data structure
        const pieData = chartData.labels.map((label: string, i: number) => ({
          name: label,
          value: chartData.datasets[0].data[i]
        }));
        return (
          <PieChart>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-card-foreground)' }}
            />
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
              {pieData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="my-4 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() as React.ReactElement}
          </ResponsiveContainer>
        </div>
        {insight && (
          <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
            {insight}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
