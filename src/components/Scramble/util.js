import { Alg } from 'cubing/alg';
import { randomScrambleForEvent } from 'cubing/scramble';

const MoveColor = Object.freeze({
  RED: 'red',
  GREEN: 'green',
  YELLOW: '#E49B0F',
  WHITE: 'white',
  GRAY: 'gray',
});

const MoveScrambleStatus = Object.freeze({
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  PARTIAL: 'partial',
  WAITING: 'waiting',
});

class ColoredMove {
  constructor(move, index, color = MoveColor.WHITE, isCurrent = false, layoutMove = move) {
    this.move = move;
    this.index = index;
    this.color = color;
    this.isCurrent = isCurrent;
    this.layoutMove = layoutMove;
  }
}

const FACE_AXES = {
  U: 0,
  D: 0,
  L: 1,
  R: 1,
  F: 2,
  B: 2,
};
const FACES = Object.keys(FACE_AXES);
const SUFFIXES = ['', "'", '2'];

export function randomMove333Scramble(moveCount = 21) {
  const moves = [];
  let lastFace = '';
  let lastAxis = -1;

  while (moves.length < moveCount) {
    const face = FACES[Math.floor(Math.random() * FACES.length)];
    const axis = FACE_AXES[face];
    if (face === lastFace || axis === lastAxis) continue;
    lastFace = face;
    lastAxis = axis;
    moves.push(face + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]);
  }

  return Alg.fromString(moves.join(' '));
}

function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    }),
  ]);
}

let cubingScrambleUnavailable = false;

export async function generate333Scramble() {
  if (cubingScrambleUnavailable) {
    return randomMove333Scramble();
  }

  try {
    return await withTimeout(randomScrambleForEvent('333'), 4000, 'randomScrambleForEvent');
  } catch (error) {
    cubingScrambleUnavailable = true;
    console.warn('cubing scramble worker failed, using fallback', error);
    return randomMove333Scramble();
  }
}

export { MoveColor, MoveScrambleStatus, ColoredMove };
