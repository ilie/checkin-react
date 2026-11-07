// Dates and durations for the phone screens. The API sends dates as "YYYY-MM-DD" and times as "HH:mm:ss",
// in the staff's time zone, so everything here works in local time.

function pad(number) {
  return String(number).padStart(2, "0");
}

export function isoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "2026-11-04" as local midnight; new Date("2026-11-04") would be UTC.
export function parseDate(isoDateString) {
  const [year, month, day] = isoDateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function addDays(isoDateString, days) {
  const date = parseDate(isoDateString);
  date.setDate(date.getDate() + days);

  return isoDate(date);
}

// Weeks run Monday to Sunday.
export function weekStart(isoDateString) {
  const daysSinceMonday = (parseDate(isoDateString).getDay() + 6) % 7;

  return addDays(isoDateString, -daysSinceMonday);
}

function seconds(time) {
  const [hours, minutes, secs = 0] = time.split(":").map(Number);

  return hours * 3600 + minutes * 60 + secs;
}

// An open check-in counts until now only on its own day; an earlier one is missing its check-out and counts nothing.
// A check-out before the check-in is invalid and counts nothing either.
export function workedSeconds(checkin, now) {
  const start = seconds(checkin.checkin_time);
  if (checkin.checkout_time) return Math.max(0, seconds(checkin.checkout_time) - start);
  if (checkin.checkin_date !== isoDate(now)) return 0;

  return Math.max(0, now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() - start);
}

export function totalSeconds(checkins, now) {
  return checkins.reduce((total, checkin) => total + workedSeconds(checkin, now), 0);
}

// Seconds worked on each day from Monday `start` to Sunday, for desktop's week chart.
export function dailySeconds(checkins, start, now) {
  return Array.from({ length: 7 }, (_, day) =>
    totalSeconds(
      checkins.filter((checkin) => checkin.checkin_date === addDays(start, day)),
      now,
    ),
  );
}

// "55m", "8h 00m" or "37h 30m".
export function formatDuration(totalSecs) {
  const minutes = Math.floor(totalSecs / 60);
  const hours = Math.floor(minutes / 60);

  return hours > 0 ? `${hours}h ${pad(minutes % 60)}m` : `${minutes}m`;
}

// "09:05:00" becomes "09:05".
export function shortTime(time) {
  return time.slice(0, 5);
}

// "Fri 23 Oct".
export function shortDate(isoDateString) {
  return parseDate(isoDateString).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// "Wednesday 4 November".
export function longDate(date) {
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function greeting(date) {
  if (date.getHours() < 12) return "Good morning";
  if (date.getHours() < 18) return "Good afternoon";

  return "Good evening";
}

// Splits rows sorted newest first into Monday-to-Sunday weeks, keeping their order: [{ start, checkins }].
export function groupByWeek(checkins) {
  const weeks = [];
  for (const checkin of checkins) {
    const start = weekStart(checkin.checkin_date);
    if (weeks.at(-1)?.start !== start) weeks.push({ start, checkins: [] });
    weeks.at(-1).checkins.push(checkin);
  }

  return weeks;
}

function dayMonth(date, withYear) {
  const options = { day: "numeric", month: "short" };
  if (withYear) options.year = "numeric";

  return date.toLocaleDateString("en-GB", options);
}

// "2–8 Nov", "26 Oct–1 Nov", or with the year outside the current one: "22–28 Dec 2025".
function weekRange(start, today) {
  const first = parseDate(start);
  const last = parseDate(addDays(start, 6));
  const thisYear = parseDate(today).getFullYear();
  const end = dayMonth(last, last.getFullYear() !== thisYear);
  if (first.getMonth() === last.getMonth()) return `${first.getDate()}–${end}`;

  return `${dayMonth(first, first.getFullYear() !== last.getFullYear())}–${end}`;
}

export function weekLabel(start, today) {
  const thisWeek = weekStart(today);
  if (start === thisWeek) return `This week · ${weekRange(start, today)}`;
  if (start === addDays(thisWeek, -7)) return `Last week · ${weekRange(start, today)}`;

  return weekRange(start, today);
}
