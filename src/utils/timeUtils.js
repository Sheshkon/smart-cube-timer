/**
 * Format milliseconds time into a readable string (MM:SS.ms)
 */
export const formatTime = (timeMs) => {
  if (!timeMs) return '00:00.000';
  
  // Convert milliseconds to parts
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = timeMs % 1000;
  
  // Format with leading zeros
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedMs = ms.toString().padStart(3, '0');
  
  return `${formattedMinutes}:${formattedSeconds}.${formattedMs}`;
};

/**
 * Generate scramble notation for 3x3 cube
 */
export const generateScramble = (moveCount = 20) => {
  const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers = ['', "'", '2'];
  
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
    'R': 'L',
    'L': 'R',
    'U': 'D',
    'D': 'U',
    'F': 'B',
    'B': 'F',
  };
  
  return opposites[face1] === face2;
};