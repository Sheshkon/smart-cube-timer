import { parseCubeMove, useFaceSteer } from '../../useFaceMoveInput';

/** F = move left, F′ = move right (no-gyro fallback). */
export function mapCubeMoveToSteer(move) {
  const parsed = parseCubeMove(move);
  if (!parsed || parsed.face !== 'F' || parsed.repeats !== 1) return 0;
  return parsed.prime ? 1 : -1;
}

export function useDoodleFaceSteer(active, lastMoves, steerRef, sensitivityRef) {
  useFaceSteer(active, lastMoves, steerRef, sensitivityRef, mapCubeMoveToSteer);
}
