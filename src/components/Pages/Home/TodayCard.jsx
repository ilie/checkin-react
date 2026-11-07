import { formatDuration, totalSeconds } from "../../../helpers/time";
import StatusLine from "./StatusLine";
import { todayStatus } from "./today";
import WeekProgress from "./WeekProgress";

// Today's status and this week's hours against the contract. `week` holds this week's check-ins so far.
function TodayCard({ status, week, hoursOnContract, now }) {
  const today = todayStatus(status, week, now);
  const weekSeconds = totalSeconds(week, now);

  return (
    <section aria-label="Today" className="rounded-2xl bg-cell">
      <StatusLine today={today} />
      {hoursOnContract != null && (
        <div className="ml-4 border-t border-sep/60 py-3 pr-4">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="font-semibold">This week</p>
            <p className="text-subhead text-label2">
              <span className="font-semibold text-label">{formatDuration(weekSeconds)}</span> of {hoursOnContract}h
            </p>
          </div>
          <WeekProgress seconds={weekSeconds} hoursOnContract={hoursOnContract} />
        </div>
      )}
    </section>
  );
}

export default TodayCard;
