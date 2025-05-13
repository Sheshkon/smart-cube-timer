import { CubeSolveAnalyzer } from 'src/utils/solve-analizer/cube-solve-analyzer.js';

export const TimerState = Object.freeze({
  IDLE: 0,
  INSPECTION: 1,
  READY: 2,
  RUNNING: 3,
  STOPPED: 4,
  DNS: 5,
});

export const getReconstruction = (scramble, fittedMoves, method = 'AUTO') => {
  const methods = ['ROUX', 'CFOP'];

  if (method !== 'AUTO') {
    const cube = new CubeSolveAnalyzer();
    return cube.analyzeSolve(scramble, fittedMoves, method);
  }

  const results = methods.map(m => {
    const cube = new CubeSolveAnalyzer();
    return cube.analyzeSolve(scramble, fittedMoves, m);
  });

  return results.reduce((best, current) => {
    const currentSuccess = Object.values(current.steps).filter(s => s.found).length;
    const bestSuccess = Object.values(best.steps).filter(s => s.found).length;
    return currentSuccess > bestSuccess ? current : best;
  });
};
