import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { TwistyPlayer } from 'cubing/twisty';
import { Dumbbell, Info } from 'lucide-react';
import { CubeInfoModal } from 'src/components/Modals/CubeInfoModal.jsx';
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

  const cubeRef = useRef(null);
  const animationRef = useRef(-1);

  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const handleInfoModalOpen = () => setInfoModalOpen(!infoModalOpen);
  const handlePracticeMode = () => setPracticeModeEnabled(!practiceModeEnabled);

  const animateCubeOrientation = async () => {
    try {
      const player = twistyPlayerRef.current;
      if (!player) {
        animationRef.current = requestAnimationFrame(animateCubeOrientation);
        return;
      }

      const vantageSet = await player.experimentalCurrentVantages();
      const vantages = [...vantageSet];

      if (vantages.length > 0) {
        vantages.slice(1).forEach((v) => {
          v.disconnect();
          v.remove();
        });
      }

      const [twistyVantage] = vantages;
      if (!twistyVantage?.scene) {
        animationRef.current = requestAnimationFrame(animateCubeOrientation);
        return;
      }

      const twistyScene = await twistyVantage.scene.scene();
      if (twistyScene?.quaternion) {
        twistyScene.quaternion.slerp(cubeQuaternion, 0.25);
        twistyVantage.render();
      }

      animationRef.current = requestAnimationFrame(animateCubeOrientation);
    } catch (error) {
      console.error('Error in animation loop:', error);
      animationRef.current = requestAnimationFrame(animateCubeOrientation);
    }
  };

  useEffect(() => {
    if (!cubeRef.current || twistyPlayerRef.current) return;

    twistyPlayerRef.current = new TwistyPlayer(twistyConfig);
    cubeRef.current.appendChild(twistyPlayerRef.current);
    animationRef.current = requestAnimationFrame(animateCubeOrientation);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (cubeRef.current && twistyPlayerRef.current) {
        cubeRef.current.removeChild(twistyPlayerRef.current);
      }
      twistyPlayerRef.current = null;
    };
  }, []);

  return (
    <div className={className}>
      <div className='cube-container flex justify-center items-center'>
        <div
          className={settings.showCubeAnimation ? 'flex justify-center' : 'hidden'}
          id='cube'
          ref={cubeRef}
        >
          <div className='z-10'>
            {connection && (
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
            )}

            <div className='absolute flex flex-col right-[0.9rem] top-[0.1rem]'>
              {connection && (
                <button
                  onClick={handleInfoModalOpen}
                  className='p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                  title='Cube info'
                >
                  <Info size={18} />
                </button>
              )}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cube;
