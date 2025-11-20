import { useEffect, useRef } from 'react';

import { TwistyPlayer } from 'cubing/twisty';

const twistyConfig = {
  puzzle: '3x3x3',
  visualization: 'PG3D',
  background: 'none',
  controlPanel: 'none',
  hintFacelets: 'none',
  experimentalDragInput: 'none',
  cameraLatitude: 0,
  cameraLongitude: 0,
  cameraLatitudeLimit: 0,
  tempoScale: 5,
};

export const useTwistyPlayer = () => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Если плеер уже есть — просто возвращаем его в контейнер
    if (playerRef.current) {
      if (!container.contains(playerRef.current)) {
        container.appendChild(playerRef.current);
      }
      return;
    }

    container.innerHTML = '';

    const player = new TwistyPlayer(twistyConfig);
    playerRef.current = player;

    (async () => {
      await player.ready; // дождались полной инициализации
      const vantages = await player.experimentalCurrentVantages();
      const arr = [...vantages];
      console.warn('vantages после ready:', arr);

      arr.slice(1).forEach((vantage) => {
        if (typeof vantage.dispose === 'function') {
          vantage.dispose();
        }
      });
    })();

    container.appendChild(player);

    return () => {
      if (container && container.contains(player)) {
        container.removeChild(player);
      }
      playerRef.current = null;
    };
  }, []);

  return { containerRef, playerRef };
};
