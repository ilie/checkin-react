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
  const hours = hh < 10 ? "0" + hh : hh;
  const minutes = mm < 10 ? "0" + mm : mm;
  const seconds = ss < 10 ? "0" + ss : ss;
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  return formattedTime;
};
