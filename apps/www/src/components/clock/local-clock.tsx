"use client";

import { Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { SlidingNumber } from "./sliding-number";

interface LocalClockProps {
  location: string;
  timezone: string;
}

export function LocalClock({ timezone, location }: LocalClockProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const localTime = new Date(
        date.toLocaleString("en-US", { timeZone: timezone })
      );
      setHours(localTime.getHours());
      setMinutes(localTime.getMinutes());
      setSeconds(localTime.getSeconds());
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="flex items-center gap-1 text-light text-muted-foreground text-xs">
      <HugeiconsIcon className="size-3" icon={Clock01Icon} />
      <div className="flex">
        <SlidingNumber padStart={true} value={hours} />
        <span className="">:</span>
        <SlidingNumber padStart={true} value={minutes} />
        <span className="">:</span>
        <SlidingNumber padStart={true} value={seconds} />
      </div>
      <span> - </span>
      <span>{location}</span>
    </div>
  );
}
