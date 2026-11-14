import React, { useState } from 'react';

import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

const HintSolution = ({
  className = '',
  records,
  visible,
  toggleHintVisible,
  reload,
  setupComplete = false,
}) => {
  const hasSolutions = records?.[records?.length - 1]?.solutions?.length > 0;
  const [historyVisible, setHistoryVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const toggleHistory = () => setHistoryVisible(!historyVisible);

  const handleRecordClick = (record) => {
    setSelectedRecord(record === selectedRecord ? null : record);
  };

  const activeRecord = records?.[records?.length - 1];

  return (
    <div className={`${className} w-full max-w-md`}>
      {hasSolutions && (
        <div className='flex justify-end items-center gap-3'>
          <button
            className='app-btn p-1 rounded-full transition-colors'
            onClick={reload}
          >
            <AutorenewOutlinedIcon />
          </button>
          {setupComplete && (
            <button
              className='app-btn p-1 rounded-full transition-colors'
              onClick={toggleHintVisible}
              title='Toggle solution hint'
            >
              <AutoStoriesOutlinedIcon />
            </button>
          )}
          <button
            className='app-btn p-1 rounded-full transition-colors'
            onClick={toggleHistory}
          >
            <HistoryOutlinedIcon />
          </button>
        </div>
      )}

      {visible && setupComplete && hasSolutions && (
        <div className='app-inset rounded-lg p-4'>
          <h2>
            <b>{activeRecord?.name}</b>
          </h2>
          {activeRecord?.solutions.map((solution, index) => (
            <h1 className='pl-2 text-sm' key={index + solution}>
              {solution === activeRecord.recommendedSolution ? (
                <strong>{solution}</strong>
              ) : (
                solution
              )}
            </h1>
          ))}
        </div>
      )}

      {historyVisible && (
        <div className='app-inset p-4 mt-3 rounded-lg w-full max-w-full'>
          <h1 className='pb-2'>
            <b>History</b>
          </h1>
          <div>
            {records
              .slice()
              .reverse()
              .slice(1)
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
                      {record.solutions.map((solution, solutionIndex) => (
                        <div key={solution + solutionIndex + record.name}>
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
