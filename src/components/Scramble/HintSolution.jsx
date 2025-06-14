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
    <div className={`${className} w-full max-w-md`}>
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
          <h2>
            <b>{records?.[records?.length - (showPrev ? 2 : 1)]?.name}</b>
          </h2>
          {records?.[records?.length - (showPrev ? 2 : 1)]?.solutions.map((solution, index) => (
            <h1 className='pl-2 text-sm' key={index + solution}>
              {solution === records?.[records?.length - (showPrev ? 2 : 1)].recommendedSolution ? (
                <strong>{solution}</strong>
              ) : (
                solution
              )}
            </h1>
          ))}
        </div>
      )}

      {historyVisible && (
        <div className='p-4 mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-full'>
          <h1 className='pb-2'>
            <b>History</b>
          </h1>
          <div>
            {records
              .slice()
              .reverse()
              .slice(showPrev ? 2 : 1, records.length)
              .map((record, index) => (
                <div key={record.name + index} className='pl-2'>
                  <h1
                    className='cursor-pointer hover:text-blue-500'
                    onClick={() => handleRecordClick(record)}
                  >
                    <span>
                      <b>{record.name}</b>
                      {record?.time && ` (${record.time})`}
                    </span>
                  </h1>
                  {selectedRecord === record && (
                    <div className='pl-3 text-sm'>
                      <h1><b>Setup: </b> {record.scramble}</h1>
                      {record.solutions.map((solution, index) => (
                        <div key={solution + index + record.name}>
                          {solution === record.recommendedSolution ? (
                            <strong>{solution}</strong>
                          ) : (
                            solution
                          )}
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
