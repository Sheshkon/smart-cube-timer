export const ganTimeToMilliseconds = (time) =>
  time.minutes * 60 * 1000 + time.seconds * 1000 + time.milliseconds;


export const formatTime = (milliseconds) => {
  if (!milliseconds) return '00:00.000';

  const ms = parseInt(milliseconds);
  if (isNaN(ms)) return '--';

  const date = new Date(ms);
  return date.getMinutes() > 0
    ? `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`
    : `${date.getSeconds()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
};