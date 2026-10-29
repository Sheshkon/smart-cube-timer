import { parseCubeMove, useFaceActionQueue } from '../../useFaceMoveInput';

/** @typedef {'moveLeft' | 'moveRight' | 'thrust' | 'fire'} SpaceShipAction */

/**
 * D′ left, D right, U / U′ strafe, R / L′ thrust, F / B fire.
 * @param {string} move
 * @returns {SpaceShipAction[]}
 */
export function mapCubeMoveToActions(move) {
  const parsed = parseCubeMove(move);
  if (!parsed) return [];
  const { face, prime, repeats } = parsed;
  /** @type {SpaceShipAction | null} */
  let action = null;

  if (face === 'D') action = prime ? 'moveLeft' : 'moveRight';
  else if (face === 'U') action = prime ? 'moveRight' : 'moveLeft';
  else if ((face === 'R' && !prime) || (face === 'L' && prime)) action = 'thrust';
  else if (face === 'B' || face === 'F') action = 'fire';

  if (!action) return [];
  return Array.from({ length: repeats }, () => action);
}

export function useSpaceShipFaceInput(active, lastMoves, queueRef) {
  useFaceActionQueue(active, lastMoves, queueRef, mapCubeMoveToActions);
}
