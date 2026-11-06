import { formatDuration, isoDate, shortDate, shortTime, totalSeconds, workedSeconds } from "../../../helpers/time";

// The latest valid check-out among the rows, for "Last check-out Tue 3 Nov at 17:00".
function lastCheckout(checkins, now) {
  const done = checkins.filter((checkin) => checkin.checkout_time && workedSeconds(checkin, now) > 0);

  return done.reduce(
    (latest, checkin) =>
      !latest || `${checkin.checkin_date}${checkin.checkout_time}` > `${latest.checkin_date}${latest.checkout_time}`
        ? checkin
        : latest,
    null,
  );
}

function todayStatus(status, week, now) {
  const today = week.filter((checkin) => checkin.checkin_date === isoDate(now));
  const worked = formatDuration(totalSeconds(today, now));
  const current = week.find((checkin) => checkin.id === String(status.checkinId));

  if (status.status === "checkin" && current) {
    return { isOpen: true, title: `Clocked in since ${shortTime(current.checkin_time)}`, detail: `${worked} so far today` };
  }
  // After a clock-out the status can arrive before the week's rows, which still show the check-in open.
  if (current?.checkout_time) {
    return { isOpen: false, title: `Clocked out at ${shortTime(current.checkout_time)}`, detail: `${worked} today` };
  }
  const last = lastCheckout(week, now);

  return {
    isOpen: false,
    title: "Not clocked in today",
    detail: last && `Last check-out ${shortDate(last.checkin_date)} at ${shortTime(last.checkout_time)}`,
  };
}

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
