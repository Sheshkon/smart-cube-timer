import React, { useEffect, useMemo, useState } from 'react';

import { BarChart, LineChart, PieChart, ScatterChart } from '@mui/x-charts';
import { FiArrowLeft } from 'react-icons/fi';
import db from 'src/db/db.js';
import { sessionService } from 'src/db/sessionService.js';
import { useSettings } from 'src/hooks/useSettings.js'; // Keep for other functions if needed, or rely on direct db access
import { formatTime } from 'src/utils/time.js';

const projectBaseUrl = import.meta.env.BASE_URL;

// Helper function to count moves from a space-separated string
function countMoves(moveString) {
  if (!moveString || typeof moveString !== 'string') return 0;
  const moves = moveString.trim().split(/\s+/);
  return moves.filter(move => move !== '').length;
}

const ExtendedStats = ({ onClose, navigate }) => {
  const { settings } = useSettings();
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [processedSolves, setProcessedSolves] = useState([]); // Solves with TPS, move counts, and processed steps
  const [stats, setStats] = useState({}); // Basic time stats
  const [tpsStats, setTpsStats] = useState({}); // TPS specific stats
  const [isLoading, setIsLoading] = useState(true);

  const [timeDistributionData, setTimeDistributionData] = useState(null);
  const [methodDistributionData, setMethodDistributionData] = useState(null);
  const [solvesOverTimeData, setSolvesOverTimeData] = useState(null);
  const [tpsDistributionData, setTpsDistributionData] = useState(null);
  const [tpsVsTimeData, setTpsVsTimeData] = useState(null);
  const [avgMovesPerStepData, setAvgMovesPerStepData] = useState(null);
  const [stepFrequencyData, setStepFrequencyData] = useState(null);
  const [stepAnalysis, setStepAnalysis] = useState(null);

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

  // Load and process solves and reconstruction steps when session changes
  useEffect(() => {
    if (!selectedSessionId) {
      setProcessedSolves([]);
      setStats({});
      setTpsStats({});
      setTimeDistributionData(null);
      setMethodDistributionData(null);
      setSolvesOverTimeData(null);
      setTpsDistributionData(null);
      setTpsVsTimeData(null);
      setAvgMovesPerStepData(null);
      setStepFrequencyData(null);
      setStepAnalysis(null);
      setIsLoading(false);
      return;
    }

    const loadAndProcessData = async () => {
      setIsLoading(true);
      try {
        const sessionSolvesRaw = await db.solves.where('sessionId').equals(selectedSessionId).sortBy('date');
        const solveIds = sessionSolvesRaw.map(s => s.id);
        let allReconstructionStepsRaw = [];
        if (solveIds.length > 0) {
          allReconstructionStepsRaw = await db.reconstructionSteps.where('solveId').anyOf(solveIds).toArray();
        }

        const currentProcessedSolves = sessionSolvesRaw.map(solve => {
          const solveTimeSeconds = solve.timestamp / 1000;
          const moveCount = countMoves(solve.solution);
          const tps = solveTimeSeconds > 0 ? (moveCount / solveTimeSeconds) : 0;

          const stepsForThisSolve = allReconstructionStepsRaw
            .filter(step => step.solveId === solve.id)
            .map(step => ({
              ...step,
              moveCount: countMoves(step.moves),
              // Duration of reconstruction entry, not actual solve step duration from this data
              entryDurationMs: step.endTime - step.startTime,
            }))
            .sort((a, b) => a.startTime - b.startTime); // ensure steps are somewhat ordered if needed

          return {
            ...solve,
            solveTimeSeconds,
            moveCount,
            tps,
            reconstructionSteps: stepsForThisSolve,
          };
        });
        setProcessedSolves(currentProcessedSolves);

        if (currentProcessedSolves.length > 0) {
          // Basic Time Stats
          const timesInMilliseconds = currentProcessedSolves.map(s => s.timestamp);
          const bestSolveFull = currentProcessedSolves.reduce((min, s) => s.timestamp < min.timestamp ? s : min);
          const worstSolveFull = currentProcessedSolves.reduce((max, s) => s.timestamp > max.timestamp ? s : max);
          const meanTimeMs = timesInMilliseconds.reduce((sum, t) => sum + t, 0) / timesInMilliseconds.length;
          setStats({
            best: bestSolveFull,
            worst: worstSolveFull,
            mean: meanTimeMs / 1000,
            count: currentProcessedSolves.length,
          });

          // TPS Stats
          const tpsValues = currentProcessedSolves.map(s => s.tps).filter(tps => tps > 0);
          if (tpsValues.length > 0) {
            const avgTps = tpsValues.reduce((sum, val) => sum + val, 0) / tpsValues.length;
            const bestTpsSolve = currentProcessedSolves.reduce((max, s) => s.tps > max.tps ? s : max);
            const worstTpsSolve = currentProcessedSolves.filter(s => s.tps > 0).reduce((min, s) => s.tps < min.tps ? s : min, { tps: Infinity });
            setTpsStats({
              average: avgTps,
              best: bestTpsSolve,
              worst: worstTpsSolve.tps === Infinity ? null : worstTpsSolve,
            });
          } else {
            setTpsStats({});
          }


          // Chart Data Generation
          // 1. Time Distribution
          const timesInSeconds = currentProcessedSolves.map(s => s.solveTimeSeconds);
          const timeDistChart = { labels: [], counts: [] };
          const minT = Math.min(...timesInSeconds);
          const maxT = Math.max(...timesInSeconds);
          let numBins = 10;
          if (maxT - minT > 0) {
            numBins = Math.max(5, Math.min(15, Math.ceil(Math.sqrt(timesInSeconds.length) * 1.5)));
            if ((maxT - minT) < numBins * 0.5) numBins = Math.max(1, Math.ceil((maxT - minT) / 0.2));
          }
          numBins = Math.max(1, numBins);
          if (minT === maxT && timesInSeconds.length > 0) {
            timeDistChart.labels.push(`${minT.toFixed(2)}s`);
            timeDistChart.counts.push(timesInSeconds.length);
          } else if (timesInSeconds.length > 0) {
            const binSize = (maxT - minT) / numBins;
            for (let i = 0; i < numBins; i++) {
              const binStart = minT + i * binSize;
              const binEnd = binStart + binSize;
              timeDistChart.labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}s`);
              timeDistChart.counts.push(timesInSeconds.filter(t => t >= binStart && (i === numBins - 1 ? t <= binEnd : t < binEnd)).length);
            }
          }
          setTimeDistributionData(timeDistChart.labels.length > 0 ? timeDistChart : null);

          // 2. Method Distribution
          const methodCounts = currentProcessedSolves.reduce((acc, solve) => {
            const method = solve.reconstruction?.method || 'Unknown';
            acc[method] = (acc[method] || 0) + 1;
            return acc;
          }, {});
          const pieData = Object.entries(methodCounts).map(([method, count]) => ({
            id: method,
            value: count,
            label: `${method} (${((count / currentProcessedSolves.length) * 100).toFixed(0)}%)`,
          }));
          setMethodDistributionData(pieData.length > 0 ? pieData : null);

          // 3. Solves Over Time (Time progression)
          setSolvesOverTimeData({
            times: currentProcessedSolves.map(s => parseFloat(s.solveTimeSeconds.toFixed(2))),
            xAxis: currentProcessedSolves.map((_, index) => index + 1),
          });

          // 4. TPS Distribution
          const tpsDistChart = { labels: [], counts: [] };
          if (tpsValues.length > 0) {
            const minTPS = Math.min(...tpsValues);
            const maxTPS = Math.max(...tpsValues);
            let numTPSBins = 10;
            if (maxTPS - minTPS > 0) {
              numTPSBins = Math.max(5, Math.min(12, Math.ceil(Math.sqrt(tpsValues.length) * 1.2)));
              if ((maxTPS - minTPS) < numTPSBins * 0.2) numTPSBins = Math.max(1, Math.ceil((maxTPS - minTPS) / 0.1));
            }
            numTPSBins = Math.max(1, numTPSBins);

            if (minTPS === maxTPS) {
              tpsDistChart.labels.push(`${minTPS.toFixed(1)} TPS`);
              tpsDistChart.counts.push(tpsValues.length);
            } else {
              const binSizeTPS = (maxTPS - minTPS) / numTPSBins;
              for (let i = 0; i < numTPSBins; i++) {
                const binStart = minTPS + i * binSizeTPS;
                const binEnd = binStart + binSizeTPS;
                tpsDistChart.labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
                tpsDistChart.counts.push(tpsValues.filter(t => t >= binStart && (i === numTPSBins - 1 ? t <= binEnd : t < binEnd)).length);
              }
            }
          }
          setTpsDistributionData(tpsDistChart.labels.length > 0 ? tpsDistChart : null);


          // 5. TPS vs Time Scatter Plot
          setTpsVsTimeData(
            currentProcessedSolves.map(s => ({
              id: s.id,
              x: parseFloat(s.solveTimeSeconds.toFixed(2)),
              y: parseFloat(s.tps.toFixed(2)),
            })),
          );

          // 6. Step Analysis (Moves and Frequency)
          const stepAggregates = {};
          currentProcessedSolves.forEach(solve => {
            solve.reconstructionSteps.forEach(step => {
              if (!stepAggregates[step.name]) {
                stepAggregates[step.name] = {
                  totalMoves: 0,
                  count: 0,
                  totalEntryDuration: 0, // Duration of entering reconstruction data
                };
              }
              stepAggregates[step.name].totalMoves += step.moveCount;
              stepAggregates[step.name].count += 1;
              if (step.entryDurationMs) {
                stepAggregates[step.name].totalEntryDuration += step.entryDurationMs;
              }
            });
          });

          const stepAnalysisResults = Object.entries(stepAggregates).map(([name, data]) => ({
            name,
            avgMoves: data.count > 0 ? (data.totalMoves / data.count) : 0,
            // frequency: data.count,
            avgEntryDuration: data.count > 0 && data.totalEntryDuration > 0 ? (data.totalEntryDuration / data.count / 1000) : 0, // in seconds
          }));
          // .sort((a, b) => b.frequency - a.frequency); // Sort by frequency for display

          setStepAnalysis(stepAnalysisResults);

          if (stepAnalysisResults.length > 0) {
            setAvgMovesPerStepData({
              labels: stepAnalysisResults.map(s => s.name),
              series: [{ data: stepAnalysisResults.map(s => parseFloat(s.avgMoves.toFixed(1))), label: 'Avg Moves' }],
            });
            setStepFrequencyData(
              stepAnalysisResults.map(s => ({ id: s.name, value: s.frequency, label: `${s.name} (${s.frequency})` })),
            );
          } else {
            setAvgMovesPerStepData(null);
            setStepFrequencyData(null);
          }


        } else { // No solves
          setStats({});
          setTpsStats({});
          setTimeDistributionData(null);
          setMethodDistributionData(null);
          setSolvesOverTimeData(null);
          setTpsDistributionData(null);
          setTpsVsTimeData(null);
          setAvgMovesPerStepData(null);
          setStepFrequencyData(null);
          setStepAnalysis(null);
        }
      } catch (error) {
        console.error('Failed to load and process session data:', error);
        // Reset states on error
        setProcessedSolves([]);
        setStats({});
        setTpsStats({});
        // ... reset other chart data states
      } finally {
        setIsLoading(false);
      }
    };

    loadAndProcessData();
  }, [selectedSessionId]);

  const bestAo5 = useMemo(() => calculateBestConsecutiveAverage(processedSolves, 5), [processedSolves]);
  const bestAo12 = useMemo(() => calculateBestConsecutiveAverage(processedSolves, 12), [processedSolves]);
  const bestAo100 = useMemo(() => calculateBestConsecutiveAverage(processedSolves, 100), [processedSolves]);


  if (isLoading && (!sessions.length || !selectedSessionId)) {
    return <div className="p-6 text-center">Loading sessions...</div>;
  }

  if (!selectedSessionId && sessions.length === 0 && !isLoading) {
    return (
      <div className="extended-stats p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Extended Statistics</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        </div>
        <div className="text-center py-10"><p className="text-gray-600 dark:text-gray-400">No sessions available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="extended-stats px-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 py-4 z-10">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Extended Statistics</h2>
        <button
          onClick={() => navigate ? navigate(projectBaseUrl) : onClose()}
          className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <FiArrowLeft /> To Timer
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select
          Session</label>
        <select
          id="session-select"
          value={selectedSessionId || ''}
          onChange={(e) => setSelectedSessionId(Number(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={isLoading || sessions.length === 0}
        >
          {sessions.map(session => (
            <option key={session.id} value={session.id}>{session.name}</option>
          ))}
          {sessions.length === 0 && <option value="" disabled>No sessions available</option>}
        </select>
      </div>

      {isLoading && selectedSessionId && <div className="text-center py-5">Loading statistics for session...</div>}

      {!isLoading && processedSolves.length === 0 && selectedSessionId && (
        <div className="text-center py-10"><p className="text-gray-600 dark:text-gray-400">No solves in this
          session.</p></div>
      )}

      {!isLoading && processedSolves.length > 0 && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard title="Best Ao5" value={bestAo5?.average} times={bestAo5?.times}
                      available={processedSolves.length >= 5} />
            <StatCard title="Best Ao12" value={bestAo12?.average} times={bestAo12?.times}
                      available={processedSolves.length >= 12} />
            <StatCard title="Best Ao100" value={bestAo100?.average} times={bestAo100?.times}
                      available={processedSolves.length >= 100} />
          </div>

          {/* Session Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Session Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatBox title="Total Solves" value={stats.count || 0} />
              <StatBox title="Best Time" value={stats.best ? formatTime(stats.best.timestamp) : '-'} />
              <StatBox title="Worst Time" value={stats.worst ? formatTime(stats.worst.timestamp) : '-'} />
              <StatBox title="Mean Time" value={stats.mean ? formatTime(stats.mean * 1000) : '-'} />
              <StatBox title="Average TPS" value={tpsStats.average ? tpsStats.average.toFixed(2) : '-'} />
              <StatBox title="Best TPS"
                       value={tpsStats.best ? `${tpsStats.best.tps.toFixed(2)} (${formatTime(tpsStats.best.timestamp)})` : '-'} />
              <StatBox title="Worst TPS"
                       value={tpsStats.worst && tpsStats.worst.tps ? `${tpsStats.worst.tps.toFixed(2)} (${formatTime(tpsStats.worst.timestamp)})` : '-'} />
            </div>
          </div>

          {/* Visualizations */}
          <div className="">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Visualizations</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-6">

              {solvesOverTimeData && solvesOverTimeData.times.length > 1 ? (
                <ChartCard title="Solve Time Progression">
                  <LineChart
                    xAxis={[{
                      data: solvesOverTimeData.xAxis,
                      label: 'Solve Number',
                      scaleType: 'point',
                      zoom: true,
                    }]}
                    yAxis={[{
                      zoom: true,
                    }]}
                    series={[{
                      data: solvesOverTimeData.times,
                      label: 'Time (s)',
                      color: '#10b981',
                      area: true,
                    }]}
                    height={300}
                    margin={{ left: -20 }}
                    slotProps={{
                      legend: {
                        hidden: true
                      },
                    }}
                  />
                </ChartCard>
              ) : (solvesOverTimeData && solvesOverTimeData.times.length > 0 &&
                <ChartPlaceholder message="Need at least two solves for progress chart." />)}

              {timeDistributionData ? (
                <ChartCard title="Solve Time Distribution">
                  <BarChart
                    xAxis={[{
                      scaleType: 'band',
                      data: timeDistributionData.labels,
                      label: 'Time Buckets (s)',
                      zoom: true,
                    }]}
                    yAxis={[{
                      zoom: true,
                    }]}
                    series={[{
                      data: timeDistributionData.counts,
                      label: 'Solves',
                      color: '#3b82f6',
                    }]}
                    height={300}
                    margin={{ left: -20 }}
                    slotProps={{ legend: { hidden: true } }}
                  />
                </ChartCard>
              ) : <ChartPlaceholder message="Not enough data for time distribution." />}

              {/* Reconstruction Step Analysis */}
              {stepAnalysis && stepAnalysis.length > 0 && (
                <div className="">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Reconstruction Step
                    Analysis</h3>
                  <div className="overflow-x-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-100 dark:bg-gray-600">
                      <tr>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Step
                          Name
                        </th>
                        {/*<th*/}
                        {/*  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Frequency*/}
                        {/*</th>*/}
                        <th
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg.
                          Moves
                        </th>
                        <th
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg.
                          Recon Entry Time (s)
                        </th>
                      </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {stepAnalysis.map(step => (
                        <tr key={step.name}>
                          <td
                            className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{step.name}</td>
                          {/*<td*/}
                          {/*  className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{step.frequency}</td>*/}
                          <td
                            className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{step.avgMoves.toFixed(1)}</td>
                          <td
                            className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{step.avgEntryDuration > 0 ? step.avgEntryDuration.toFixed(2) : '-'}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/*{avgMovesPerStepData ? (*/}
                    {/*  <ChartCard title="Average Moves per Step">*/}
                    {/*    <BarChart*/}
                    {/*      dataset={stepAnalysis.map(s => ({*/}
                    {/*        name: s.name,*/}
                    {/*        avgMoves: parseFloat(s.avgMoves.toFixed(1)),*/}
                    {/*      })).sort((a, b) => b.avgMoves - a.avgMoves).slice(0, 15)} // Top 15 for readability*/}
                    {/*      yAxis={[{ scaleType: 'band', dataKey: 'name' }]}*/}
                    {/*      series={[{ dataKey: 'avgMoves', label: 'Avg Moves', color: '#8b5cf6' }]}*/}
                    {/*      layout="horizontal"*/}
                    {/*      height={Math.max(300, stepAnalysis.slice(0, 15).length * 35)} // Dynamic height*/}
                    {/*      margin={{ top: 20, right: 30, bottom: 40, left: 120 }}*/}
                    {/*      slotProps={{ legend: { hidden: true } }}*/}
                    {/*    />*/}
                    {/*  </ChartCard>*/}
                    {/*) : <ChartPlaceholder message="No data for average moves per step." />}*/}

                    {/*{stepFrequencyData ? (*/}
                    {/*  <ChartCard title="Step Recording Frequency">*/}
                    {/*    <PieChart*/}
                    {/*      series={[{*/}
                    {/*        data: stepFrequencyData.sort((a, b) => b.value - a.value).slice(0, 8),*/}
                    {/*        innerRadius: 30,*/}
                    {/*        outerRadius: 100,*/}
                    {/*        paddingAngle: 2,*/}
                    {/*        cornerRadius: 3,*/}
                    {/*      }]}*/}
                    {/*      height={300}*/}
                    {/*      margin={{ top: 10, bottom: 10}}*/}
                    {/*      slotProps={{*/}
                    {/*        legend: {*/}
                    {/*          direction: 'vertical',*/}
                    {/*          position: { vertical: 'middle', horizontal: 'right' },*/}
                    {/*          padding: 0,*/}
                    {/*        },*/}
                    {/*      }}*/}
                    {/*    />*/}
                    {/*  </ChartCard>*/}
                    {/*) : <ChartPlaceholder message="No data for step frequency." />}*/}
                  </div>
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">More info</h3>
                {methodDistributionData ? (
                  <ChartCard title="Method Usage">
                    <PieChart
                      series={[{
                        data: methodDistributionData,
                        innerRadius: 30,
                        outerRadius: 70,
                        paddingAngle: 2,
                        cornerRadius: 3,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                      }]}
                      height={300}
                      margin={{ top: 10, bottom: 10, left: 10 }}
                      slotProps={{
                        legend: {
                          direction: 'vertical',
                          position: { vertical: 'middle', horizontal: 'right' },
                          padding: 0,

                        },
                      }}
                    />
                  </ChartCard>
                ) : <ChartPlaceholder message="No method data." />}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
              {tpsDistributionData ? (
                <ChartCard title="TPS Distribution">
                  <BarChart
                    xAxis={[{
                      scaleType: 'band',
                      data: tpsDistributionData.labels,
                      label: 'TPS Buckets',
                      zoom: true,
                    }]}
                    yAxis={[{
                      zoom: true,
                    }]}
                    series={[{
                      data: tpsDistributionData.counts, label: 'Solves', color: '#ef4444',
                    }]}
                    height={300}
                    margin={{ right: 10, left: -20 }}
                  />
                </ChartCard>
              ) : <ChartPlaceholder message="Not enough data for TPS distribution." />}

              {tpsVsTimeData && tpsVsTimeData.length > 0 ? (
                <ChartCard title="TPS vs. Solve Time">
                  <ScatterChart
                    series={[{
                      type: 'scatter',
                      data: tpsVsTimeData,
                      label: 'Solves',
                      markerSize: 5,
                      color: '#f97316',
                    }]}
                    xAxis={[{
                      label: 'Solve Time (s)',
                      min: Math.min(...tpsVsTimeData.map(d => d.x)) * 0.9,
                      max: Math.max(...tpsVsTimeData.map(d => d.x)) * 1.1,
                      zoom: true,
                    }]}
                    yAxis={[{
                      label: 'TPS',
                      min: Math.min(...tpsVsTimeData.map(d => d.y)) * 0.9,
                      max: Math.max(...tpsVsTimeData.map(d => d.y)) * 1.1,
                      zoom: true,
                    }]}
                    height={300}
                  />
                </ChartCard>
              ) : <ChartPlaceholder message="Not enough data for TPS vs Time." />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ title, value, times, available }) => (
  <div
    className={`p-4 rounded-lg shadow ${available ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-600 opacity-70'}`}>
    <h3 className="font-medium text-gray-700 dark:text-gray-200">{title}</h3>
    <p className="text-3xl font-mono font-bold my-2 text-gray-900 dark:text-white">
      {available ? (typeof value === 'number' ? value.toFixed(2) : (value || '-')) : '-'}
    </p>
    {available && times && times.length > 0 && (
      <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={times.join(', ')}>
        Solves: {times.join(', ')}
      </div>
    )}
    {!available && (
      <div className="text-xs text-gray-500 dark:text-gray-400">Not enough solves</div>
    )}
  </div>
);

const StatBox = ({ title, value }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow">
    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h4>
    <p className="text-xl font-mono text-gray-900 dark:text-white">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
    <h4 className="text-lg font-medium mb-3 text-center text-gray-700 dark:text-gray-200">{title}</h4>
    {children}
  </div>
);

const ChartPlaceholder = ({ message }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow flex items-center justify-center h-[300px]">
    <p className="text-gray-500 dark:text-gray-400 text-center">{message}</p>
  </div>
);


// Helper function to convert time string "MM:SS.mmm" or "SS.mmm" to seconds
function convertTimeToSeconds(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':');
  if (parts.length === 1) return parseFloat(parts[0]) || 0;
  if (parts.length === 2) return (parseFloat(parts[0]) * 60 + parseFloat(parts[1])) || 0;
  if (parts.length === 3) return (parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2])) || 0;
  return 0;
}

// calculateBestConsecutiveAverage remains largely the same, but ensure it uses processedSolves's timestamp
function calculateBestConsecutiveAverage(solves, n) {
  if (!solves || solves.length < n) return null;

  let bestAvg = Infinity;
  let bestSegmentSolveIds = [];

  const numericTimes = solves.map(s => s.timestamp); // Use raw timestamp for calculation precision

  for (let i = 0; i <= numericTimes.length - n; i++) {
    const segmentTimes = numericTimes.slice(i, i + n);
    // Assuming no DNF (-1) or Infinity in raw timestamps for this calculation for simplicity here.
    // Official AoN might need to handle DNFs by counting them or invalidating the average.
    // For "best consecutive average", a simple arithmetic mean is typically used.
    const avg = segmentTimes.reduce((sum, t) => sum + t, 0) / segmentTimes.length;

    if (avg < bestAvg) {
      bestAvg = avg;
      // Store the actual solve objects or just their formatted times from the segment
      bestSegmentSolveIds = solves.slice(i, i + n).map(s => s.id);
    }
  }

  if (bestAvg === Infinity) return null;

  // Retrieve the solves that form the best segment to get their formatted times
  const bestSolvesInSegment = solves.filter(s => bestSegmentSolveIds.includes(s.id));
  // Need to ensure the order of times matches the segment.
  // Find the starting index of the best segment again to ensure correct times are pulled.
  let actualBestTimesFormatted = [];
  for (let i = 0; i <= numericTimes.length - n; i++) {
    const currentSegmentTimes = numericTimes.slice(i, i + n);
    const currentAvg = currentSegmentTimes.reduce((sum, t) => sum + t, 0) / currentSegmentTimes.length;
    if (Math.abs(currentAvg - bestAvg) < 0.001) { // Float precision
      actualBestTimesFormatted = solves.slice(i, i + n).map(s => formatTime(s.timestamp));
      break;
    }
  }

  return {
    average: bestAvg / 1000, // Convert ms to seconds for display
    times: actualBestTimesFormatted.length > 0 ? actualBestTimesFormatted : bestSolvesInSegment.map(s => formatTime(s.timestamp)), // Fallback
  };
}


export default ExtendedStats;
