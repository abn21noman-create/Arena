"use client";

// ===================================================================
// Activity Heatmap — GitHub Contribution Graph-স্টাইল, গত ৬ মাসের
// প্রতিদিনের পড়াশোনার activity intensity দেখায়। কোনো নতুন dependency
// ছাড়াই সাধারণ CSS grid দিয়ে বানানো (Recharts এ heatmap নেই)।
// ===================================================================
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  data: { date: string; count: number }[];
}

const WEEKDAY_LABELS = ["", "সোম", "", "বুধ", "", "শুক্র", ""]; // রবি=0...শনি=6, বিকল্প দিনে লেবেল দেখানো

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return "bg-muted";
  const ratio = max > 0 ? count / max : 0;
  if (ratio > 0.75) return "bg-violet-600 dark:bg-violet-500";
  if (ratio > 0.5) return "bg-violet-500 dark:bg-violet-600/80";
  if (ratio > 0.25) return "bg-violet-400/70 dark:bg-violet-700/70";
  return "bg-violet-300/60 dark:bg-violet-800/60";
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);

  const { weeks, maxCount, activeDays } = useMemo(() => {
    if (data.length === 0) return { weeks: [] as { date: string; count: number }[][], maxCount: 0, activeDays: 0 };

    // প্রথম দিনটা যদি রবিবার না হয়, শুরুতে ফাঁকা সেল ঢুকিয়ে সপ্তাহ সারিবদ্ধ করা হয়
    const firstDate = new Date(data[0].date);
    const firstDayOfWeek = firstDate.getDay(); // 0=রবি
    const padded: { date: string; count: number }[] = [
      ...Array.from({ length: firstDayOfWeek }, () => ({ date: "", count: -1 })),
      ...data,
    ];

    const weeksArr: { date: string; count: number }[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeksArr.push(padded.slice(i, i + 7));
    }

    const max = Math.max(...data.map((d) => d.count), 1);
    const active = data.filter((d) => d.count > 0).length;

    return { weeks: weeksArr, maxCount: max, activeDays: active };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-start gap-1 overflow-x-auto pb-2">
        {/* Weekday labels column */}
        <div className="flex flex-col gap-[3px] pr-1 shrink-0 pt-[1px]">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="h-[11px] text-xs text-muted-foreground leading-[11px]">
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day.count === -1 ? (
                <div key={di} className="h-[11px] w-[11px]" />
              ) : (
                <div
                  key={di}
                  className={cn(
                    "h-[11px] w-[11px] rounded-[2px] cursor-pointer transition-transform hover:scale-125",
                    getIntensityClass(day.count, maxCount)
                  )}
                  onMouseEnter={() => setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>
          গত ৬ মাসে <span className="font-medium text-foreground">{activeDays}</span> দিন পড়াশোনা করেছো
        </span>
        {hovered && hovered.count >= 0 && (
          <span className="font-medium text-foreground">
            {new Date(hovered.date).toLocaleDateString("bn-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            : {hovered.count}টা activity
          </span>
        )}
      </div>
    </div>
  );
}
