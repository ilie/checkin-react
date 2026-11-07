import { checkinResult, checkinTimes } from "../../Lists/checkinResult";
import {
  addDays,
  dailySeconds,
  formatDuration,
  isoDate,
  parseDate,
  shortDate,
  totalSeconds,
  weekLabel,
  weekStart,
} from "../../../helpers/time";

const chartHeight = 180;
// Today's open check-in is striped, as it's still growing.
const openBarStyle = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--accent) 0 4px, color-mix(in srgb, var(--accent) 55%, transparent) 4px 8px)",
};

// Desktop's This week card: the total against the contract, a bar per day from Monday, and the week's check-ins.
// The chart is hidden from screen readers; the rows under it give the same figures as text (HIG Charts).
function WeekCard({ week, hoursOnContract, now }) {
  const today = isoDate(now);
  const start = weekStart(today);
  const [name, range] = weekLabel(start, today).split(" · ");
  const seconds = totalSeconds(week, now);
  const days = dailySeconds(week, start, now);
  const isOpenToday = week.some((checkin) => checkin.checkin_date === today && !checkin.checkout_time);
  // The scale runs from zero in 4-hour steps, up to at least 8h.
  const topHours = Math.max(8, Math.ceil(Math.max(...days) / 3600 / 4) * 4);
  const ticks = Array.from({ length: topHours / 4 + 1 }, (_, index) => index * 4);
  const left = hoursOnContract ? hoursOnContract * 3600 - seconds : 0;

  return (
    <section aria-label="This week" className="flex min-w-0 flex-1 flex-col rounded-[18px] bg-cell p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="text-mac-title3 font-semibold">
          {name} <span className="font-medium text-label2">· {range}</span>
        </h2>
        <p className="text-label2">
          <span className="font-semibold text-label">{formatDuration(seconds)}</span>
          {hoursOnContract != null && ` of ${hoursOnContract}h`}
          {left > 0 && ` · ${formatDuration(left)} left`}
        </p>
      </div>
      {hoursOnContract != null && (
        <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-fill">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${hoursOnContract ? Math.min(100, (seconds / (hoursOnContract * 3600)) * 100) : 0}%` }}
          ></div>
        </div>
      )}
      <div aria-hidden="true" className="relative mt-8 pl-8">
        <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: chartHeight }}>
          {ticks.map((hours) => (
            <div
              key={hours}
              className="absolute inset-x-0 flex translate-y-1/2 items-center gap-2"
              style={{ bottom: (hours / topHours) * chartHeight }}
            >
              <span className="w-6 text-right text-mac-sub text-label2 tabular-nums">{hours}h</span>
              <span className={`h-px flex-1 ${hours ? "bg-sep/60" : "bg-sep"}`}></span>
            </div>
          ))}
        </div>
        <div className="relative flex">
          {days.map((daySeconds, index) => {
            const date = addDays(start, index);
            const isToday = date === today;
            const isOpen = isToday && isOpenToday;

            return (
              <div key={date} className="flex flex-1 flex-col items-center">
                <div className="relative flex w-full justify-center" style={{ height: chartHeight }}>
                  {daySeconds > 0 && (
                    <div
                      className="absolute bottom-0 flex w-10 max-w-[70%] justify-center"
                      style={{ height: (daySeconds / 3600 / topHours) * chartHeight }}
                    >
                      <span
                        className={`absolute -top-5 text-mac-sub font-semibold whitespace-nowrap ${isOpen ? "text-ok" : "text-label2"}`}
                      >
                        {formatDuration(daySeconds)}
                      </span>
                      <span
                        className={`w-full rounded-t-md ${isOpen ? "" : "bg-accent"}`}
                        style={isOpen ? openBarStyle : undefined}
                      ></span>
                    </div>
                  )}
                </div>
                <span
                  className={`mt-2 text-mac-sub whitespace-nowrap ${isToday ? "font-bold text-accent" : "text-label2"}`}
                >
                  {parseDate(date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <ul className="mt-4">
        {week.map((checkin) => {
          const result = checkinResult(checkin, now);

          return (
            <li key={checkin.id} className="flex items-center gap-3 border-t border-sep/70 py-2.5">
              <span className="w-24 font-semibold">{shortDate(checkin.checkin_date)}</span>
              <span className="flex-1 text-label2 tabular-nums">{checkinTimes(checkin, now)}</span>
              <span className={`font-semibold tabular-nums ${result.className}`}>{result.text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default WeekCard;
