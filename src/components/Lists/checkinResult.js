import { formatDuration, isoDate, workedSeconds } from "../../helpers/time";

// What a phone row shows on its right: the time worked, Open with no check-out, or Invalid
// when the check-out comes before the check-in.
export function checkinResult(checkin, now) {
  if (!checkin.checkout_time) return { text: "Open", className: "text-ok" };
  const worked = workedSeconds(checkin, now);
  if (worked === 0) return { text: "Invalid", className: "text-bad" };

  return { text: formatDuration(worked), className: "" };
}

// "09:05 – now" today; an earlier day with no check-out is missing it.
export function checkinTimes(checkin, now) {
  const start = checkin.checkin_time.slice(0, 5);
  if (checkin.checkout_time) return `${start} – ${checkin.checkout_time.slice(0, 5)}`;

  return checkin.checkin_date === isoDate(now) ? `${start} – now` : `${start} – no check-out`;
}
