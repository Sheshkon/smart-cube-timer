/**
 * Format milliseconds time into a readable string (MM:SS.ms)
 */
export const formatTime = (timeMs) => {
  if (!timeMs) return '00:00.000';

  // Convert milliseconds to parts
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = timeMs % 1000;

  // Format with leading zeros
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedMs = ms.toString().padStart(3, '0');

  return `${formattedMinutes}:${formattedSeconds}.${formattedMs}`;
};

export const ganTimeToMilliseconds = (time) =>
  time.minutes * 60 * 1000 + time.seconds * 1000 + time.milliseconds;
