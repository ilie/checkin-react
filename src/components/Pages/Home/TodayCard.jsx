import { formatDuration, totalSeconds } from "../../../helpers/time";
import { todayStatus } from "./today";

// Today's status and this week's hours against the contract. `week` holds this week's check-ins so far.
function TodayCard({ status, week, hoursOnContract, now }) {
  const today = todayStatus(status, week, now);
  const weekSeconds = totalSeconds(week, now);
  const progress = hoursOnContract ? Math.min(100, (weekSeconds / (hoursOnContract * 3600)) * 100) : 0;

  return (
    <section aria-label="Today" className="rounded-2xl bg-cell">
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          aria-hidden="true"
          className={`size-3 shrink-0 rounded-full ${today.isOpen ? "bg-ok ring-4 ring-ok/20" : "bg-label3"}`}
        ></span>
        <div>
          <p className="font-semibold">{today.title}</p>
          {today.detail && <p className="text-subhead text-label2">{today.detail}</p>}
        </div>
      </div>
      {hoursOnContract != null && (
        <div className="ml-4 border-t border-sep/60 py-3 pr-4">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="font-semibold">This week</p>
            <p className="text-subhead text-label2">
              <span className="font-semibold text-label">{formatDuration(weekSeconds)}</span> of {hoursOnContract}h
            </p>
          </div>
          <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-fill">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </section>
  );
}

export default TodayCard;
