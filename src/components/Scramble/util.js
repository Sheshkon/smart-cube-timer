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

export { MoveColor,MoveScrambleStatus, ColoredMove };
