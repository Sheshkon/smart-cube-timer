import React from 'react';
import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import { formatTime } from '../../utils/timeUtils';

const TimesTable = ({ times, onDeleteTime, className = '' }) => {
  // Sort times by date descending (newest first)
  console.log("fdsafa", times)
  const sortedTimes = [...times].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Format date to readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString();
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Times</h3>
      
      {times.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No times recorded yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-left">
                <th className="px-4 py-2 rounded-tl-md dark:text-white" >#</th>
                <th className="px-4 py-2 dark:text-white">Time</th>
                <th className="px-4 py-2 dark:text-white">When</th>
                <th className="px-4 py-2 rounded-tr-md dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTimes.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`
                    border-t border-gray-100 dark:border-gray-700
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                  `}
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">
                    {item.time}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDeleteTime(item.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete time"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimesTable;