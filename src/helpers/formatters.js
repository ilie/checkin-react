function pad(number) {
  return String(number).padStart(2, "0");
}

export function getFormattedTimeDiff(startTime, endTime) {
  const totalSeconds = Math.floor(Math.abs(endTime - startTime) / 1000);

  if (isNaN(totalSeconds)) {
    return "Checkin Incomplete";
  }

  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDateToES(givenDate) {
  return new Date(givenDate).toLocaleString("en-GB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export function formatTimeToSQL(timeValue) {
  // The time field always gives a string ("HH:mm" or "HH:mm:ss") or null.
  const trimmed = timeValue?.trim();

  if (!trimmed) return null;

  const parts = trimmed.split(":");

  if (parts.length < 2) return null;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return null;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    return null;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
