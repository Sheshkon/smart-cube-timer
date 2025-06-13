import React, { useState } from 'react';

import AutorenewIcon from '@mui/icons-material/Autorenew';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import HistoryIcon from '@mui/icons-material/History';

const HintSolution = ({
                        className = '',
                        records,
                        visible,
                        toggleHintVisible,
                        reload,
                        showPrev,
                      }) => {
  const hasSolutions = records?.[records?.length - 1]?.solutions?.length > 0;
  const [historyVisible, setHistoryVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const toggleHistory = () => setHistoryVisible(!historyVisible);

  const handleRecordClick = (record) => {
    setSelectedRecord(record === selectedRecord ? null : record);
  };

  return (
    <div className={className}>
      {hasSolutions && (
        <div className='flex justify-end items-center gap-3'>
          <button
            className='p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            onClick={reload}
          >
            <AutorenewIcon />
          </button>
          <button
            className='p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            onClick={toggleHintVisible}
          >
            <AutoStoriesIcon />
          </button>
          <button
            className='p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
            onClick={toggleHistory}
          >
            <HistoryIcon />
          </button>
        </div>
      )}

      {visible && hasSolutions && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-4'>
          <h2><b>{records?.[records?.length - (showPrev ? 2 : 1)]?.name}</b></h2>
          {records?.[records?.length - (showPrev ? 2 : 1)]?.solutions.map((solution, index) => (
            <h1 className='pl-2'>
              {solution === records?.[records?.length - (showPrev ? 2 : 1)].recommendedSolution ? <strong>{solution}</strong> : solution}
            </h1>
          ))}
        </div>
      )}

      {historyVisible && (
        <div className='p-4 mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <h1 className='pb-2'><b>History</b></h1>
          <div>
            {records
              .slice()
              .reverse()
              .slice(showPrev ? 0 : 1, records.length)
              .map((record) => (
                <div className='pl-2'>
                  <h1
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => handleRecordClick(record)}
                  >
                    <b>{record.name}</b>
                  </h1>
                  {selectedRecord === record && (
                    <div className='pl-3'>
                      {record.solutions.map((solution, index) => (
                        <div>
                          {solution === record.recommendedSolution ? <strong>{solution}</strong> : solution}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HintSolution;