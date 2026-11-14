import React, { useEffect, useState } from 'react';

import { Award, BarChart2, Clock, TrendingUp } from 'lucide-react';
import { MdOutlineQueryStats } from 'react-icons/md';
import ExtendedStats from 'src/components/ExtendedStats/ExtendedStats.jsx';
import FullScreenModal from 'src/components/Modals/FullScreenModal.jsx';
import { calculateStats } from 'src/components/StatsDisplay/calculation.js';
import { formatTime } from 'src/utils/time.js';

const StatsDisplay = ({ times, stats, setStats, className = '' }) => {
  const [showExtendedStats, setShowExtendedStats] = useState(false);

  useEffect(() => {
    let isActive = true;
    calculateStats(times).then((computedStats) => {
      if (isActive) {
        setStats(computedStats);
      }
    });
    return () => {
      isActive = false;
    };
  }, [times, setStats]);

  const statItems = [
    {
      label: 'Current',
      value: stats.current?.time,
      icon: <Clock size={18} />,
    },
    {
      label: 'Best',
      value: stats.best?.time,
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
    <div className={`app-card rounded-b-lg shadow-md p-4 ${className}`}>
      <div className='flex items-center justify-between mb-4'>
        <div className='text-2xl font-medium'>Statistics</div>
        <button
          onClick={() => setShowExtendedStats(true)}
          className='hover:text-gray-700 dark:hover:text-gray-200'
          aria-label='Extended statistics'
        >
          <MdOutlineQueryStats className='h-7 w-7' />
        </button>
      </div>

      {showExtendedStats && (
        <FullScreenModal
          hideCloseButton
          onClose={() => setShowExtendedStats(false)}
        >
          <ExtendedStats onClose={() => setShowExtendedStats(false)} />
        </FullScreenModal>
      )}

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        {statItems.map((item, index) => (
          <div
            key={index}
            className='app-inset p-3 rounded-md flex flex-col items-center justify-center'
          >
            <div className='flex items-center mb-1 opacity-80'>
              {item.icon}
              <span className='ml-1 text-xs font-medium'>{item.label}</span>
            </div>
            <div className='font-mono font-semibold flex-col text-lg'>
              <div
                className={
                  item.value === stats.best?.formattedTime && item.label === 'Current'
                    ? 'flex justify-center text-green-600 dark:text-green-400'
                    : 'flex justify-center'
                }
              >
                {item.value}
              </div>

              {item.label === 'Current' && stats?.currentStats?.formattedTimeDiff && (
                <div
                  className={
                    stats.currentStats.formattedTimeDiff.sign === 1
                      ? 'text-red-600 dark:text-red-400 text-xs flex justify-center'
                      : 'text-green-600 dark:text-green-400 text-xs flex justify-center'
                  }
                >
                  <p>{`(${stats.currentStats.formattedTimeDiff.sign === 1 ? '+' : '-'}${stats.currentStats.formattedTimeDiff.formattedTime})`}</p>
                </div>
              )}

              {item.label === 'Current' && item.value && (
                <>
                  <div className='flex justify-center ml-1 text-xs opacity-80'>
                    Moves:{' '}
                    <p className='text-xs'>
                      {stats.currentStats?.movesCount}
                    </p>
                  </div>
                  <div className='flex justify-center ml-1 text-xs opacity-80'>
                    TPS:{' '}
                    <p className='text-xs'>
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
  );
};

export default StatsDisplay;