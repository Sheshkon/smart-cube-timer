import React, { useEffect, useRef } from 'react';

import { TwistyPlayer } from 'cubing/twisty';
import { FiAlertTriangle, FiArrowLeft, FiCalendar, FiClock, FiCode, FiLayers } from 'react-icons/fi';
import { IoSpeedometer } from 'react-icons/io5';
import { useSettings } from 'src/hooks/useSettings.js';
import { formatTime } from 'src/utils/time.js';


const projectBaseUrl = import.meta.env.BASE_URL;

const SolveInfo = ({ solveData, loading = false, error = null, navigate = null, onClose }) => {
  const twistyPlayerRef = useRef(null);

  const { settings } = useSettings();


  useEffect(() => {
    if (solveData?.solution && twistyPlayerRef.current) {
      const player = new TwistyPlayer({
        experimentalSetupAlg: solveData.scramble,
        alg: solveData.solution,
        hintFacelets: 'none',
        background: 'none',
        visualization: '3D',
        tempoScale: 3,
      });

      twistyPlayerRef.current.innerHTML = '';
      twistyPlayerRef.current.appendChild(player);
    }
  }, [solveData]);

  if (!solveData?.reconstruction?.steps) return null;

  const renderReconstructionSteps = () => (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Reconstruction Steps ({solveData.reconstruction.method})
      </h3>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          Solution Visualization
        </h4>
        <div
          ref={twistyPlayerRef}
          className="w-full h-64 md:h-96 flex justify-center items-center"
        />
      </div>

      {Object.entries(solveData.reconstruction.steps).map(([stepName, stepData]) => (
        <div key={stepName} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 capitalize">
              {stepName.replace(/_/g, ' ')}
            </h4>
            {stepData.found && (
              <span
                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                Found
              </span>
            )}
          </div>
          <div className="font-mono bg-white dark:bg-gray-900 p-3 rounded shadow-sm">
            {stepData.plain}
          </div>
          {stepData.startTime && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Execution: {formatTime(stepData.endTime - stepData.startTime)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="p-4 md:p-6"
      style={{ backgroundColor: settings.backgroundColor}}
    >
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Solve Information
          </h2>
          <button
            onClick={() => navigate ? navigate(projectBaseUrl) : onClose()}
            className="flex items-center gap-2 mb-6 text-gray-800 dark:text-white hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft /> To Timer
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center shadow-md">
            <FiAlertTriangle className="mx-auto text-red-500 dark:text-red-400 text-3xl mb-3" />
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Error Loading Solve
            </h2>
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : solveData ? (
          <div
            className="bg-white/50 dark:bg-gray-900/50 rounded-lg shadow-md overflow-hidden"

          >
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">

                  <InfoCard
                    icon={<FiCode className="text-purple-500" />}
                    title="Scramble"
                    value={solveData.scramble}
                    mono
                  />

                  <InfoCard
                    icon={<FiClock className="text-blue-500" />}
                    title="Time"
                    value={solveData.time}
                  />

                  <InfoCard
                    icon={<FiLayers className="text-yellow-500" />}
                    title="Solution Moves"
                    value={`${solveData.solution.split(' ').length}`}
                  />

                  <InfoCard
                    icon={<IoSpeedometer className="text-red-500" />}
                    title="TPS"
                    value={`${Math.floor(solveData.solution.split(' ').length * 100 / Math.floor(solveData.timestamp / 1000)) / 100}`}
                  />
                </div>

                <div className="space-y-4">
                  <InfoCard
                    icon={<FiCalendar className="text-green-500" />}
                    title="Date"
                    value={new Date(solveData.date).toLocaleString()}
                  />
                </div>
              </div>

              {solveData.solution && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    Full Solution
                  </h3>
                  <div
                    className="font-mono bg-gray-100 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap break-all shadow-sm">
                    {solveData.solution}
                  </div>
                </div>
              )}

              {renderReconstructionSteps()}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, value, mono = false }) => (
  <div className="flex items-start p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
    <div className="p-2 bg-white dark:bg-gray-900 rounded-full mr-3 shadow-sm">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className={`mt-1 ${mono ? 'font-mono' : ''} text-gray-800 dark:text-white`}>
      {value || 'N/A'}
      </p>
    </div>
  </div>
);

export default SolveInfo;