import { Alg } from 'cubing/alg';
import { cube3x3x3 } from 'cubing/puzzles';

const MoveColor = Object.freeze({
  RED: 'red',
  GREEN: 'green',
  YELLOW: '#E49B0F',
  WHITE: 'white',
  GRAY: 'gray',
});

class ColoredMove {
  constructor(move, index, color = MoveColor.WHITE, isCurrent = false) {
    this.move = move;
    this.index = index;
    this.color = color;
    this.isCurrent = isCurrent;
  }
}

const getInverseMoves = (cubeMoves, startWrongIndex) =>
  new Alg(cubeMoves.slice(startWrongIndex).join(' '))
    .experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 })
    .invert()
    .toString()
    .split(' ')
    .map((el, index) => new ColoredMove(el, index, MoveColor.RED));

/**
 * Generate scramble notation for 3x3 cube
 */
const generateScramble = (moveCount = 20) => {
  const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers = ['', '\'', '2'];

  let scramble = [];
  let lastFace = null;
  let secondLastFace = null;

  for (let i = 0; i < moveCount; i++) {
    // Choose a random face that doesn't create redundancy
    let face;
    do {
      face = moves[Math.floor(Math.random() * moves.length)];
    } while (
      face === lastFace ||
      (face === secondLastFace && lastFace && areOpposite(face, lastFace))
      );

    // Add a random modifier
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(`${face}${modifier}`);

    // Update history
    secondLastFace = lastFace;
    lastFace = face;
  }

  return scramble.join(' ');
};

/**
 * Check if two faces are opposite
 */
const areOpposite = (face1, face2) => {
  const opposites = {
    R: 'L',
    L: 'R',
    U: 'D',
    D: 'U',
    F: 'B',
    B: 'F',
  };

  return opposites[face1] === face2;
};

export { MoveColor, ColoredMove, getInverseMoves, generateScramble };
