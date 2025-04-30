import { formatTime } from 'src/utils/time.js';

export default class StatsResult {
  constructor(originalTime, time, scramble, solution, plainSolution) {
    this.originalTime = originalTime;
    this.formattedTime = time;
    this.scramble = scramble;
    this.solution = solution;
    this.plainSolution = plainSolution;
  }

  toString() {
    return `Original Time: ${this.originalTime}, Time: ${this.formattedTime}, Scramble: ${this.scramble}, Solution: ${this.solution}, Plain Solution: ${this.plainSolution}`;
  }
}

export const getCurrentSolveStats = (lastSolve, preLastSolve) => {

  const movesCount = lastSolve.solution?.split(' ')?.length;
  const tps = getTPS(lastSolve.originalTime.asTimestamp, movesCount);

  const stats = {
    movesCount,
    tps
  };

  if (!preLastSolve)
    return stats;

  const timestampDiff =
    lastSolve.originalTime.asTimestamp - preLastSolve.originalTime.asTimestamp;

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
  console.log(solve);
  const movesCount = solve.solution.split(' ').length;
  const tps = getTPS(solve.originalTime.asTimestamp, movesCount);
  const dateObj = new Date(solve.date);
  const formattedDate = dateObj.toLocaleString();

  return `Time: ${solve.formattedTime}
Date: ${formattedDate}
Scramble: ${solve.scramble}
Solution: ${solve?.solution}
Moves: ${movesCount}
TPS: ${tps}`;
};

const getTPS = (timeMls, movesCount) =>
  ((movesCount * 1.0) / Math.floor(timeMls / 1000)).toFixed(1);
