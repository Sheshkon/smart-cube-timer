import React from 'react';
import PropTypes from 'prop-types';
import {TrendingUp, Clock, BarChart2, Award, Trash2} from 'lucide-react';
import { formatTime } from '../../utils/timeUtils';

const StatsDisplay = ({ onDeleteTimes, times, className = '' }) => {
  // Calculate statistics
  const calculateStats = () => {
    if (times.length === 0) return { current: 0, best: 0, avg5: 0, avg12: 0, avg100: 0 };
    
    const sortedTimes = [...times].sort((a, b) => a.originalTime.asTimestamp - b.originalTime.asTimestamp);
    console.log(sortedTimes)
    const best = sortedTimes[0];
    const current = times[times.length - 1];
    
    // Average of 5
    const avg5 = calculateAverage(times.slice(-5));
    
    // Average of 12
    const avg12 = calculateAverage(times.slice(-12));
    
    // Average of 100
    const avg100 = calculateAverage(times.slice(-100));
    
    return { current, best, avg5, avg12, avg100 };
  };
  
  // Helper to calculate average with exclusions
  const calculateAverage = (arr) => {
    console.log("arr", arr)

    if (arr.length === 0) return 0;
    if (arr.length < 3) return arr.reduce((sum, time) => sum + time.originalTime.asTimestamp, 0) / arr.length;
    
    // For proper averages, exclude best and worst
    const sorted = [...arr].sort((a, b) => a.originalTime.asTimestamp - b.originalTime.asTimestamp);
    const sliced = sorted.slice(1, -1); // Remove best and worst
    
    return sliced.reduce((sum, time) => sum + time.originalTime.asTimestamp, 0) / sliced.length;
  };
  
  const stats = calculateStats();
  
  const statItems = [
    { label: 'Current', value: stats.current.time, icon: <Clock size={18} /> },
    { label: 'Best', value: stats.best.time, icon: <Award size={18} /> },
    { label: 'Avg5', value: formatTime(stats.avg5.toFixed(0)), icon: <TrendingUp size={18} /> },
    { label: 'Avg12', value: formatTime(stats.avg12.toFixed(0)), icon: <BarChart2 size={18} /> }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Statistics</h3>

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
            <div className="font-mono font-semibold text-lg text-gray-900 dark:text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Session: {times.length} solves
          <button
              onClick={() => onDeleteTimes()}
              className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Delete time"
          >
            <Trash2 size={16}/>
          </button>
        </div>

        {/*{times.length > 0 && (*/}
        {/*  <div className="h-16 overflow-hidden relative">*/}
        {/*    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white dark:to-gray-800 pointer-events-none z-10"></div>*/}
        {/*    <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-full pr-2">*/}
        {/*      {times.slice().reverse().map((time, index) => (*/}
        {/*        <div */}
        {/*          key={index} */}
        {/*          className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-xs font-mono text-blue-700 dark:text-blue-300"*/}
        {/*        >*/}
        {/*          {time}*/}
        {/*        </div>*/}
        {/*      ))}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </div>
  );
};

export default StatsDisplay;