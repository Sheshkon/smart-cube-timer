import { Alg } from 'cubing/alg';
import { cube3x3x3 } from 'cubing/puzzles';

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

export function checkScrambleProgress(scramble, cubeMoves) {
  // Initialize slots
  const slots = scramble.map(move => ({
    expected: move,
    output: { move: move, status: MoveScrambleStatus.WAITING, comment: 'expected but not yet performed' },
    state: 'pending' // 'pending' | 'partial' | 'done'
  }));

  const rollback = [];
  const extraErrors = [];
  let failure = false;

  for (const uMove of cubeMoves) {

    if (failure) {
      extraErrors.push({
        move: uMove,
        status: MoveScrambleStatus.INCORRECT,
        comment: 'unexpected move (after previous error)',
      });
      rollback.push(invertMove(uMove));
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
        // Try to complete (second R arrived)
        if (slot.expected.endsWith('2') && uMove[0] === slot.expected[0]) {
          matchedIndex = i;
          matchType = 'completion';
          break;
        }

        // If the move does not complete this partial slot, check independence.
        // If uMove is independent of slot.expected (e.g., R and L), we can search further.
        // If dependent (e.g., R and F), we are blocked.
        if (!areIndependent(uMove, slot.expected)) {
          break; // Dependent move blocks further search
        }
        // If independent — go to the next slot (continue)
        continue;
      }

      // 3. Handle Pending slot (not yet started)
      if (slot.state === 'pending') {
        const isExact = uMove === slot.expected;
        // Partial match: waiting for X2, got X or X' (but not X2)
        const isPartial = slot.expected.endsWith('2') && uMove[0] === slot.expected[0] && !uMove.endsWith('2');

        if (isExact || isPartial) {
          matchedIndex = i;
          matchType = isExact ? 'exact' : 'partial';
          break;
        }

        // If no match, check if we can skip this slot (independence)
        if (!areIndependent(uMove, slot.expected)) {
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
          move: uMove,
          status: MoveScrambleStatus.CORRECT,
          comment: matchedIndex === getFirstPendingIndex(slots) ? 'matches expected' : 'independent swap allowed'
        };
        slot.state = 'done';
      }
      else if (matchType === 'partial') {
        slot.output = {
          move: uMove,
          status: MoveScrambleStatus.PARTIAL,
          comment: 'partial move, independent allowed'
        };
        slot.state = 'partial';
      }
    } else {
      failure = true;
      extraErrors.push({
        move: uMove,
        status: MoveScrambleStatus.INCORRECT,
        comment: 'unexpected move',
      });
      rollback.push(invertMove(uMove));
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