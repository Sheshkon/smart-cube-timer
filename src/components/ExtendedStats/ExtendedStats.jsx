import React, { useEffect, useMemo, useState } from 'react';

function useCoarsePointer() {
  const [coarsePointer, setCoarsePointer] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  ));

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)');
    const onChange = () => setCoarsePointer(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return coarsePointer;
}

import db from 'src/db/db.js';
import { sessionService } from 'src/db/sessionService.js';
import { useSettings } from 'src/hooks/useSettings.js';
import { formatTime } from 'src/utils/time.js';

import EChart from './EChart.jsx';
import {
  buildBarOption,
  buildMethodPieOption,
  buildProgressionOption,
  buildScatterOption,
  buildStepMovesOption,
} from './chartOptions.js';
import { readChartTheme } from './chartTheme.js';
import {
  RANGE_PRESETS,
  buildHistogram,
  calculateBestConsecutiveAverage,
  computeSessionSummary,
  computeStepAnalysis,
  countMoves,
  filterSolvesByRange,
} from './statsUtils.js';

const ExtendedStats = () => {
  const { settings } = useSettings();
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [processedSolves, setProcessedSolves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rangeId, setRangeId] = useState('all');
  const [showAo5, setShowAo5] = useState(true);
  const [showAo12, setShowAo12] = useState(true);
  const coarsePointer = useCoarsePointer();
  const [chartTheme, setChartTheme] = useState(() => ({
    ...readChartTheme(),
    coarsePointer,
  }));

  useEffect(() => {
    setChartTheme({
      ...readChartTheme(),
      coarsePointer,
    });
  }, [settings.theme, settings.accentColor, settings.backgroundColor, coarsePointer]);

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const allSessions = await sessionService.getAllSessions();
        setSessions(allSessions);
        if (allSessions.length > 0) {
          setSelectedSessionId(Number(settings.selectedSessionId) || allSessions[0].id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setProcessedSolves([]);
      setIsLoading(false);
      return;
    }

    const loadAndProcessData = async () => {
      setIsLoading(true);
      try {
        const sessionSolvesRaw = await db.solves.where('sessionId').equals(selectedSessionId).sortBy('date');
        const solveIds = sessionSolvesRaw.map(solve => solve.id);
        let allReconstructionStepsRaw = [];
        if (solveIds.length > 0) {
          allReconstructionStepsRaw = await db.reconstructionSteps.where('solveId').anyOf(solveIds).toArray();
        }

        const stepsBySolveId = allReconstructionStepsRaw.reduce((acc, step) => {
          if (!acc[step.solveId]) acc[step.solveId] = [];
          acc[step.solveId].push(step);
          return acc;
        }, {});

        const currentProcessedSolves = sessionSolvesRaw.map((solve) => {
          const solveTimeSeconds = solve.timestamp / 1000;
          const moveCount = countMoves(solve.solution);
          const tps = solveTimeSeconds > 0 ? (moveCount / solveTimeSeconds) : 0;
          const stepsForThisSolve = (stepsBySolveId[solve.id] || [])
            .map(step => ({
              ...step,
              moveCount: countMoves(step.moves),
              entryDurationMs: step.endTime - step.startTime,
            }))
            .sort((a, b) => a.startTime - b.startTime);

          return {
            ...solve,
            solveTimeSeconds,
            moveCount,
            tps,
            reconstructionSteps: stepsForThisSolve,
          };
        });

        setProcessedSolves(currentProcessedSolves);
      } catch (error) {
        console.error('Failed to load and process session data:', error);
        setProcessedSolves([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndProcessData();
  }, [selectedSessionId]);

  const filteredSolves = useMemo(
    () => filterSolvesByRange(processedSolves, { id: rangeId }),
    [processedSolves, rangeId],
  );

  const { stats, tpsStats } = useMemo(() => computeSessionSummary(filteredSolves), [filteredSolves]);
  const bestAo5 = useMemo(() => calculateBestConsecutiveAverage(filteredSolves, 5), [filteredSolves]);
  const bestAo12 = useMemo(() => calculateBestConsecutiveAverage(filteredSolves, 12), [filteredSolves]);
  const bestAo100 = useMemo(() => calculateBestConsecutiveAverage(filteredSolves, 100), [filteredSolves]);
  const stepAnalysis = useMemo(() => computeStepAnalysis(filteredSolves), [filteredSolves]);

  const timeDistribution = useMemo(
    () => buildHistogram(filteredSolves.map(solve => solve.solveTimeSeconds)),
    [filteredSolves],
  );
  const tpsDistribution = useMemo(
    () => buildHistogram(filteredSolves.map(solve => solve.tps).filter(tps => tps > 0), { unitDecimals: 1 }),
    [filteredSolves],
  );
  const methodDistribution = useMemo(() => {
    if (!filteredSolves.length) return null;
    const methodCounts = filteredSolves.reduce((acc, solve) => {
      const method = solve?.reconstruction?.method || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(methodCounts).map(([method, count]) => ({
      name: method,
      value: count,
    }));
  }, [filteredSolves]);

  const progressionOption = useMemo(() => {
    if (filteredSolves.length < 2) return null;
    return buildProgressionOption({
      solves: filteredSolves,
      showAo5,
      showAo12,
      theme: chartTheme,
    });
  }, [filteredSolves, showAo5, showAo12, chartTheme]);

  const timeDistOption = useMemo(() => {
    if (!timeDistribution) return null;
    return buildBarOption({
      labels: timeDistribution.labels,
      counts: timeDistribution.counts,
      theme: chartTheme,
      color: chartTheme.series.bars,
    });
  }, [timeDistribution, chartTheme]);

  const tpsDistOption = useMemo(() => {
    if (!tpsDistribution) return null;
    return buildBarOption({
      labels: tpsDistribution.labels,
      counts: tpsDistribution.counts,
      theme: chartTheme,
      color: chartTheme.series.tps,
    });
  }, [tpsDistribution, chartTheme]);

  const methodOption = useMemo(() => {
    if (!methodDistribution?.length) return null;
    return buildMethodPieOption({ data: methodDistribution, theme: chartTheme });
  }, [methodDistribution, chartTheme]);

  const scatterOption = useMemo(() => {
    if (!filteredSolves.length) return null;
    return buildScatterOption({
      points: filteredSolves.map(solve => [
        Number(solve.solveTimeSeconds.toFixed(2)),
        Number(solve.tps.toFixed(2)),
      ]),
      theme: chartTheme,
    });
  }, [filteredSolves, chartTheme]);

  const stepMovesOption = useMemo(() => {
    if (!stepAnalysis.length) return null;
    return buildStepMovesOption({ steps: stepAnalysis, theme: chartTheme });
  }, [stepAnalysis, chartTheme]);

  if (isLoading && (!sessions.length || !selectedSessionId)) {
    return (
      <div className="text-center">Loading sessions...</div>
    );
  }

  if (!selectedSessionId && sessions.length === 0 && !isLoading) {
    return (
      <div className="extended-stats">
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">No sessions available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="extended-stats">
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="session-select" className="block text-sm font-medium mb-1 opacity-80">
            Session
          </label>
          <select
            id="session-select"
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            className="block w-full px-3 py-2 rounded-md"
            disabled={isLoading || sessions.length === 0}
          >
            {sessions.map(session => (
              <option key={session.id} value={session.id}>{session.name}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="block text-sm font-medium mb-1 opacity-80">Solves</div>
          <div className="flex flex-wrap gap-2">
            {RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setRangeId(preset.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  rangeId === preset.id ? 'app-btn-accent' : 'app-btn'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && selectedSessionId && (
        <div className="text-center py-5">Loading statistics for session...</div>
      )}

      {!isLoading && processedSolves.length === 0 && selectedSessionId && (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">No solves in this session.</p>
        </div>
      )}

      {!isLoading && processedSolves.length > 0 && filteredSolves.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-400">No solves in the selected range.</p>
        </div>
      )}

      {!isLoading && filteredSolves.length > 0 && (
        <>
          <p className="text-sm opacity-70 mb-4">
            Showing {filteredSolves.length} of {processedSolves.length} solves{rangeId !== 'all' ? ' in the selected range' : ''}.
            {coarsePointer
              ? ' Scroll the page as usual; drag the slider under a chart to pick a time window.'
              : ' Use the slider under a chart, or scroll the wheel over it, to inspect a window.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Best Ao5"
              value={bestAo5?.average}
              times={bestAo5?.times}
              available={filteredSolves.length >= 5}
            />
            <StatCard
              title="Best Ao12"
              value={bestAo12?.average}
              times={bestAo12?.times}
              available={filteredSolves.length >= 12}
            />
            <StatCard
              title="Best Ao100"
              value={bestAo100?.average}
              times={bestAo100?.times}
              available={filteredSolves.length >= 100}
            />
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Session Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatBox title="Solves in range" value={stats.count || 0} />
              <StatBox title="Best Time" value={stats.best ? formatTime(stats.best.timestamp) : '-'} />
              <StatBox title="Worst Time" value={stats.worst ? formatTime(stats.worst.timestamp) : '-'} />
              <StatBox title="Mean Time" value={stats.mean ? formatTime(stats.mean * 1000) : '-'} />
              <StatBox title="Average TPS" value={tpsStats.average ? tpsStats.average.toFixed(2) : '-'} />
              <StatBox
                title="Best TPS"
                value={tpsStats.best ? `${tpsStats.best.tps.toFixed(2)} (${formatTime(tpsStats.best.timestamp)})` : '-'}
              />
              <StatBox
                title="Worst TPS"
                value={tpsStats.worst ? `${tpsStats.worst.tps.toFixed(2)} (${formatTime(tpsStats.worst.timestamp)})` : '-'}
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-xl font-semibold">Progression</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowAo5(value => !value)}
                  className={`rounded-full px-3 py-1.5 text-sm ${showAo5 ? 'app-btn-accent' : 'app-btn'}`}
                >
                  Ao5
                </button>
                <button
                  type="button"
                  onClick={() => setShowAo12(value => !value)}
                  className={`rounded-full px-3 py-1.5 text-sm ${showAo12 ? 'app-btn-accent' : 'app-btn'}`}
                >
                  Ao12
                </button>
              </div>
            </div>

            {progressionOption ? (
              <ChartCard title="Solve time over the selected range">
                <EChart option={progressionOption} height={380} />
              </ChartCard>
            ) : (
              <ChartPlaceholder message="Need at least two solves for the progress chart." />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {timeDistOption ? (
              <ChartCard title="Solve Time Distribution">
                <EChart option={timeDistOption} height={320} />
              </ChartCard>
            ) : (
              <ChartPlaceholder message="Not enough data for time distribution." />
            )}

            {methodOption ? (
              <ChartCard title="Method Usage">
                <EChart option={methodOption} height={320} />
              </ChartCard>
            ) : (
              <ChartPlaceholder message="No method data." />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {tpsDistOption ? (
              <ChartCard title="TPS Distribution">
                <EChart option={tpsDistOption} height={320} />
              </ChartCard>
            ) : (
              <ChartPlaceholder message="Not enough data for TPS distribution." />
            )}

            {scatterOption ? (
              <ChartCard title="TPS vs. Solve Time">
                <EChart option={scatterOption} height={320} />
              </ChartCard>
            ) : (
              <ChartPlaceholder message="Not enough data for TPS vs Time." />
            )}
          </div>

          {stepAnalysis.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Reconstruction Step Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="overflow-x-auto app-inset p-4 rounded-lg">
                  <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
                    <thead className="opacity-90">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Step</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Frequency</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Avg. Moves</th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Avg. Time (s)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                      {stepAnalysis.map(step => (
                        <tr key={step.name}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{step.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm opacity-80">{step.frequency}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm opacity-80">{step.avgMoves.toFixed(1)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm opacity-80">
                            {step.avgEntryDuration > 0 ? step.avgEntryDuration.toFixed(2) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {stepMovesOption && (
                  <ChartCard title="Average moves per step">
                    <EChart option={stepMovesOption} height={Math.max(280, stepAnalysis.length * 28)} />
                  </ChartCard>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatCard = ({ title, value, times, available }) => (
  <div className={`app-card p-4 rounded-lg ${available ? '' : 'opacity-70'}`}>
    <h3 className="font-medium">{title}</h3>
    <p className="text-3xl font-mono font-bold my-2">
      {available ? (typeof value === 'number' ? value.toFixed(2) : (value || '-')) : '-'}
    </p>
    {available && times && times.length > 0 && (
      <div className="text-xs opacity-70 truncate" title={times.map(time => formatTime(time)).join(', ')}>
        Solves: {times.map(time => formatTime(time)).join(', ')}
      </div>
    )}
    {!available && (
      <div className="text-xs opacity-70">Not enough solves</div>
    )}
  </div>
);

const StatBox = ({ title, value }) => (
  <div className="app-card p-3 rounded-lg">
    <h4 className="text-sm font-medium opacity-80">{title}</h4>
    <p className="text-xl font-mono">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="app-card p-4 rounded-lg">
    <h4 className="text-lg font-medium mb-3 text-center">{title}</h4>
    {children}
  </div>
);

const ChartPlaceholder = ({ message }) => (
  <div className="app-card p-4 rounded-lg flex items-center justify-center h-[320px]">
    <p className="text-center opacity-70">{message}</p>
  </div>
);

export default ExtendedStats;
