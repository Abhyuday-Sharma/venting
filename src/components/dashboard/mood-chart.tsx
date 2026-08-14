"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Vent } from '@/lib/types';
import { getDate } from '@/lib/date-utils';
import { useTheme } from 'next-themes';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { format, subDays, eachDayOfInterval, isAfter } from 'date-fns';

interface MoodChartProps {
  vents: Vent[];
  chartTitle: string;
  chartDescription: string;
}

const moodEmojiMap: { [key: number]: string } = {
    1: '😭', 2: '😢', 3: '☹️', 4: '☁️', 5: '😐',
    6: '🙂', 7: '😊', 8: '😀', 9: '😄', 10: '😁',
};

const getClosestEmoji = (moodScore: number) => {
    if (!moodScore) return '';
    const keys = Object.keys(moodEmojiMap).map(Number).sort((a,b) => a-b);
    const closest = keys.reduce((prev, curr) => 
        Math.abs(curr - moodScore) < Math.abs(prev - moodScore) ? curr : prev
    );
    return moodEmojiMap[closest];
}

export function MoodChart({ vents, chartTitle, chartDescription }: MoodChartProps) {
  const { resolvedTheme } = useTheme();

  const chartData = useMemo(() => {
    const today = new Date();
    const minDate = subDays(today, 30); // Show last 30 days

    if (!vents || vents.length === 0) {
        return [];
    }
    
    const ventsWithDates = vents.map(vent => {
      const date = getDate(vent.timestamp);
      return { ...vent, date };
    }).filter((vent): vent is typeof vent & { date: Date } => vent.date !== null && isAfter(vent.date, minDate));

    // Group by YYYY-MM-DD
    const grouped = ventsWithDates.reduce((acc, vent) => {
        const dateStr = format(vent.date, 'MMM dd');
        if (!acc[dateStr]) {
            acc[dateStr] = { count: 0, sum: 0 };
        }
        acc[dateStr].count += 1;
        acc[dateStr].sum += vent.mood;
        return acc;
    }, {} as Record<string, { count: number, sum: number }>);

    // Generate all days from minDate to today to ensure continuous line
    const allDays = eachDayOfInterval({ start: minDate, end: today });

    const data = allDays.map(d => {
        const dateStr = format(d, 'MMM dd');
        const dayData = grouped[dateStr];
        
        if (dayData) {
            const avgMood = Math.round(dayData.sum / dayData.count);
            return {
                date: dateStr,
                mood: avgMood,
                emoji: getClosestEmoji(avgMood)
            };
        }
        
        return {
            date: dateStr,
            mood: null, // Recharts will connect across nulls if connectNulls={true}
            emoji: ''
        };
    });

    return data;
  }, [vents]);

  if (chartData.length === 0 || !vents || vents.length === 0) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>{chartTitle}</CardTitle>
                <CardDescription>{chartDescription}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Not enough data in the last 30 days. Add some vents to see your mood trend!</p>
            </CardContent>
        </Card>
    );
  }

  const isDark = resolvedTheme === 'dark';
  const strokeColor = isDark ? '#a3e635' : '#ca8a04'; // Lime 400 or Amber 600

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.mood === null) return null;
      return (
        <div className="bg-background/95 border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-sm font-medium mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.emoji}</span>
            <span className="text-sm font-semibold">Mood: {data.mood}/10</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent className="pb-6 pt-4 pr-6">
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#333' : '#eee'} />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: isDark ? '#888' : '#666' }}
                        tickMargin={10}
                        minTickGap={20}
                    />
                    <YAxis 
                        domain={[1, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: isDark ? '#888' : '#666' }}
                        tickCount={5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="mood" 
                        stroke={strokeColor} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorMood)" 
                        connectNulls={true}
                        activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
