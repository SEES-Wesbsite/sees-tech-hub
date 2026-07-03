"use client";

import { useEffect, useState } from "react";

type Props = {
  targetDate: string;
};

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ targetDate }: Props) {
  const target = new Date(targetDate);

  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(target));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const items = [
    ["Days", time.days],
    ["Hours", time.hours],
    ["Minutes", time.minutes],
    ["Seconds", time.seconds],
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-3xl border border-border bg-card p-6"
        >
          <div className="text-5xl font-bold tabular-nums md:text-6xl">
            {String(value).padStart(2, "0")}
          </div>

          <div className="mt-2 text-sm uppercase tracking-[0.25em] text-muted-foreground">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
