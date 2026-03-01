
"use client";

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Vent } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface MoodChartProps {
  vents: Vent[];
  chartTitle: string;
  chartDescription: string;
}

// Map mood scores to emojis
const moodEmojiMap: { [key: number]: string } = {
    1: '😭',
    2: '😢',
    4: '☁️',
    6: '🙂',
    7: '😊',
    9: '😄',
    10: '😁',
};

const formatYAxisEmojis = (tickItem: number) => {
    return moodEmojiMap[tickItem] || '';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="font-bold">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Mood</span>
            <span className="font-bold">{moodEmojiMap[data.mood] || ''} {data.mood}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export function MoodChart({ vents, chartTitle, chartDescription }: MoodChartProps) {
  const chartData = useMemo(() => {
    if (!vents || vents.length === 0) return [];
    
    const ventsWithDates = vents.map(vent => {
      const date = (vent.timestamp as Timestamp)?.toDate();
      return { ...vent, date };
    }).filter(vent => vent.date); // Filter out any vents that might have a missing timestamp

    const sortedVents = ventsWithDates.sort((a, b) => a.date.getTime() - b.date.getTime());

    return sortedVents.map(vent => ({
      date: format(vent.date, 'MMM d'),
      mood: vent.mood,
    }));
  }, [vents]);

  const showEmojisOnAxis = chartTitle === "Daily Mood Check-in History";

  if (chartData.length < 2) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>{chartTitle}</CardTitle>
                <CardDescription>{chartDescription}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Not enough data to display a chart. Keep adding entries to see your trends.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              {showEmojisOnAxis ? (
                <YAxis 
                  domain={[1, 10]} 
                  ticks={[1, 2, 4, 6, 7, 9, 10]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxisEmojis}
                  padding={{ top: 10, bottom: 10 }}
                  interval={0}
                />
              ) : (
                <YAxis 
                  domain={[1, 10]} 
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="mood" 
                stroke="hsl(var(--primary))" 
                fillOpacity={0.4} 
                fill="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
