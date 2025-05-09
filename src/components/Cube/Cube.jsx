import React, { useEffect, useRef, useState } from 'react';

import { Info, Settings } from 'lucide-react';
import { CubeInfoModal } from 'src/components/Modals/CubeInfoModal.jsx';
import { SettingsModal } from 'src/components/Modals/SettingsModal.jsx';
import { useCube } from 'src/hooks/useCube';
import { cubeQuaternion } from 'src/utils/util.ts';
import 'src/style.css';

const Cube = () => {
  const initialized = useRef(false);
  const cubeRef = useRef(null);
  const animationRef = useRef(-1);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const { twistyPlayerRef, hardwareInfo, connection, batteryLevel } = useCube();

  const handleInfoModalOpen = () => setInfoModalOpen(!infoModalOpen);
  const handleSettingsModalOpen = () =>
    setSettingsModalOpen(!settingsModalOpen);

  const animateCubeOrientation = async () => {
    try {
      if (!twistyPlayerRef.current) return;

      const vantageList =
        await twistyPlayerRef.current.experimentalCurrentVantages();
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
  }, [twistyPlayerRef]);

  return (
    <>
      <div className="relative" id="cube" ref={cubeRef}>
        {connection && (
          <div
            className="absolute flex"
            style={{
              flexDirection: 'column',
              right: '-0.80rem',
              top: '1.25rem',
            }}
          >
            <button
              onClick={handleInfoModalOpen}
              className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Cube info"
            >
              <Info size={18} />
            </button>

            <button
              onClick={handleSettingsModalOpen}
              className="p-1.5 rounded-full my-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </button>

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

            <SettingsModal
              isOpen={settingsModalOpen}
              onClose={handleSettingsModalOpen}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Cube;
