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

function todaysCheckins(week, now) {
  return week.filter((checkin) => checkin.checkin_date === isoDate(now));
}

// Today's status line, on the phone's Today card and desktop's clock card. `week` holds this week's check-ins.
export function todayStatus(status, week, now) {
  const worked = formatDuration(totalSeconds(todaysCheckins(week, now), now));
  const current = week.find((checkin) => checkin.id === String(status.checkinId));

  if (status.status === "checkin" && current) {
    return {
      isOpen: true,
      title: `Clocked in since ${shortTime(current.checkin_time)}`,
      detail: `${worked} so far today`,
    };
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

// In, Out and Worked for desktop: today's latest check-in and today's total. Null before the first check-in of the day.
export function todayTimes(week, now) {
  const today = todaysCheckins(week, now);
  if (today.length === 0) return null;
  const latest = today.reduce((last, checkin) => (checkin.checkin_time > last.checkin_time ? checkin : last));

  return {
    in: shortTime(latest.checkin_time),
    out: latest.checkout_time ? shortTime(latest.checkout_time) : "—",
    worked: formatDuration(totalSeconds(today, now)),
  };
}
