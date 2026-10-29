import { useEffect, useRef } from 'react';

import { cubePoseQuaternion } from 'src/utils/util.ts';
import * as THREE from 'three';

const STEER_FULL = 0.42;
const DEADZONE = 0.04;
const SMOOTH = 14;

function applyDeadzone(value, zone) {
  const mag = Math.abs(value);
  if (mag <= zone) return 0;
  return Math.sign(value) * (mag - zone) / (1 - zone);
}

/**
 * Steer from whole-cube tilt around the F axis (white-up, green-toward-you rest pose).
 * F-like roll (white leans left) → negative, F'-like (white leans right) → positive.
 */
export function useGyroSteer(active, steerRef, sensitivityRef) {
  const upRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!active) {
      steerRef.current = 0;
      return undefined;
    }

    let frameId = 0;
    let smoothed = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      const up = upRef.current.set(0, 1, 0).applyQuaternion(cubePoseQuaternion);
      const sens = sensitivityRef?.current ?? 1;
      let x = applyDeadzone((up.x / STEER_FULL) * sens, DEADZONE);
      x = Math.max(-1, Math.min(1, x));
      const follow = 1 - Math.exp(-SMOOTH * dt);
      smoothed += (x - smoothed) * follow;
      steerRef.current = smoothed;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      steerRef.current = 0;
    };
  }, [active, steerRef, sensitivityRef]);
}
