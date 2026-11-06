import { useEffect, useState } from "react";

// The current time, updated on each new minute: enough for a clock and running totals without a render a second.
export function useNow() {
  const [now, setNow] = useState(() => new Date());

  // A timer is an outside system, so this is one of the effects React expects.
  useEffect(() => {
    let timer;
    function scheduleNextMinute() {
      timer = setTimeout(() => {
        setNow(new Date());
        scheduleNextMinute();
      }, 60_000 - (Date.now() % 60_000));
    }
    scheduleNextMinute();

    return () => clearTimeout(timer);
  }, []);

  return now;
}
