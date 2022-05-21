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
  const date = new Date(givenDate);
  const day = add0(date.getDate());
  const month = add0(date.getMonth());
  const year = add0(date.getFullYear());
  return (`${day}/${month}/${year}`);
}
