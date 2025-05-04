import { TEMPLATES } from '../utils/templates.js';

class RubiksCube {
  constructor() {
    this.reset();
  }

  reset() {
    this.cube = {
      U: Array(3).fill().map(() => Array(3).fill('U')),
      D: Array(3).fill().map(() => Array(3).fill('D')),
      F: Array(3).fill().map(() => Array(3).fill('F')),
      B: Array(3).fill().map(() => Array(3).fill('B')),
      R: Array(3).fill().map(() => Array(3).fill('R')),
      L: Array(3).fill().map(() => Array(3).fill('L')),
    };
  }

  applyMove(move) {
    const face = move[0];
    const isPrime = move.includes('\'');
    const isDouble = move.includes('2');

    let rotations = 1;
    if (isPrime) rotations = 3;
    if (isDouble) rotations = 2;

    for (let i = 0; i < rotations; i++) {
      this.rotateFace(face);
    }
  }

  rotateFace(face) {
    const { cube } = this;
    const f = cube[face];

    // Rotate the face itself
    cube[face] = [
      [f[2][0], f[1][0], f[0][0]],
      [f[2][1], f[1][1], f[0][1]],
      [f[2][2], f[1][2], f[0][2]],
    ];

    // Rotate adjacent edges
    switch (face) {
      case 'U':
        [cube.F[0][0], cube.F[0][1], cube.F[0][2],
          cube.R[0][0], cube.R[0][1], cube.R[0][2],
          cube.B[0][0], cube.B[0][1], cube.B[0][2],
          cube.L[0][0], cube.L[0][1], cube.L[0][2]] =
          [cube.R[0][0], cube.R[0][1], cube.R[0][2],
            cube.B[0][0], cube.B[0][1], cube.B[0][2],
            cube.L[0][0], cube.L[0][1], cube.L[0][2],
            cube.F[0][0], cube.F[0][1], cube.F[0][2]];
        break;

      case 'D':
        [cube.F[2][0], cube.F[2][1], cube.F[2][2],
          cube.L[2][0], cube.L[2][1], cube.L[2][2],
          cube.B[2][0], cube.B[2][1], cube.B[2][2],
          cube.R[2][0], cube.R[2][1], cube.R[2][2]] =
          [cube.L[2][0], cube.L[2][1], cube.L[2][2],
            cube.B[2][0], cube.B[2][1], cube.B[2][2],
            cube.R[2][0], cube.R[2][1], cube.R[2][2],
            cube.F[2][0], cube.F[2][1], cube.F[2][2]];
        break;

      case 'F':
        [cube.U[2][0], cube.U[2][1], cube.U[2][2],
          cube.R[0][0], cube.R[1][0], cube.R[2][0],
          cube.D[0][2], cube.D[0][1], cube.D[0][0],
          cube.L[2][2], cube.L[1][2], cube.L[0][2]] =
          [cube.L[2][2], cube.L[1][2], cube.L[0][2],
            cube.U[2][0], cube.U[2][1], cube.U[2][2],
            cube.R[0][0], cube.R[1][0], cube.R[2][0],
            cube.D[0][2], cube.D[0][1], cube.D[0][0]];
        break;

      case 'B':
        [cube.U[0][2], cube.U[0][1], cube.U[0][0],
          cube.L[0][0], cube.L[1][0], cube.L[2][0],
          cube.D[2][0], cube.D[2][1], cube.D[2][2],
          cube.R[2][2], cube.R[1][2], cube.R[0][2]] =
          [cube.R[2][2], cube.R[1][2], cube.R[0][2],
            cube.U[0][2], cube.U[0][1], cube.U[0][0],
            cube.L[0][0], cube.L[1][0], cube.L[2][0],
            cube.D[2][0], cube.D[2][1], cube.D[2][2]];
        break;

      case 'R':
        [cube.U[0][2], cube.U[1][2], cube.U[2][2],
          cube.F[0][2], cube.F[1][2], cube.F[2][2],
          cube.D[0][2], cube.D[1][2], cube.D[2][2],
          cube.B[2][0], cube.B[1][0], cube.B[0][0]] =
          [cube.F[0][2], cube.F[1][2], cube.F[2][2],
            cube.D[0][2], cube.D[1][2], cube.D[2][2],
            cube.B[2][0], cube.B[1][0], cube.B[0][0],
            cube.U[0][2], cube.U[1][2], cube.U[2][2]];
        break;

      case 'L':
        [cube.U[0][0], cube.U[1][0], cube.U[2][0],
          cube.B[2][2], cube.B[1][2], cube.B[0][2],
          cube.D[0][0], cube.D[1][0], cube.D[2][0],
          cube.F[0][0], cube.F[1][0], cube.F[2][0]] =
          [cube.B[2][2], cube.B[1][2], cube.B[0][2],
            cube.D[0][0], cube.D[1][0], cube.D[2][0],
            cube.F[0][0], cube.F[1][0], cube.F[2][0],
            cube.U[0][0], cube.U[1][0], cube.U[2][0]];
        break;
    }
  }

  applyAlgorithm(algorithm) {
    const moves = algorithm.split(' ').filter(m => m.trim());
    moves.forEach(move => this.applyMove(move));
  }

  matchesTemplate(template) {
    const colorMap = {}; // Для меток (U, F, D...)
    const wildcardMap = {}; // Для wildcards (*F, *U...)

    // 1. Сначала определяем цвета для всех меток (кроме составных условий)
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

    // console.log(colorMap);
    // console.log(wildcardMap);

    // 2. Проверяем соответствие с учетом условий
    for (const face in template) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const pattern = template[face][i][j];
          const actual = this.cube[face][i][j];

          if (pattern === '*') continue;

          // Обработка условий вида U|D
          if (pattern.includes('|')) {
            const options = pattern.split('|');
            const isValid = options.some(opt => {
              opt = opt.trim();
              // Для wildcards
              if (opt.startsWith('*')) {
                return wildcardMap[opt] === actual;
              }
              // Для обычных меток
              const expected = colorMap[opt] ?? opt; // Если метка не определена, используем как литерал
              return expected === actual;
            });
            if (!isValid) return false;
            continue;
          }

          // Обработка wildcards
          if (pattern.startsWith('*')) {
            if (pattern in wildcardMap) {
              if (wildcardMap[pattern] !== actual) return false;
            } else {
              wildcardMap[pattern] = actual;
            }
            continue;
          }

          // Проверка обычных меток
          const expected = colorMap[pattern] ?? pattern; // Используем литерал если метка не определена
          if (expected !== actual) return false;
        }
      }
    }
    return true;
  }

  generateAllOrientations(template) {
    const orientations = new Set();

    // 6 возможных граней сверху (U, D, F, B, R, L)
    const faceUpRotations = [
      { axis: 'none', rotations: 0 }, // U up (исходная ориентация)
      { axis: 'x', rotations: 2 },    // D up (поворот на 180 по X)
      { axis: 'x', rotations: 1 },    // F up (поворот на 90 по X)
      { axis: 'x', rotations: 3 },    // B up (поворот на 270 по X)
      { axis: 'y', rotations: 1 },    // R up (поворот на 90 по Y)
      { axis: 'y', rotations: 3 },    // L up (поворот на 270 по Y)
    ];

    for (const faceUp of faceUpRotations) {
      let oriented = JSON.parse(JSON.stringify(template));

      // Устанавливаем нужную грань сверху
      if (faceUp.axis === 'x') {
        for (let i = 0; i < faceUp.rotations; i++) {
          oriented = this.rotateX(oriented);
        }
      } else if (faceUp.axis === 'y') {
        for (let i = 0; i < faceUp.rotations; i++) {
          oriented = this.rotateY(oriented);
        }
      }

      // 4 возможных поворота вокруг вертикальной оси (U/D)
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
      U: state.F.map(row => [...row]),       // F -> U (без изменений)
      F: state.D.map(row => [...row]),       // D -> F (без изменений)
      D: this.rotateFaceCW(this.rotateFaceCW(state.B)),// B -> D (вертикальное отражение)
      // D: state.B.map(row => [...row]), // B -> D (вертикальное отражение)
      B: this.flipFace(this.flipFace(state.U, 'vertical')), // U -> B (вертикальное отражение)
      L: this.rotateFaceCCW(state.L),         // L поворачивается по часовой
      R: this.rotateFaceCW(state.R),        // R поворачивается против часовой
    };
  }

  rotateY(state) {
    return {
      R: state.B.map(row => [...row]),         // F поворачивается по часовой
      F: state.R.map(row => [...row]),    // R поворачивается по часовой
      B: state.L.map(row => [...row]),         // B поворачивается по часовой
      L: state.F.map(row => [...row]),         // L поворачивается по часовой
      U: this.rotateFaceCW(state.U),         // U поворачивается по часовой
      D: this.rotateFaceCCW(state.D),       // D поворачивается против часовой
    };
  }

  rotateZ(state) {
    return {
      U: this.rotateFaceCW(state.L),        // L -> U (поворот по часовой)
      R: this.rotateFaceCW(state.U),        // U -> R (поворот по часовой)
      D: this.rotateFaceCW(state.R),        // R -> D (поворот по часовой)
      L: this.rotateFaceCW(state.D),        // D -> L (поворот по часовой)
      F: this.rotateFaceCW(state.F),        // F поворачивается по часовой
      B: this.rotateFaceCCW(state.B),       // B поворачивается против часовой
    };
  }

// Обновленная функция отражения с учетом направления
  flipFace(face, direction = 'horizontal') {
    if (direction === 'horizontal') {
      return face.map(row => [...row].reverse());
    } else { // vertical
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


  // Проверка шаблона во всех ориентациях
  matchesAnyOrientation(baseTemplate) {

    const allOrientations =
      // [baseTemplate];
      this.generateAllOrientations(baseTemplate);
    return allOrientations.some(template =>
      this.matchesTemplate(template),
    );
  }

  toString() {

    // Color mapping for terminal output
    const colors = {
      'U': '\x1b[47mU\x1b[0m', // White
      'D': '\x1b[43mD\x1b[0m', // Yellow
      'R': '\x1b[41mR\x1b[0m', // Red
      'B': '\x1b[44mB\x1b[0m', // Blue
      'F': '\x1b[42mF\x1b[0m', // Green
      'L': '\x1b[45mL\x1b[0m',  // Orange
    };

    // Build each face with borders
    const buildFace = (face) => face.map(row =>
      row.map(c => colors[c]).join(' '),
    ).join('\n');

    // Get all faces
    const u = buildFace(this.cube.U).split('\n');
    const l = buildFace(this.cube.L).split('\n');
    const f = buildFace(this.cube.F).split('\n');
    const r = buildFace(this.cube.R).split('\n');
    const b = buildFace(this.cube.B).split('\n');
    const d = buildFace(this.cube.D).split('\n');

    // Construct the net visualization
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

  orientationToString(orientation) {

    const build = (face) => face.map(row =>
      row.join(' '),
    ).join('\n');

    // Get all faces
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

  //     [U]
  // [L][F][R][B]
  //     [D]


  getAvailableMethods() {
    return Object.keys(TEMPLATES).filter(method => method !== 'SOLVED_CUBE');
  }

  getMethodSteps(method) {
    if (!TEMPLATES[method]) return null;
    return Object.keys(TEMPLATES[method]);
  }

  analyzeSolve(scramble, solution, method = 'ROUX') {
    // Validate method exists
    if (!TEMPLATES[method]) {
      throw new Error(`Method ${method} not found in templates`);
    }

    // Get steps for the method in correct order
    const steps = this.getMethodSteps(method);
    if (!steps || steps.length === 0) {
      throw new Error(`No steps defined for method ${method}`);
    }

    // Prepare result structure
    const result = {
      scramble: { moves: scramble.split(' ').filter(m => m.trim()), plain: scramble },
      solution: { moves: solution.split(' ').filter(m => m.trim()), plain: solution },
      method: method,
      steps: {},
    };

    // Initialize steps
    steps.forEach(step => {
      result.steps[step] = {
        moves: [],
        found: false,
        plain: '',
      };
    });

    const moves = result.solution.moves;
    let currentMoveIndex = 0;
    let appliedMoves = 0;

    // Apply scramble first
    const cube = new RubiksCube();
    cube.applyAlgorithm(scramble);

    // Check each move sequentially
    while (currentMoveIndex < moves.length) {
      const currentCube = new RubiksCube();
      currentCube.applyAlgorithm(scramble);
      currentCube.applyAlgorithm(moves.slice(0, currentMoveIndex + 1).join(' '));

      // Check steps in order
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        // Skip if already found
        if (result.steps[step].found) continue;

        // Check if previous steps are found (if not first step)
        if (i > 0 && !result.steps[steps[i - 1]].found) break;

        if (currentCube.matchesAnyOrientation(TEMPLATES[method][step])) {
          result.steps[step].moves = moves.slice(appliedMoves, currentMoveIndex + 1);
          result.steps[step].plain = result.steps[step].moves.join(' ');
          result.steps[step].found = true;
          appliedMoves = currentMoveIndex + 1;
          break;
        }
      }

      currentMoveIndex++;
    }
    return result;
  }

}

// // Пример использования
// const cube = new RubiksCube();
// cube.applyAlgorithm('B\' R2 B\' F2 D2 F\' U2 F\' D2 B U R\' D\' R\' U\' B F2 L\' F R\'');
// const orientations = cube.generateAllOrientations(TEMPLATES.ROUX.EO);
// // console.log("all possible orientations")
// // console.log(orientations.length);
// // orientations.map(or => {
// //   console.log(cube.orientationToString(or));
// // });
//
//
// // Проверка шаблонов
// cube.applyAlgorithm('B\' R\' D2 F U\' F L\' U L'); // Применяем алгоритм
// console.log(cube.toString());
// console.log('Первый блок:', cube.matchesAnyOrientation(TEMPLATES.ROUX.FIRST_2x3_BLOCK));
// // cube.reset();
// cube.applyAlgorithm('R2 U F R\' F\' R U R\' B\' R B R\' U\' R U2 R\' U F\' U\' F');
// console.log(cube.toString());
//
// console.log('2 блока:', cube.matchesAnyOrientation(TEMPLATES.ROUX.BOTH_2x3_BLOCK));
// // cube.reset();
//
// // Проверка шаблонов
//
// cube.applyAlgorithm('R U2\' R2\' F R F\' U2 R\' F R F\'');
// console.log(cube.toString());
//
// // console.log('CMLL:', cube.matchesAnyOrientation(TEMPLATES.ROUX.CMLL));
// // cube.reset();
// cube.applyAlgorithm('R\' L F\' R L\'');
// console.log(cube.toString());
//
//
// console.log('EO', cube.matchesAnyOrientation(TEMPLATES.ROUX.EO));
// console.log(cube.toString());
//
// // // cube.reset();
// // console.log('Собранный куб:', cube.matchesAnyOrientation(TEMPLATES.SOLVED_CUBE));
// // const scramble = 'B\' R2 B\' F2 D2 F\' U2 F\' D2 B U R\' D\' R\' U\' B F2 L\' F R\''
// // const solution = 'B\' R\' D2 F U\' F L\' U L R2 U F R\' F\' R U R\' B\' R B R\' U\' R U2 R\' U F\' U\' F R U2\' R2\' F R F\' U2 R\' F R F\' R\' L F\' R L\''
//
// const scramble = 'R2 B2 U2 F2 D2 R2 U2 R D2 B2 U2 B2 F\' U\' B L2 U\' R F L2';
// const solution = 'R B\' U\' F F U\' U\' L L U B\' R B U F\' U F B\' U B B U\' U\' B\' U B U\' B\' U F U\' F\' F\' U F U F U\' F\' U F U F\' U\' U U\' B U B\' U\' B\' R B R\' U\' F R B\' R\' B F\' B B\' U B U\' B\' B\' U\' R\' B U B\' U\' B\' R B B U\' B\' U\' B U B\' U B U\'';
// console.log(cube.analyzeSolve(scramble, solution, 'CFOP'));