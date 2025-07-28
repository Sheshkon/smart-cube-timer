import clsx from 'clsx';
import { TwistyPlayer } from 'cubing/twisty';
import { Dumbbell, Info, Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { CubeInfoModal } from 'src/components/Modals/CubeInfoModal.jsx';
import { SettingsModal } from 'src/components/Modals/SettingsModal.jsx';
import { useCube } from 'src/hooks/useCube';
import { useSettings } from 'src/hooks/useSettings.js';
import { cubeQuaternion } from 'src/utils/util.ts';
import 'src/style.css';

const twistyConfig = {
  puzzle: '3x3x3',
  visualization: 'PG3D',
  alg: '',
  experimentalSetupAnchor: 'start',
  background: 'none',
  controlPanel: 'none',
  hintFacelets: 'none',
  experimentalDragInput: 'none',
  cameraLatitude: 0,
  cameraLongitude: 0,
  cameraLatitudeLimit: 0,
  tempoScale: 5,
};

const Cube = ({ className = '' }) => {
  const { settings } = useSettings();

  const {
    twistyPlayerRef,
    hardwareInfo,
    connection,
    batteryLevel,
    practiceModeEnabled,
    setPracticeModeEnabled,
  } = useCube();

  const initialized = useRef(false);
  const cubeRef = useRef(null);
  const animationRef = useRef(-1);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleInfoModalOpen = () => setInfoModalOpen(!infoModalOpen);
  const handleSettingsModalOpen = () => setSettingsModalOpen(!settingsModalOpen);
  const handlePracticeMode = () => setPracticeModeEnabled(!practiceModeEnabled);

  const animateCubeOrientation = async () => {
    try {
      if (!twistyPlayerRef.current) return;

      const vantageList = await twistyPlayerRef.current.experimentalCurrentVantages();
      if (!vantageList || vantageList.size === 0) {
        animationRef.current = requestAnimationFrame(animateCubeOrientation);
        return;
      }

      const twistyVantage = [...vantageList][0];
      if (!twistyVantage?.scene) {
        animationRef.current = requestAnimationFrame(animateCubeOrientation);
        return;
      }

      const twistyScene = await twistyVantage.scene.scene();
      if (!twistyScene?.quaternion) {
        animationRef.current = requestAnimationFrame(animateCubeOrientation);
        return;
      }

      twistyScene.quaternion.slerp(cubeQuaternion, 0.25);
      twistyVantage.render();

      animationRef.current = requestAnimationFrame(animateCubeOrientation);
    } catch (error) {
      console.error('Error in animation loop:', error);
    }
  };

  useEffect(() => {
    if (initialized.current) return;

    twistyPlayerRef.current = new TwistyPlayer(twistyConfig);

    if (cubeRef.current && twistyPlayerRef.current) {
      cubeRef.current.appendChild(twistyPlayerRef.current);
      initialized.current = true;
      animationRef.current = requestAnimationFrame(animateCubeOrientation);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={className}>
      <div className='cube-container'>
        <div
          className={`relative ${settings.showCubeAnimation ? '' : 'hidden'}`}
          id='cube'
          ref={cubeRef}
        >
          {connection && (
          <div>
            <button
              onClick={handlePracticeMode}
              className={clsx(
                'absolute flex right-[3.30rem] top-[-0.40rem] p-1.5 rounded-full mt-2 transition-colors',
                {
                  'bg-green-600 text-white hover:bg-green-700': practiceModeEnabled,
                  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600':
                    !practiceModeEnabled,
                }
              )}
              title='Practice'
            >
              <Dumbbell size={18} />
            </button>
            <div className='absolute flex flex-col right-[0.9rem] top-[0.1rem]'>
              <button
                onClick={handleInfoModalOpen}
                className='p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                title='Cube info'
              >
                <Info size={18} />
              </button>

              <>
                <button
                  onClick={handleSettingsModalOpen}
                  className='p-1.5 rounded-full mt-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                  title='Settings'
                >
                  <Settings size={18} />
                </button>
              </>

              <CubeInfoModal
                info={{
                  ...hardwareInfo,
                  batteryLevel,
                  deviceMAC: connection?.deviceMAC,
                  deviceName: connection?.deviceName,
                }}
                isOpen={infoModalOpen}
                onClose={handleInfoModalOpen}
              />

              <SettingsModal isOpen={settingsModalOpen} onClose={handleSettingsModalOpen} />
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cube;
