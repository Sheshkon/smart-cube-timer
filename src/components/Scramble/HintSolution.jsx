import React from 'react';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const HintSolution = ({ className = '', practiceRecord, visible, toggleVisible, reload }) => {
  const hasSolutions = practiceRecord?.solutions?.length > 0;

  return (
    <div className={className}>
      {hasSolutions && (
        <div className="flex justify-end items-center gap-3">
          <button
            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={reload}
          >
            <AutorenewIcon />
          </button>
          <button
            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={toggleVisible}
          >
            <AutoStoriesIcon/>
          </button>
        </div>
      )}

      {visible && hasSolutions && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {practiceRecord.solutions.map(solution => (
            <h1 className="px-4" key={solution}>
              {solution === practiceRecord.recommendedSolution ? (
                <strong>{solution}</strong>
              ) : (
                solution
              )}
            </h1>
          ))}
        </div>
      )}
    </div>
  );
};

export default HintSolution;