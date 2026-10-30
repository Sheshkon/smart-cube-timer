import { useEffect, useRef } from 'react';

export function parseCubeMove(move) {
  if (!move || typeof move !== 'string') return null;
  const normalized = move.trim().replace(/[\u2018\u2019\u2032`´]/g, '\'');
  const face = normalized[0]?.toUpperCase();
  if (!face) return null;
  const prime = normalized.includes('\'');
  const repeats = normalized.includes('2') ? 2 : 1;
  return { face, prime, repeats };
}

function moveString(entry) {
  if (typeof entry === 'string') return entry;
  return entry?.move ?? '';
}

/**
 * Consume only newly appended lastMoves entries while `active`.
 * @param {boolean} active
 * @param {unknown} lastMoves
 * @param {(move: string) => void} onMove
 */
export function useCubeFaceMoves(active, lastMoves, onMove) {
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const indexRef = useRef(Array.isArray(lastMoves) ? lastMoves.length : 0);

  useEffect(() => {
    const list = Array.isArray(lastMoves) ? lastMoves : [];
    if (!active) {
      indexRef.current = list.length;
      return;
    }
    if (list.length < indexRef.current) {
      indexRef.current = list.length;
      return;
    }
    if (list.length === indexRef.current) return;
    const fresh = list.slice(indexRef.current);
    indexRef.current = list.length;
    for (const entry of fresh) {
      const move = moveString(entry);
      if (move) onMoveRef.current(move);
    }
  }, [active, lastMoves]);
}

const FACE_STEER_HOLD_MS = 280;
const FACE_STEER_DECAY = 3.2;

/**
 * @param active
 * @param lastMoves
 * @param steerRef
 * @param sensitivityRef
 * @param {(move: string) => -1 | 0 | 1} steerFromMove — per-game mapping (F/F′ etc.)
 */
export function useFaceSteer(active, lastMoves, steerRef, sensitivityRef, steerFromMove) {
  const steerFromMoveRef = useRef(steerFromMove);
  steerFromMoveRef.current = steerFromMove;
  const holdUntilRef = useRef(0);

  useCubeFaceMoves(active, lastMoves, (move) => {
    const dir = steerFromMoveRef.current(move);
    if (!dir) return;
    const sens = sensitivityRef?.current ?? 1;
    steerRef.current = Math.max(-1, Math.min(1, dir * sens));
    holdUntilRef.current = performance.now() + FACE_STEER_HOLD_MS * Math.max(0.5, sens);
  });

  useEffect(() => {
    if (!active) {
      steerRef.current = 0;
      return undefined;
    }

    let frameId = 0;
    const tick = (now) => {
      if (now > holdUntilRef.current && steerRef.current !== 0) {
        const next = steerRef.current * Math.exp(-FACE_STEER_DECAY * 0.016);
        steerRef.current = Math.abs(next) < 0.04 ? 0 : next;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      steerRef.current = 0;
    };
  }, [active, steerRef]);
}

/**
 * Push mapped game actions into a ref queue (face-control mini-games).
 * @param active
 * @param lastMoves
 * @param queueRef
 * @param {(move: string) => unknown[]} mapMoveToActions
 */
export function useFaceActionQueue(active, lastMoves, queueRef, mapMoveToActions) {
  const mapRef = useRef(mapMoveToActions);
  mapRef.current = mapMoveToActions;

  useCubeFaceMoves(active, lastMoves, (move) => {
    const actions = mapRef.current(move);
    if (actions?.length) queueRef.current.push(...actions);
  });
}

const START_GESTURE_MS = 1600;

export function isFfPrimePair(firstMove, secondMove) {
  const a = parseCubeMove(firstMove);
  const b = parseCubeMove(secondMove);
  if (!a || !b || a.face !== 'F' || b.face !== 'F') return false;
  if (a.repeats !== 1 || b.repeats !== 1) return false;
  return a.prime !== b.prime;
}

export function useFfStartGesture(armed, lastMoves, onStart) {
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;
  const lastRef = useRef({ move: null, at: 0 });

  useCubeFaceMoves(armed, lastMoves, (move) => {
    const now = performance.now();
    const prev = lastRef.current;
    if (prev.move && now - prev.at <= START_GESTURE_MS && isFfPrimePair(prev.move, move)) {
      lastRef.current = { move: null, at: 0 };
      onStartRef.current?.();
      return;
    }
    lastRef.current = { move, at: now };
  });

  useEffect(() => {
    if (!armed) lastRef.current = { move: null, at: 0 };
  }, [armed]);
}
