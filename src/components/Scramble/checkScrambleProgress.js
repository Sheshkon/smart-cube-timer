import { Alg } from 'cubing/alg';
import { cube3x3x3 } from 'cubing/puzzles';
import { parseAlgMoves, normalizeCubeMove } from 'src/components/Cube/cubeHintArrows.js';
import { parseCubeMove } from 'src/components/MiniGames/useFaceMoveInput.js';

import { MoveScrambleStatus } from './util.js';

const IndependentPairs = [
  ['R', 'L'],
  ['U', 'D'],
  ['F', 'B'],
];

function invertMove(move) {
  if (move.endsWith('2')) return move;
  if (move.endsWith('\'')) return move.slice(0, -1);
  return move + '\'';
}

function areIndependent(move1, move2) {
  const face1 = move1[0];
  const face2 = move2[0];
  return IndependentPairs.some(pair => pair.includes(face1) && pair.includes(face2));
}

function movesEquivalent(a, b) {
  const left = normalizeCubeMove(a);
  const right = normalizeCubeMove(b);

  if (!left || !right) {
    return left === right;
  }

  if (left === right) {
    return true;
  }

  const parsedLeft = parseCubeMove(left);
  const parsedRight = parseCubeMove(right);

  if (!parsedLeft || !parsedRight) {
    return false;
  }

  return (
    parsedLeft.face === parsedRight.face &&
    parsedLeft.prime === parsedRight.prime &&
    parsedLeft.repeats === parsedRight.repeats
  );
}

/** U2 and U2' (and any X2/X2') are the same half turn on a 3×3. */
function halfTurnLayerMatch(expectedMove, cMove) {
  const expected = parseCubeMove(normalizeCubeMove(expectedMove));
  const cube = parseCubeMove(normalizeCubeMove(cMove));

  if (!expected || !cube || expected.repeats !== 2 || cube.repeats !== 2) {
    return false;
  }

  return expected.face === cube.face;
}

function isQuarterOnHalfTurnFace(expectedMove, cMove) {
  const expected = parseCubeMove(normalizeCubeMove(expectedMove));
  const cube = parseCubeMove(normalizeCubeMove(cMove));

  if (!expected || expected.repeats !== 2 || !cube || cube.repeats !== 1) {
    return false;
  }

  return expected.face === cube.face;
}

function completesHalfTurnSecondQuarter(expectedMove, cMove, firstQuarterMove) {
  if (movesEquivalent(cMove, expectedMove) || halfTurnLayerMatch(expectedMove, cMove)) {
    return true;
  }

  const expected = parseCubeMove(normalizeCubeMove(expectedMove));
  const cube = parseCubeMove(normalizeCubeMove(cMove));
  const first = parseCubeMove(normalizeCubeMove(firstQuarterMove));

  if (!expected || expected.repeats !== 2 || !cube || !first) {
    return false;
  }

  if (cube.repeats !== 1 || cube.face !== expected.face) {
    return false;
  }

  return cube.prime === first.prime;
}

/** First quarter turn of a half-turn move (U2 → U, R2' → R', …). */
function quarterMoveForHalfTurn(expectedMove) {
  const parsed = parseCubeMove(normalizeCubeMove(expectedMove));

  if (!parsed || parsed.repeats !== 2) {
    return null;
  }

  return parsed.prime ? `${parsed.face}'` : parsed.face;
}

export function checkScrambleProgress(scramble, cubeMoves) {
  const normalizedScramble = scramble.map((move) => normalizeCubeMove(move)).filter(Boolean);

  const slots = normalizedScramble.map((move) => ({
    expected: move,
    output: { move, status: MoveScrambleStatus.WAITING, comment: 'expected but not yet performed' },
    state: 'pending',
  }));

  const rollback = [];
  const extraErrors = [];
  let failure = false;

  for (const rawMove of cubeMoves) {
    const cMove = normalizeCubeMove(rawMove);

    if (!cMove) {
      continue;
    }

    if (failure) {
      extraErrors.push({
        move: cMove,
        status: MoveScrambleStatus.INCORRECT,
        comment: 'unexpected move (after previous error)',
      });
      rollback.push(invertMove(cMove));
      continue;
    }

    let matchedIndex = -1;
    let matchType = null; // 'exact', 'partial', 'completion'

    // Search for a matching slot
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];

      // 1. Skip completed slots
      if (slot.state === 'done') continue;

      // 2. Handle Partial slot (already started, e.g., R from R2)
      if (slot.state === 'partial') {
        if (completesHalfTurnSecondQuarter(slot.expected, cMove, slot.output.move)) {
          matchedIndex = i;
          matchType = 'completion';
          break;
        }

        // If the move does not complete this partial slot, check independence.
        // If uMove is independent of slot.expected (e.g., R and L), we can search further.
        // If dependent (e.g., R and F), we are blocked.
        if (!areIndependent(cMove, slot.expected)) {
          break; // Dependent move blocks further search
        }
        // If independent — go to the next slot (continue)
        continue;
      }

      // 3. Handle Pending slot (not yet started)
      if (slot.state === 'pending') {
        const isExact =
          movesEquivalent(cMove, slot.expected) || halfTurnLayerMatch(slot.expected, cMove);
        const isPartial = isQuarterOnHalfTurnFace(slot.expected, cMove);

        if (isExact || isPartial) {
          matchedIndex = i;
          matchType = isExact ? 'exact' : 'partial';
          break;
        }

        // If no match, check if we can skip this slot (independence)
        if (!areIndependent(cMove, slot.expected)) {
          break; // Dependent move blocks
        }
      }
    }

    // Apply result
    if (matchedIndex !== -1) {
      const slot = slots[matchedIndex];

      if (matchType === 'completion') {
        slot.output = {
          move: slot.expected,
          status: MoveScrambleStatus.CORRECT,
          comment: 'matches expected (completed)'
        };
        slot.state = 'done';
      }
      else if (matchType === 'exact') {
        slot.output = {
          move: cMove,
          status: MoveScrambleStatus.CORRECT,
          comment: matchedIndex === getFirstPendingIndex(slots) ? 'matches expected' : 'independent swap allowed'
        };
        slot.state = 'done';
      }
      else if (matchType === 'partial') {
        slot.output = {
          move: cMove,
          status: MoveScrambleStatus.PARTIAL,
          comment: 'partial move, independent allowed'
        };
        slot.state = 'partial';
      }
    } else {
      failure = true;
      extraErrors.push({
        move: cMove,
        status: MoveScrambleStatus.INCORRECT,
        comment: 'unexpected move',
      });
      rollback.push(invertMove(cMove));
    }
  }

  const finalMoves = slots.map(s => s.output).concat(extraErrors);

  return {
    moves: finalMoves,
    rollbackMoves: Alg.fromString(rollback.reverse().join(' '))
      .experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 })
      .toString()
      .split(' ')
      .filter(move => move !== '')
  };
}

function getFirstPendingIndex(slots) {
  return slots.findIndex(s => s.state !== 'done');
}

/** @returns {{ move: string | null, hasExtraMoves: boolean }} */
export function getSolutionHintState(alg, cubeMoves) {
  if (!alg || typeof alg !== 'string') {
    return { move: null, hasExtraMoves: false };
  }

  const expected = parseAlgMoves(alg);

  if (!expected.length) {
    return { move: null, hasExtraMoves: false };
  }

  if (!cubeMoves?.length) {
    const first = expected[0];
    const quarter = quarterMoveForHalfTurn(first);

    return { move: quarter ?? first, hasExtraMoves: false };
  }

  const { moves: progress } = checkScrambleProgress(expected, cubeMoves);
  const hasExtraMoves = progress.some((m) => m.status === MoveScrambleStatus.INCORRECT);

  if (hasExtraMoves) {
    return { move: null, hasExtraMoves: true };
  }

  const slotProgress = progress.slice(0, expected.length);
  const currentIndex = slotProgress.findIndex((m) => m.status !== MoveScrambleStatus.CORRECT);

  if (currentIndex === -1) {
    return { move: null, hasExtraMoves: false };
  }

  const progressEntry = slotProgress[currentIndex];
  const expectedMove = expected[currentIndex];

  if (progressEntry?.status === MoveScrambleStatus.PARTIAL && quarterMoveForHalfTurn(expectedMove)) {
    return { move: progressEntry.move, hasExtraMoves: false };
  }

  const quarterHalf = quarterMoveForHalfTurn(expectedMove);

  if (quarterHalf && progressEntry?.status === MoveScrambleStatus.WAITING) {
    return { move: quarterHalf, hasExtraMoves: false };
  }

  return { move: expectedMove, hasExtraMoves: false };
}

/** Current expected move in a solution alg from moves performed since setup. */
export function getCurrentSolutionHintMove(alg, cubeMoves) {
  return getSolutionHintState(alg, cubeMoves).move;
}