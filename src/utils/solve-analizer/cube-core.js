export class CubeCore {
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

  toString() {
    const colors = {
      'U': '\x1b[47mU\x1b[0m',
      'D': '\x1b[43mD\x1b[0m',
      'R': '\x1b[41mR\x1b[0m',
      'B': '\x1b[44mB\x1b[0m',
      'F': '\x1b[42mF\x1b[0m',
      'L': '\x1b[45mL\x1b[0m',
    };

    const buildFace = (face) => face.map(row =>
      row.map(c => colors[c]).join(' '),
    ).join('\n');

    const u = buildFace(this.cube.U).split('\n');
    const l = buildFace(this.cube.L).split('\n');
    const f = buildFace(this.cube.F).split('\n');
    const r = buildFace(this.cube.R).split('\n');
    const b = buildFace(this.cube.B).split('\n');
    const d = buildFace(this.cube.D).split('\n');

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