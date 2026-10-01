'use client';

import { useMemo, useState } from 'react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

interface HeatmapProps {
  completedDates: Set<string>; // Set of 'YYYY-MM-DD'
  color: string;
  referenceDate?: Date;
}

export function Heatmap({ completedDates, color, referenceDate = new Date() }: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ dateStr: string; displayDate: string; completed: boolean } | null>(null);

  // Generate 52 weeks (364 days) up to referenceDate
  const { weeks, monthLabels } = useMemo(() => {
    // End on current week's Saturday
    const end = addDays(startOfWeek(referenceDate, { weekStartsOn: 0 }), 6);
    // 52 weeks back
    const start = subDays(end, 52 * 7 - 1);

    const weeksArray: { date: Date; dateStr: string; completed: boolean; isFuture: boolean }[][] = [];
    const months: { label: string; weekIndex: number }[] = [];

    let currentDay = start;
    let lastMonth = -1;

    for (let w = 0; w < 52; w++) {
      const week: { date: Date; dateStr: string; completed: boolean; isFuture: boolean }[] = [];

      for (let d = 0; d < 7; d++) {
        const dateStr = format(currentDay, 'yyyy-MM-dd');
        const isFuture = currentDay > referenceDate;
        const completed = completedDates.has(dateStr);

        // Check if month changed on Sunday (d === 0)
        const monthNum = currentDay.getMonth();
        if (d === 0 && monthNum !== lastMonth) {
          months.push({
            label: format(currentDay, 'MMM'),
            weekIndex: w,
          });
          lastMonth = monthNum;
        }

        week.push({
          date: currentDay,
          dateStr,
          completed,
          isFuture,
        });

        currentDay = addDays(currentDay, 1);
      }
      weeksArray.push(week);
    }

    return { weeks: weeksArray, monthLabels: months };
  }, [completedDates, referenceDate]);


  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[680px]">
          {/* Month labels */}
          <div className="flex text-[10px] text-zinc-400 mb-1 pl-7 h-4 relative">
            {monthLabels.map((m, i) => (
              <span
                key={`${m.label}-${i}`}
                style={{
                  position: 'absolute',
                  left: `${m.weekIndex * 13 + 28}px`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Day of week labels on left (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] text-zinc-400 pr-1 h-[88px] select-none">
              <span></span>
              <span>Mon</span>
              <span></span>
              <span>Wed</span>
              <span></span>
              <span>Fri</span>
              <span></span>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => {
                    const isHovered = hoveredDay?.dateStr === day.dateStr;
                    return (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() =>
                          !day.isFuture &&
                          setHoveredDay({
                            dateStr: day.dateStr,
                            displayDate: format(day.date, 'MMM d, yyyy'),
                            completed: day.completed,
                          })
                        }
                        onMouseLeave={() => setHoveredDay(null)}
                        style={{
                          backgroundColor: day.isFuture
                            ? 'transparent'
                            : day.completed
                            ? color
                            : undefined,
                        }}
                        className={`w-[10px] h-[10px] rounded-[2px] transition-all cursor-pointer ${
                          day.isFuture
                            ? 'opacity-0 pointer-events-none'
                            : day.completed
                            ? 'opacity-90 hover:opacity-100 hover:scale-125'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        } ${isHovered ? 'ring-1 ring-zinc-400 dark:ring-zinc-200' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Footer: Tooltip info + Legend */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <div>
              {hoveredDay ? (
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {hoveredDay.displayDate}:{' '}
                  <span className={hoveredDay.completed ? 'text-emerald-500 font-bold' : 'text-zinc-400'}>
                    {hoveredDay.completed ? 'Completed ✓' : 'No activity'}
                  </span>
                </span>
              ) : (
                <span className="text-zinc-400">Hover over any day to see details</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px]">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-100 dark:bg-zinc-800" />
              <div
                className="w-2.5 h-2.5 rounded-[2px] opacity-90"
                style={{ backgroundColor: color }}
              />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
