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
  constructor(move, index, color = MoveColor.WHITE, isCurrent = false) {
    this.move = move;
    this.index = index;
    this.color = color;
    this.isCurrent = isCurrent;
  }
}

export { MoveColor,MoveScrambleStatus, ColoredMove };
