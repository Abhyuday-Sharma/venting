"use client";

import { useMemo } from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';
import { format, parseISO, subDays, eachDayOfInterval, isAfter, isBefore } from 'date-fns';
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
    0: 'No entry',
    1: '😭',
    2: '😢',
    3: '☹️',
    4: '☁️',
    5: '😐',
    6: '🙂',
    7: '😊',
    8: '😀',
    9: '😄',
    10: '😁',
};

// Map 1-10 scale to 0-4 levels for the calendar
const getMoodLevel = (mood: number): 0 | 1 | 2 | 3 | 4 => {
    if (mood === 0) return 0;
    if (mood <= 3) return 1;
    if (mood <= 6) return 2;
    if (mood <= 8) return 3;
    if (mood <= 10) return 4;
    return 0;
};

// We create a custom theme so the calendar uses our app's primary color
const explicitTheme: ThemeInput = {
    light: ['#f4f4f5', '#fde047', '#facc15', '#eab308', '#ca8a04'], // Zinc 100 -> Amber 300-700
    dark: ['#27272a', '#4d7c0f', '#65a30d', '#84cc16', '#a3e635'], // Zinc 800 -> Lime 700-400 (Github style)
};

export function MoodChart({ vents, chartTitle, chartDescription }: MoodChartProps) {
  const { resolvedTheme } = useTheme();

  const { calendarData, latestYear } = useMemo(() => {
    const today = new Date();
    const oneYearAgo = subDays(today, 365);
    let minDate = oneYearAgo;

    if (!vents || vents.length === 0) {
        // Return an empty year if no vents
        const emptyData = eachDayOfInterval({ start: oneYearAgo, end: today }).map(d => ({
            date: format(d, 'yyyy-MM-dd'),
            count: 0,
            level: 0 as 0|1|2|3|4
        }));
        return { calendarData: emptyData, latestYear: today.getFullYear() };
    }
    
    const ventsWithDates = vents.map(vent => {
      const date = getDate(vent.timestamp);
      return { ...vent, date };
    }).filter((vent): vent is typeof vent & { date: Date } => vent.date !== null);

    ventsWithDates.forEach(v => {
        if (isBefore(v.date, minDate)) {
            minDate = v.date;
        }
    });

    // Group by YYYY-MM-DD
    const grouped = ventsWithDates.reduce((acc, vent) => {
        const dateStr = format(vent.date, 'yyyy-MM-dd');
        if (!acc[dateStr]) {
            acc[dateStr] = { count: 0, sum: 0 };
        }
        acc[dateStr].count += 1;
        acc[dateStr].sum += vent.mood;
        return acc;
    }, {} as Record<string, { count: number, sum: number }>);

    // Generate all days from minDate to today
    const allDays = eachDayOfInterval({ start: minDate, end: today });
    let maxYear = today.getFullYear();

    const data = allDays.map(d => {
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayData = grouped[dateStr];
        const year = d.getFullYear();
        if (year > maxYear) maxYear = year;

        if (dayData) {
            const avgMood = Math.round(dayData.sum / dayData.count);
            return {
                date: dateStr,
                count: avgMood,
                level: getMoodLevel(avgMood)
            };
        }
        
        return {
            date: dateStr,
            count: 0,
            level: 0 as 0|1|2|3|4
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
