const add0 = (number) => {
  return number < 10 ? "0" + number : number;
}

export const getFormattedTimeDiff = (startTime, endTime) => {
  let diff = Math.abs(endTime - startTime);
  let ms = diff % 1000;
  diff = (diff - ms) / 1000;
  const ss = diff % 60;
  diff = (diff - ss) / 60;
  const mm = diff % 60;
  diff = (diff - mm) / 60;
  const hh = diff % 24;

  if (isNaN(hh) || isNaN(mm) || isNaN(ss)) {
    return "Checkin Incomplete";
  }

  const hours = add0(hh);
  const minutes = add0(mm);
  const seconds = add0(ss);
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  return formattedTime;
};

export const formatDateToES = (givenDate) => {
  const date = new Date(givenDate).toLocaleString('en-GB', {
    year: "numeric",
    month: 'numeric',
    day: 'numeric'
  });
  return date
}

export const formatDateToSQL = (givenDate) => {
  const offset = givenDate.getTimezoneOffset();
  const date = new Date(givenDate.getTime() - offset * 60 * 1000);
  return date.toISOString().split('T')[0] ;
}

export const formatTimeToSQL = (timeValue) => {
  if (!timeValue) return null;

  if (typeof timeValue === 'string') {
    const trimmed = timeValue.trim();

    if (trimmed === '') return null;

    const parts = trimmed.split(':');

    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return null;
      }

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return null;
      }

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }

  return null;
}
