export const RANGE_PRESETS = [
  { id: 'all', label: 'All' },
  { id: 'count-50', label: 'Last 50' },
  { id: 'count-100', label: 'Last 100' },
  { id: 'count-250', label: 'Last 250' },
];

export function countMoves(moveString) {
  if (!moveString || typeof moveString !== 'string') return 0;
  const moves = moveString.trim().split(/\s+/);
  return moves.filter(move => move !== '').length;
}

export function parseSolveDate(solve) {
  if (!solve?.date) return null;
  const parsed = solve.date instanceof Date ? solve.date : new Date(solve.date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function officialAverageMs(timesMs) {
  if (!timesMs.length) return null;
  if (timesMs.length < 3) {
    return timesMs.reduce((sum, time) => sum + time, 0) / timesMs.length;
  }

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  timesMs.forEach((time) => {
    sum += time;
    if (time < min) min = time;
    if (time > max) max = time;
  });
  return (sum - min - max) / (timesMs.length - 2);
}

export function calculateBestConsecutiveAverage(solves, n) {
  if (!solves || solves.length < n) return null;

  let bestAvg = Infinity;
  let bestStart = 0;

  for (let i = 0; i <= solves.length - n; i++) {
    const avg = officialAverageMs(solves.slice(i, i + n).map(solve => solve.timestamp));
    if (avg != null && avg < bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
  }

  if (bestAvg === Infinity) return null;

  return {
    average: bestAvg / 1000,
    times: solves.slice(bestStart, bestStart + n).map(solve => solve.timestamp),
  };
}

export function rollingOfficialAverageSeconds(solves, n) {
  return solves.map((_, index) => {
    if (index < n - 1) return null;
    const avg = officialAverageMs(solves.slice(index - n + 1, index + 1).map(solve => solve.timestamp));
    return avg == null ? null : Number((avg / 1000).toFixed(3));
  });
}

export function filterSolvesByRange(solves, range) {
  if (!solves.length) return [];
  if (!range || range.id === 'all' || !range.id.startsWith('count-')) return solves;

  const count = Number(range.id.split('-')[1]);
  return Number.isFinite(count) ? solves.slice(-count) : solves;
}

export function buildHistogram(values, { minBins = 5, maxBins = 16, unitDecimals = 1 } = {}) {
  if (!values.length) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return {
      labels: [`${min.toFixed(unitDecimals)}`],
      counts: [values.length],
    };
  }

  let numBins = Math.max(minBins, Math.min(maxBins, Math.ceil(Math.sqrt(values.length) * 1.4)));
  const span = max - min;
  if (span < numBins * 0.2) {
    numBins = Math.max(1, Math.ceil(span / 0.2));
  }

  const binSize = span / numBins;
  const labels = [];
  const counts = [];
  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binSize;
    const binEnd = binStart + binSize;
    labels.push(`${binStart.toFixed(unitDecimals)}–${binEnd.toFixed(unitDecimals)}`);
    counts.push(values.filter(value => (
      value >= binStart && (i === numBins - 1 ? value <= binEnd : value < binEnd)
    )).length);
  }

  return { labels, counts };
}

export function computeSessionSummary(solves) {
  if (!solves.length) {
    return { stats: {}, tpsStats: {} };
  }

  const best = solves.reduce((min, solve) => (solve.timestamp < min.timestamp ? solve : min));
  const worst = solves.reduce((max, solve) => (solve.timestamp > max.timestamp ? solve : max));
  const meanMs = solves.reduce((sum, solve) => sum + solve.timestamp, 0) / solves.length;

  const tpsValues = solves.map(solve => solve.tps).filter(tps => tps > 0);
  let tpsStats = {};
  if (tpsValues.length) {
    const bestTps = solves.reduce((max, solve) => (solve.tps > max.tps ? solve : max));
    const positiveTpsSolves = solves.filter(solve => solve.tps > 0);
    const worstTps = positiveTpsSolves.reduce((min, solve) => (solve.tps < min.tps ? solve : min));
    tpsStats = {
      average: tpsValues.reduce((sum, value) => sum + value, 0) / tpsValues.length,
      best: bestTps,
      worst: worstTps,
    };
  }

  return {
    stats: {
      count: solves.length,
      best,
      worst,
      mean: meanMs / 1000,
    },
    tpsStats,
  };
}

export function computeStepAnalysis(solves) {
  const stepAggregates = {};
  solves.forEach((solve) => {
    solve.reconstructionSteps.forEach((step) => {
      if (!stepAggregates[step.name]) {
        stepAggregates[step.name] = {
          totalMoves: 0,
          count: 0,
          totalEntryDuration: 0,
        };
      }
      stepAggregates[step.name].totalMoves += step.moveCount;
      stepAggregates[step.name].count += 1;
      if (step.entryDurationMs) {
        stepAggregates[step.name].totalEntryDuration += step.entryDurationMs;
      }
    });
  });

  return Object.entries(stepAggregates)
    .map(([name, data]) => ({
      name,
      frequency: data.count,
      avgMoves: data.count > 0 ? data.totalMoves / data.count : 0,
      avgEntryDuration: data.count > 0 && data.totalEntryDuration > 0
        ? data.totalEntryDuration / data.count / 1000
        : 0,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

export function defaultZoomWindow(pointCount, visibleCount = 80) {
  if (pointCount <= visibleCount) {
    return { start: 0, end: 100 };
  }
  const start = ((pointCount - visibleCount) / pointCount) * 100;
  return { start, end: 100 };
}

