import { mergeConsecutiveWords } from 'src/utils/string.js';
import { formatTime } from 'src/utils/time.js';

export default class StatsResult {
  constructor(originalTime, time, reconstruction) {
    this.originalTime = originalTime;
    this.formattedTime = time;
    this.reconstruction = reconstruction;
  }

  toString() {
    return `Original Time: ${this.originalTime}, Time: ${this.formattedTime}, Scramble: ${this?.reconstruction?.scramble?.plain}, Solution: ${this?.reconstruction?.solution?.plain}`;
  }
}

export const getCurrentSolveStats = (lastSolve, preLastSolve) => {
  const movesCount = lastSolve.solution?.split(' ')?.length;
  const tps = getTPS(lastSolve.timestamp, movesCount);

  const stats = {
    movesCount,
    tps,
  };

  if (!preLastSolve)
    return stats;

  const timestampDiff =
    lastSolve.timestamp - preLastSolve.timestamp;

  const formattedTimeDiff = {
    formattedTime: formatTime(Math.abs(timestampDiff)),
    sign: Math.sign(timestampDiff),
  };

  return {
    ...stats,
    formattedTimeDiff,
  };
};

export const formatSolveData = (solve) => {
  const movesCount = solve.solution.split(' ').length;
  const tps = getTPS(solve.timestamp, movesCount);
  const dateObj = new Date(solve.date);
  const formattedDate = dateObj.toLocaleString();
  const reconstruction = formatReconstruction(solve?.reconstruction);

  return `𝙏𝙞𝙢𝙚: ${solve.time}
𝙈𝙤𝙫𝙚𝙨: ${movesCount}
𝙏𝙋𝙎: ${tps}
𝘿𝙖𝙩𝙚: ${formattedDate}
𝙎𝙘𝙧𝙖𝙢𝙗𝙡𝙚: ${solve.scramble}
𝙎𝙤𝙡𝙪𝙩𝙞𝙤𝙣: ${solve?.solution}
𝙍𝙚𝙘𝙤𝙣𝙨𝙩𝙧𝙪𝙘𝙩𝙞𝙤𝙣: ${reconstruction}`;
};

const getTPS = (timeMls, movesCount) =>
  ((movesCount * 1.0) / Math.floor(timeMls / 1000)).toFixed(1);

const formatReconstruction = (reconstruction) => {
  if (!reconstruction || !reconstruction.method || !reconstruction.steps) {
    return 'Invalid reconstruction data';
  }

  const { method, steps } = reconstruction;

  const stepsText = Object.entries(steps)
    .map(([stepName, stepData]) => {
      if (!stepData.found) return null;

      let stepLine = `${stepName}: ${mergeConsecutiveWords(stepData.plain)}`;

      if (stepData.endTime !== null) {
        const duration = ((stepData.endTime - stepData.startTime) / 1000).toFixed(3);
        stepLine += ` (${duration}s)`;
      }

      return stepLine;
    })
    .filter(Boolean)
    .join('\n');

  return `\n𝙈𝙚𝙩𝙝𝙤𝙙: ${method}
${stepsText}`;
};
