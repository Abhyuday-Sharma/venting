"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  CartesianGrid,
} from 'recharts';
import {
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isSameYear,
  subDays,
  addDays,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week' | 'month';

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
  const keys = Object.keys(moodEmojiMap).map(Number).sort((a, b) => a - b);
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - moodScore) < Math.abs(prev - moodScore) ? curr : prev
  );
  return moodEmojiMap[closest];
};

export function MoodChart({ vents, chartTitle, chartDescription }: MoodChartProps) {
  const { resolvedTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Navigation state for each mode
  const [selectedDay, setSelectedDay] = useState<Date>(() => startOfDay(new Date()));
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => startOfMonth(new Date()));

  // Normalize vents with valid Date objects
  const parsedVents = useMemo(() => {
    if (!vents || vents.length === 0) return [];
    return vents
      .map((vent) => ({
        ...vent,
        date: getDate(vent.timestamp),
      }))
      .filter((v): v is typeof v & { date: Date } => v.date !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [vents]);

  // Current checks
  const isToday = isSameDay(selectedDay, new Date());
  const isCurrentWeek = isSameDay(
    startOfWeek(selectedWeek, { weekStartsOn: 1 }),
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const isCurrentMonth =
    isSameMonth(selectedMonth, new Date()) && isSameYear(selectedMonth, new Date());

  // ---------------------------------------------------------------------------
  // 1. DAY VIEW CALCULATION
  // ---------------------------------------------------------------------------
  const dayVents = useMemo(() => {
    return parsedVents.filter((v) => isSameDay(v.date, selectedDay));
  }, [parsedVents, selectedDay]);

  const dayChartData = useMemo(() => {
    if (dayVents.length === 0) return [];

    return dayVents.map((v, idx) => ({
      index: idx + 1,
      time: format(v.date, 'h:mm a'),
      fullTime: format(v.date, 'EEEE, h:mm a'),
      mood: v.mood,
      category: v.category || 'General',
      snippet: v.text ? (v.text.length > 50 ? `${v.text.slice(0, 50)}...` : v.text) : '',
      emoji: getClosestEmoji(v.mood),
    }));
  }, [dayVents]);

  const dayStats = useMemo(() => {
    if (dayVents.length === 0) return null;
    const avg = dayVents.reduce((sum, v) => sum + v.mood, 0) / dayVents.length;
    const firstMood = dayVents[0].mood;
    const lastMood = dayVents[dayVents.length - 1].mood;
    const diff = lastMood - firstMood;

    return {
      count: dayVents.length,
      avgMood: avg.toFixed(1),
      emoji: getClosestEmoji(Math.round(avg)),
      diff,
    };
  }, [dayVents]);

  // ---------------------------------------------------------------------------
  // 2. WEEK VIEW CALCULATION
  // ---------------------------------------------------------------------------
  const weekStart = useMemo(() => startOfWeek(selectedWeek, { weekStartsOn: 1 }), [selectedWeek]);
  const weekEnd = useMemo(() => endOfWeek(selectedWeek, { weekStartsOn: 1 }), [selectedWeek]);
  const daysInWeek = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  const weekVents = useMemo(() => {
    return parsedVents.filter(
      (v) => v.date.getTime() >= weekStart.getTime() && v.date.getTime() <= weekEnd.getTime()
    );
  }, [parsedVents, weekStart, weekEnd]);

  const weekChartData = useMemo(() => {
    const grouped = weekVents.reduce((acc, v) => {
      const key = format(v.date, 'yyyy-MM-dd');
      if (!acc[key]) acc[key] = { sum: 0, count: 0 };
      acc[key].sum += v.mood;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    return daysInWeek.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const dayData = grouped[key];
      const dateStr = format(d, 'EEE d');

      if (dayData) {
        const avgMood = Math.round((dayData.sum / dayData.count) * 10) / 10;
        return {
          date: dateStr,
          fullDate: format(d, 'EEEE, MMMM d, yyyy'),
          mood: avgMood,
          count: dayData.count,
          emoji: getClosestEmoji(Math.round(avgMood)),
        };
      }

      return {
        date: dateStr,
        fullDate: format(d, 'EEEE, MMMM d, yyyy'),
        mood: null,
        count: 0,
        emoji: '',
      };
    });
  }, [weekVents, daysInWeek]);

  const weekStats = useMemo(() => {
    if (weekVents.length === 0) return null;
    const avg = weekVents.reduce((sum, v) => sum + v.mood, 0) / weekVents.length;
    const activeDays = new Set(weekVents.map((v) => format(v.date, 'yyyy-MM-dd'))).size;

    return {
      count: weekVents.length,
      avgMood: avg.toFixed(1),
      emoji: getClosestEmoji(Math.round(avg)),
      activeDays,
    };
  }, [weekVents]);

  // ---------------------------------------------------------------------------
  // 3. MONTH VIEW CALCULATION
  // ---------------------------------------------------------------------------
  const availableMonths = useMemo(() => {
    const currentYM = format(new Date(), 'yyyy-MM');
    const monthSet = new Set<string>([currentYM]);

    parsedVents.forEach((v) => {
      monthSet.add(format(v.date, 'yyyy-MM'));
    });

    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((ym) => {
        const [year, month] = ym.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        return {
          key: ym,
          date,
          label: format(date, 'MMMM yyyy'),
        };
      });
  }, [parsedVents]);

  const monthVents = useMemo(() => {
    return parsedVents.filter(
      (v) => isSameMonth(v.date, selectedMonth) && isSameYear(v.date, selectedMonth)
    );
  }, [parsedVents, selectedMonth]);

  const monthChartData = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const grouped = monthVents.reduce((acc, v) => {
      const key = format(v.date, 'yyyy-MM-dd');
      if (!acc[key]) acc[key] = { sum: 0, count: 0 };
      acc[key].sum += v.mood;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    return allDays.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const dayData = grouped[key];
      const dateStr = format(d, 'MMM dd');

      if (dayData) {
        const avgMood = Math.round((dayData.sum / dayData.count) * 10) / 10;
        return {
          date: dateStr,
          fullDate: format(d, 'EEEE, MMMM d, yyyy'),
          mood: avgMood,
          count: dayData.count,
          emoji: getClosestEmoji(Math.round(avgMood)),
        };
      }

      return {
        date: dateStr,
        fullDate: format(d, 'EEEE, MMMM d, yyyy'),
        mood: null,
        count: 0,
        emoji: '',
      };
    });
  }, [selectedMonth, monthVents]);

  const monthStats = useMemo(() => {
    if (monthVents.length === 0) return null;
    const avg = monthVents.reduce((sum, v) => sum + v.mood, 0) / monthVents.length;
    const activeDays = new Set(monthVents.map((v) => format(v.date, 'yyyy-MM-dd'))).size;

    return {
      count: monthVents.length,
      avgMood: avg.toFixed(1),
      emoji: getClosestEmoji(Math.round(avg)),
      activeDays,
    };
  }, [monthVents]);

  // ---------------------------------------------------------------------------
  // NAVIGATION HANDLERS
  // ---------------------------------------------------------------------------
  const handlePrev = () => {
    if (viewMode === 'day') setSelectedDay((d) => subDays(d, 1));
    else if (viewMode === 'week') setSelectedWeek((w) => subWeeks(w, 1));
    else setSelectedMonth((m) => subMonths(m, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day' && !isToday) setSelectedDay((d) => addDays(d, 1));
    else if (viewMode === 'week' && !isCurrentWeek) setSelectedWeek((w) => addWeeks(w, 1));
    else if (viewMode === 'month' && !isCurrentMonth) setSelectedMonth((m) => addMonths(m, 1));
  };

  const isNextDisabled =
    viewMode === 'day' ? isToday : viewMode === 'week' ? isCurrentWeek : isCurrentMonth;

  // Active dataset based on viewMode
  const activeData =
    viewMode === 'day' ? dayChartData : viewMode === 'week' ? weekChartData : monthChartData;
  const hasData =
    viewMode === 'day'
      ? dayVents.length > 0
      : viewMode === 'week'
      ? weekVents.length > 0
      : monthVents.length > 0;

  const isDark = resolvedTheme === 'dark';
  const strokeColor = isDark ? '#a3e635' : '#ca8a04'; // Lime 400 or Amber 600

  // ---------------------------------------------------------------------------
  // CUSTOM TOOLTIPS
  // ---------------------------------------------------------------------------
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.mood === null) return null;

      return (
        <div className="bg-background/95 border border-border p-3 rounded-lg shadow-xl backdrop-blur-md max-w-xs">
          <p className="text-xs text-muted-foreground mb-1">
            {viewMode === 'day' ? data.fullTime : data.fullDate}
          </p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{data.emoji}</span>
            <div>
              <p className="text-sm font-semibold">Mood: {data.mood}/10</p>
              {viewMode === 'day' ? (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {data.category}
                </span>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  {data.count} {data.count === 1 ? 'vent' : 'vents'} logged
                </p>
              )}
            </div>
          </div>
          {viewMode === 'day' && data.snippet && (
            <p className="text-xs text-muted-foreground/90 italic mt-1 border-t border-border/50 pt-1">
              &ldquo;{data.snippet}&rdquo;
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg overflow-hidden border border-border/50">
      <CardHeader className="pb-3 space-y-3">
        {/* Row 1: Title & ViewMode Segmented Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>{chartTitle}</CardTitle>
            <CardDescription>{chartDescription}</CardDescription>
          </div>

          {/* Segmented Toggle: Day / Week / Month */}
          <div className="inline-flex items-center p-1 bg-muted/70 rounded-xl border border-border/50 self-start sm:self-auto shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                viewMode === 'day'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                viewMode === 'week'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-lg transition-all',
                viewMode === 'month'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Month
            </button>
          </div>
        </div>

        {/* Row 2: Range Navigator & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-border/30">
          {/* Navigator Controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={handlePrev}
              title={`Previous ${viewMode}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Middle Display */}
            {viewMode === 'day' && (
              <div className="px-3 py-1 rounded-lg border border-border/60 bg-background text-xs font-medium flex items-center gap-1.5 min-w-[160px] justify-center">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isToday ? 'Today, ' : ''}{format(selectedDay, 'MMM d, yyyy')}</span>
              </div>
            )}

            {viewMode === 'week' && (
              <div className="px-3 py-1 rounded-lg border border-border/60 bg-background text-xs font-medium flex items-center gap-1.5 min-w-[170px] justify-center">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
                </span>
              </div>
            )}

            {viewMode === 'month' && (
              <Select
                value={format(selectedMonth, 'yyyy-MM')}
                onValueChange={(key) => {
                  const [y, m] = key.split('-').map(Number);
                  setSelectedMonth(new Date(y, m - 1, 1));
                }}
              >
                <SelectTrigger className="h-8 w-[160px] text-xs font-medium rounded-lg">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {availableMonths.map((m) => (
                    <SelectItem key={m.key} value={m.key} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={isNextDisabled}
              onClick={handleNext}
              title={`Next ${viewMode}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {viewMode === 'day' && dayStats && (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-foreground font-medium">
                  <span>{dayStats.emoji}</span>
                  <span>
                    Avg Mood: <strong>{dayStats.avgMood}/10</strong>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <strong>{dayStats.count}</strong> {dayStats.count === 1 ? 'vent' : 'vents'} today
                </span>
              </>
            )}

            {viewMode === 'week' && weekStats && (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-foreground font-medium">
                  <span>{weekStats.emoji}</span>
                  <span>
                    Weekly Avg: <strong>{weekStats.avgMood}/10</strong>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <strong>{weekStats.count}</strong> {weekStats.count === 1 ? 'vent' : 'vents'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <strong>{weekStats.activeDays}/7</strong> active days
                </span>
              </>
            )}

            {viewMode === 'month' && monthStats && (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-foreground font-medium">
                  <span>{monthStats.emoji}</span>
                  <span>
                    Monthly Avg: <strong>{monthStats.avgMood}/10</strong>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <strong>{monthStats.count}</strong> {monthStats.count === 1 ? 'vent' : 'vents'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <strong>{monthStats.activeDays}</strong> active days
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-6 pt-2 pr-6">
        {!hasData ? (
          <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-muted/20 rounded-xl border border-dashed border-border/50">
            {viewMode === 'day' ? (
              <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
            ) : (
              <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
            )}
            <p className="font-medium text-foreground">
              {viewMode === 'day' && `No vents logged on ${format(selectedDay, 'MMMM d, yyyy')}`}
              {viewMode === 'week' &&
                `No vents logged between ${format(weekStart, 'MMM d')} and ${format(weekEnd, 'MMM d, yyyy')}`}
              {viewMode === 'month' && `No vents recorded in ${format(selectedMonth, 'MMMM yyyy')}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {viewMode === 'day'
                ? 'Check in with how you feel by writing a vent or browse another date above.'
                : `Use the navigation arrows above to browse your activity in other ${viewMode}s.`}
            </p>
            {((viewMode === 'day' && !isToday) ||
              (viewMode === 'week' && !isCurrentWeek) ||
              (viewMode === 'month' && !isCurrentMonth)) && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs h-8"
                onClick={() => {
                  setSelectedDay(startOfDay(new Date()));
                  setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
                  setSelectedMonth(startOfMonth(new Date()));
                }}
              >
                Jump to Current {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
              </Button>
            )}
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activeData}
                margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? '#333' : '#eee'}
                />
                <XAxis
                  dataKey={viewMode === 'day' ? 'time' : 'date'}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: isDark ? '#888' : '#666' }}
                  tickMargin={10}
                  minTickGap={viewMode === 'day' ? 30 : 20}
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
                  dot={{
                    r: 4.5,
                    strokeWidth: 2,
                    stroke: isDark ? '#090d16' : '#ffffff',
                    fill: strokeColor,
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 2,
                    stroke: isDark ? '#090d16' : '#ffffff',
                    fill: strokeColor,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
