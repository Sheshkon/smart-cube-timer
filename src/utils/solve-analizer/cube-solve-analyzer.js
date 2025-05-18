// cube-solver.js

import { CubeCore } from 'src/utils/solve-analizer/cube-core.js';
import { TEMPLATES } from 'src/utils/templates.js';

export class CubeSolveAnalyzer extends CubeCore {
  matchesTemplate(template) {
    const colorMap = {};
    const wildcardMap = {};

    // 1. First pass to determine colors for labels
    for (const face in template) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const pattern = template[face][i][j];
          const actual = this.cube[face][i][j];

          if (pattern === '*' || pattern.includes('|')) continue;

          if (pattern.startsWith('*')) {
            wildcardMap[pattern] = actual;
            continue;
          }

          if (!(pattern in colorMap)) {
            colorMap[pattern] = actual;
          }
        }
      }
    }

    // 2. Verify match with conditions
    for (const face in template) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const pattern = template[face][i][j];
          const actual = this.cube[face][i][j];

          if (pattern === '*') continue;

          if (pattern.includes('|')) {
            const options = pattern.split('|');
            const isValid = options.some(opt => {
              opt = opt.trim();
              if (opt.startsWith('*')) {
                return wildcardMap[opt] === actual;
              }
              const expected = colorMap[opt] ?? opt;
              return expected === actual;
            });
            if (!isValid) return false;
            continue;
          }

          if (pattern.startsWith('*')) {
            if (pattern in wildcardMap) {
              if (wildcardMap[pattern] !== actual) return false;
            } else {
              wildcardMap[pattern] = actual;
            }
            continue;
          }

          const expected = colorMap[pattern] ?? pattern;
          if (expected !== actual) return false;
        }
      }
    }
    return true;
  }

  generateAllOrientations(template) {
    const orientations = new Set();

    const faceUpRotations = [
      { axis: 'none', rotations: 0 },
      { axis: 'x', rotations: 2 },
      { axis: 'x', rotations: 1 },
      { axis: 'x', rotations: 3 },
      { axis: 'y', rotations: 1 },
      { axis: 'y', rotations: 3 },
    ];

    for (const faceUp of faceUpRotations) {
      let oriented = JSON.parse(JSON.stringify(template));

      if (faceUp.axis === 'x') {
        for (let i = 0; i < faceUp.rotations; i++) {
          oriented = this.rotateX(oriented);
        }
      } else if (faceUp.axis === 'y') {
        for (let i = 0; i < faceUp.rotations; i++) {
          oriented = this.rotateY(oriented);
        }
      }

      for (let z = 0; z < 4; z++) {
        let finalOriented = JSON.parse(JSON.stringify(oriented));
        for (let i = 0; i < z; i++) {
          finalOriented = this.rotateZ(finalOriented);
        }
        orientations.add(JSON.stringify(finalOriented));
      }
    }

    return Array.from(orientations).map(o => JSON.parse(o));
  }

  rotateX(state) {
    return {
      U: state.F.map(row => [...row]),
      F: state.D.map(row => [...row]),
      D: this.rotateFaceCW(this.rotateFaceCW(state.B)),
      B: this.flipFace(this.flipFace(state.U, 'vertical')),
      L: this.rotateFaceCCW(state.L),
      R: this.rotateFaceCW(state.R),
    };
  }

  rotateY(state) {
    return {
      R: state.B.map(row => [...row]),
      F: state.R.map(row => [...row]),
      B: state.L.map(row => [...row]),
      L: state.F.map(row => [...row]),
      U: this.rotateFaceCW(state.U),
      D: this.rotateFaceCCW(state.D),
    };
  }

  rotateZ(state) {
    return {
      U: this.rotateFaceCW(state.L),
      R: this.rotateFaceCW(state.U),
      D: this.rotateFaceCW(state.R),
      L: this.rotateFaceCW(state.D),
      F: this.rotateFaceCW(state.F),
      B: this.rotateFaceCCW(state.B),
    };
  }

  flipFace(face, direction = 'horizontal') {
    if (direction === 'horizontal') {
      return face.map(row => [...row].reverse());
    } else {
      return [...face].reverse().map(row => [...row]);
    }
  }

  rotateFaceCW(face) {
    const size = face.length;
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => face[size - j - 1][i]),
    );
  }

  rotateFaceCCW(face) {
    const size = face.length;
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => face[j][size - i - 1]),
    );
  }

  matchesAnyOrientation(baseTemplate) {
    const allOrientations = this.generateAllOrientations(baseTemplate);
    return allOrientations.some(template => this.matchesTemplate(template));
  }

  getMethodSteps(method) {
    if (!TEMPLATES[method] || !TEMPLATES[method].steps) return null;
    return Object.keys(TEMPLATES[method].steps);
  }

  analyzeSolve(scramble, fittedMoves, method = 'ROUX') {
    if (!TEMPLATES[method]) {
      throw new Error(`Method ${method} not found in templates`);
    }

    const methodData = TEMPLATES[method];
    const steps = Object.keys(methodData.steps);
    if (!steps || steps.length === 0) {
      throw new Error(`No steps defined for method ${method}`);
    }

    // Prepare result structure with display names
    const result = {
      scramble: {
        moves: scramble.split(' ').filter(m => m.trim()),
        plain: scramble
      },
      solution: {
        moves: fittedMoves.map(el => el.move),
        plain: fittedMoves.map(el => el.move).join(' '),
        timestamps: fittedMoves
      },
      method: {
        name: method,
        displayName: methodData.name
      },
      steps: {},
      totalDuration: 0
    };

    // Initialize steps with display names
    steps.forEach(step => {
      const stepData = methodData.steps[step];
      result.steps[step] = {
        name: step,
        displayName: stepData.displayName,
        moves: [],
        found: false,
        plain: '',
        startTime: null,
        endTime: null,
        duration: null,
        relativeTime: null
      };
    });

    const moves = result.solution.moves;
    const timestamps = result.solution.timestamps;

    // Calculate total duration
    if (timestamps.length > 0) {
      const firstTimestamp = timestamps[0]?.cubeTimestamp || 0;
      const lastTimestamp = timestamps[timestamps.length - 1]?.cubeTimestamp || 0;
      result.totalDuration = lastTimestamp - firstTimestamp;
    }

    let currentMoveIndex = 0;
    let appliedMoves = 0;

    const cube = new CubeSolveAnalyzer();
    cube.applyAlgorithm(scramble);

    while (currentMoveIndex < moves.length) {
      const currentCube = new CubeSolveAnalyzer();
      currentCube.applyAlgorithm(scramble);
      currentCube.applyAlgorithm(moves.slice(0, currentMoveIndex + 1).join(' '));

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        if (result.steps[step].found) continue;
        if (i > 0 && !result.steps[steps[i - 1]].found) break;

        if (currentCube.matchesAnyOrientation(methodData.steps[step].template)) {
          // Store moves
          const stepMoves = moves.slice(appliedMoves, currentMoveIndex + 1);
          result.steps[step].moves = stepMoves;
          result.steps[step].plain = stepMoves.join(' ');
          result.steps[step].found = true;

          // Calculate timing
          const firstMoveIndex = appliedMoves;
          const lastMoveIndex = currentMoveIndex;
          const firstTimestamp = timestamps[firstMoveIndex]?.cubeTimestamp;
          const lastTimestamp = timestamps[lastMoveIndex]?.cubeTimestamp;

          if (firstTimestamp && lastTimestamp) {
            result.steps[step].startTime = firstTimestamp;
            result.steps[step].endTime = lastTimestamp;
            result.steps[step].duration = lastTimestamp - firstTimestamp;
            result.steps[step].relativeTime = firstTimestamp - (timestamps[0]?.cubeTimestamp || 0);
          }

          appliedMoves = currentMoveIndex + 1;
          break;
        }
      }

      currentMoveIndex++;
    }

    // Verify and adjust timing if needed
    const totalStepsDuration = Object.values(result.steps)
      .reduce((sum, step) => sum + (step.duration || 0), 0);

    if (totalStepsDuration > 0 && result.totalDuration > 0 &&
      Math.abs(totalStepsDuration - result.totalDuration) > 100) {
      const ratio = result.totalDuration / totalStepsDuration;
      Object.values(result.steps).forEach(step => {
        if (step.duration) {
          step.duration = Math.round(step.duration * ratio);
          step.endTime = step.startTime + step.duration;
        }
      });
    }

    return result;
  }

  orientationToString(orientation) {
    const build = (face) => face.map(row =>
      row.join(' '),
    ).join('\n');

    const u = build(orientation.U).split('\n');
    const l = build(orientation.L).split('\n');
    const f = build(orientation.F).split('\n');
    const r = build(orientation.R).split('\n');
    const b = build(orientation.B).split('\n');
    const d = build(orientation.D).split('\n');

    return `
        ↑ [U]
        ${u[0]}
        ${u[1]}
        ${u[2]}
[L] ← [F] → [R] → [B]
${l[0]} │ ${f[0]} │ ${r[0]} │ ${b[0]}
${l[1]} │ ${f[1]} │ ${r[1]} │ ${b[1]}
${l[2]} │ ${f[2]} │ ${r[2]} │ ${b[2]}
        ↓ [D]
        ${d[0]}
        ${d[1]}
        ${d[2]}
    `;
  }
}