import { Award, BarChart2, Clock, TrendingUp } from 'lucide-react';
import React from 'react';
import { SolveReconstructionChart } from 'src/components/Chart/SolveChart.jsx';
import { getCurrentSolveStats } from 'src/components/StatsDisplay/util.js';
import { useSettings } from 'src/hooks/useSettings.js';
import { formatTime } from 'src/utils/time.js';

const StatsDisplay = ({ times, className = '' }) => {
  const { settings } = useSettings();

  const calculateStats = () => {
    if (times.length === 0) {
      return {};
    }

    const best = times.reduce((min, time) =>
      time.originalTime.asTimestamp < min.originalTime.asTimestamp ? time : min,
    );

    const current = times[times.length - 1];

    const avg5 = times.length >= 5 && calculateAverage(times.slice(-5));
    const avg12 = times.length >= 12 && calculateAverage(times.slice(-12));

    const currentStats = times.length > 1
      ? getCurrentSolveStats(current, times[times.length - 2])
      : getCurrentSolveStats(current);

    return { current, best, avg5, avg12, currentStats };
  };

  const calculateAverage = (times) => {
    if (times.length === 0) return 0;

    if (times.length < 3) {
      return times.reduce((sum, time) => sum + time.originalTime.asTimestamp, 0) / times.length;
    }

    let min = times[0];
    let max = times[0];
    let sum = 0;

    times.forEach(time => {
      const val = time.originalTime.asTimestamp;
      sum += val;
      if (val < min.originalTime.asTimestamp) min = time;
      if (val > max.originalTime.asTimestamp) max = time;
    });

    return (sum - min.originalTime.asTimestamp - max.originalTime.asTimestamp) / (times.length - 2);
  };

  const stats = calculateStats();


  const statItems = [
    {
      label: 'Current',
      value: stats.current?.formattedTime,
      icon: <Clock size={18} />,
    },
    {
      label: 'Best',
      value: stats.best?.formattedTime,
      icon: <Award size={18} />,
    },
    {
      label: 'Avg5',
      value: stats?.avg5 && formatTime(stats.avg5.toFixed(0)),
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Avg12',
      value: stats.avg12 && formatTime(stats.avg12.toFixed(0)),
      icon: <BarChart2 size={18} />,
    },
  ];

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Statistics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md flex flex-col items-center justify-center"
            >
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                {item.icon}
                <span className="ml-1 text-xs font-medium">{item.label}</span>
              </div>
              <div className="font-mono font-semibold flex-col text-lg text-gray-900 dark:text-white">
                <div className={
                  item.value === stats.best?.formattedTime && item.label === 'Current'
                    ? 'flex justify-center text-green-600 dark:text-green-400'
                    : 'flex justify-center'
                }>
                  {item.value}
                </div>
                {item.label === 'Current' && stats?.currentStats?.formattedTimeDiff && (
                  <>
                    <div
                      className={
                        stats.currentStats.formattedTimeDiff.sign === 1
                          ? 'text-red-600 dark:text-red-400 text-xs flex justify-center'
                          : 'text-green-600 dark:text-green-400 text-xs flex justify-center'
                      }
                    >
                      <p>{`(${stats.currentStats.formattedTimeDiff.sign === 1 ? '+' : '-'}${stats.currentStats.formattedTimeDiff.formattedTime})`}</p>
                    </div>
                  </>
                )}
                {item.label === 'Current' && item.value && (
                  <>
                    <div className="flex justify-center ml-1 text-xs text-gray-500 dark:text-gray-400">
                      Moves:{' '}
                      <p className="text-gray-900 dark:text-white text-xs">
                        {stats.currentStats?.movesCount}
                      </p>
                    </div>
                    <div className="flex justify-center ml-1 text-xs text-gray-500 dark:text-gray-400">
                      TPS:{' '}
                      <p className="text-gray-900 text-xs dark:text-white">
                        {stats.currentStats?.tps}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {settings['solutionChart'] && (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Solve Step Analysis</h3>
        <SolveReconstructionChart className="flex-col" reconstruction={times?.[times?.length - 1]?.reconstruction} />
      </div>
        )}
    </>
  );
};


export default StatsDisplay;
