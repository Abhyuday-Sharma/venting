"use client";

import { useMemo } from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Vent } from '@/lib/types';
import { getDate } from '@/lib/date-utils';
import { useTheme } from 'next-themes';

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

// Map 1-10 scale to 0-4 levels for the calendar
const getMoodLevel = (mood: number): 0 | 1 | 2 | 3 | 4 => {
    if (mood <= 2) return 1;
    if (mood <= 5) return 2;
    if (mood <= 8) return 3;
    if (mood <= 10) return 4;
    return 0;
};

// We create a custom theme so the calendar uses our app's primary color
// Using standard tailwind zinc/amber shades for a sleek look
const explicitTheme: ThemeInput = {
    light: ['#f4f4f5', '#fde047', '#facc15', '#eab308', '#ca8a04'], // Zinc 100 -> Amber 300-700
    dark: ['#27272a', '#4d7c0f', '#65a30d', '#84cc16', '#a3e635'], // Zinc 800 -> Lime 700-400 (Github style)
};

export function MoodChart({ vents, chartTitle, chartDescription }: MoodChartProps) {
  const { resolvedTheme } = useTheme();

  const { calendarData, latestYear } = useMemo(() => {
    if (!vents || vents.length === 0) return { calendarData: [], latestYear: new Date().getFullYear() };
    
    const ventsWithDates = vents.map(vent => {
      const date = getDate(vent.timestamp);
      return { ...vent, date };
    }).filter((vent): vent is typeof vent & { date: Date } => vent.date !== null);

    // Group by YYYY-MM-DD
    const grouped = ventsWithDates.reduce((acc, vent) => {
        const dateStr = format(vent.date, 'yyyy-MM-dd');
        if (!acc[dateStr]) {
            acc[dateStr] = { date: dateStr, count: 0, sum: 0, latestEmoji: vent.mood };
        }
        acc[dateStr].count += 1;
        acc[dateStr].sum += vent.mood;
        return acc;
    }, {} as Record<string, { date: string, count: number, sum: number, latestEmoji: number }>);

    let maxYear = 2000;

    const data = Object.values(grouped).map(day => {
        const avgMood = Math.round(day.sum / day.count);
        const year = parseInt(day.date.substring(0, 4));
        if (year > maxYear) maxYear = year;
        
        return {
            date: day.date,
            count: avgMood, // We'll use count field to store the mood score for the tooltip
            level: getMoodLevel(avgMood)
        };
    });

    return { calendarData: data, latestYear: maxYear };
  }, [vents]);

  if (calendarData.length === 0) {
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

  // Find emoji closest to average mood
  const getClosestEmoji = (moodScore: number) => {
      const keys = Object.keys(moodEmojiMap).map(Number).sort((a,b) => a-b);
      const closest = keys.reduce((prev, curr) => 
          Math.abs(curr - moodScore) < Math.abs(prev - moodScore) ? curr : prev
      );
      return moodEmojiMap[closest];
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-6">
        <div className="min-w-[700px] flex justify-center p-4">
            <ActivityCalendar 
                data={calendarData} 
                theme={explicitTheme}
                colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                labels={{
                    legend: {
                        less: 'Lower Mood',
                        more: 'Higher Mood'
                    },
                    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    totalCount: `Mood Check-ins in ${latestYear}`
                }}
                renderBlock={(block: any, activity: any) => (
                    <div 
                        title={`${format(parseISO(activity.date), 'MMM d, yyyy')}: ${getClosestEmoji(activity.count)} (Score: ${activity.count})`}
                        className="outline-none"
                    >
                        {block}
                    </div>
                )}
            />
        </div>
      </CardContent>
    </Card>
  );
}
