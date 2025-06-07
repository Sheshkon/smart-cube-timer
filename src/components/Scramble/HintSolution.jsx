import React from 'react';


const HintSolution = ({ className = '', practiceRecord, visible, toggleVisible }) => {
  const hasSolutions = practiceRecord?.solutions?.length > 0;

  return (
    <div className={className}>
      {hasSolutions && (
        <button
          onClick={toggleVisible}
          className="px-4"
        >
          {visible ? 'Hide Solution' : 'Show Solution'}
        </button>
      )}

      {visible && hasSolutions && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {practiceRecord.solutions.map(solution => (
            <h1 className='px-4' key={solution}>
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