import { getCurrentSolveStats } from 'src/components/StatsDisplay/util.js';
import { sessionService } from 'src/db/sessionService.js';

export const calculateStats = async (times) => {
  if (times.length === 0) {
    return {};
  }

  const best = times.reduce((min, time) =>
    time.timestamp < min.timestamp ? time : min,
  );

  const last = times[times.length - 1];

  const current = await sessionService.getSolveWithReconstructionBySolveId(last?.id);

  const avg5 = times.length >= 5 && await calculateAverage(times.slice(-5));
  const avg12 = times.length >= 12 && await calculateAverage(times.slice(-12));

  const currentStats = times.length > 1
    ? getCurrentSolveStats(current, times[times.length - 2])
    : getCurrentSolveStats(current);

  return { current, best, avg5, avg12, currentStats };
};

export const calculateAverage = async (times) => {
  if (times.length === 0) return 0;

  if (times.length < 3) {
    return times.reduce((sum, time) => sum + time.timestamp, 0) / times.length;
  }

  let min = times[0];
  let max = times[0];
  let sum = 0;

  times.forEach(time => {
    const val = time.timestamp;
    sum += val;
    if (val < min.timestamp) min = time;
    if (val > max.timestamp) max = time;
  });

  return (sum - min.timestamp - max.timestamp) / (times.length - 2);
};
