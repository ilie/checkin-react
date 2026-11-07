import Checkin from "../../Checkin/Checkin";
import { shortTime } from "../../../helpers/time";
import { todayStatus, todayTimes } from "./today";

// Desktop's Today card: the clock, the button, today's status and, once clocked in today, In, Out and Worked.
// The button shows straight away; the status waits for today's status and this week's check-ins.
function ClockCard({ status, week, now }) {
  const today = status && week && todayStatus(status, week, now);
  const times = week && todayTimes(week, now);

  return (
    <section aria-label="Today" className="flex flex-col rounded-[18px] bg-cell p-5 lg:w-95 lg:shrink-0">
      <p className="text-center text-[64px] leading-none font-light tracking-tight tabular-nums">
        <time dateTime={now.toISOString()}>{shortTime(now.toTimeString())}</time>
      </p>
      <div className="flex flex-1 items-center justify-center py-8">
        <Checkin />
      </div>
      {today && (
        <div className="flex items-start gap-3 px-1">
          <span
            aria-hidden="true"
            className={`mt-1 size-2.5 shrink-0 rounded-full ${today.isOpen ? "bg-ok ring-4 ring-ok/20" : "bg-label3"}`}
          ></span>
          <div>
            <p className="text-mac-title3 font-semibold">{today.title}</p>
            {today.detail && <p className="mt-0.5 text-label2">{today.detail}</p>}
          </div>
        </div>
      )}
      {times && (
        <dl className="mt-4 grid grid-cols-3 border-t border-sep/70 px-2 pt-4 text-center">
          {[
            ["In", times.in],
            ["Out", times.out],
            ["Worked", times.worked],
          ].map(([term, value]) => (
            <div key={term} className="flex flex-col gap-1">
              <dt className="text-mac-sub text-label2">{term}</dt>
              <dd className="text-[17px] leading-[22px] font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default ClockCard;
