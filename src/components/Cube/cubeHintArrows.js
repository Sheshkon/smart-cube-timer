import {
  PG3D_MESH_SCALE,
  axisFromPuzzle,
  cubeHalfInRootSpace,
  unscaledHalfFromPositions,
  visualCubeHalf,
} from 'src/components/Cube/cubeHintArrowMath.js';
import { parseCubeMove } from 'src/components/MiniGames/useFaceMoveInput.js';
import * as THREE from 'three';

const ENABLED_FACES = new Set(['U', 'D', 'L', 'R', 'F', 'B']);

const HINT_STYLE = {
  colors: {
    arrow: 0x000000,
    orbit: 0x000000,
  },

  orbit: {
    radius: 1.4,
    centerOffset: 0.65,
    thickness: 0.018,
    opacity: 0,
    segments: 128,
    radialSegments: 5,
  },

  arrow: {
    count: 3,
    length: 2,
    opacity: 0.4,
    width: 0.6,
    shaftWidth: 0.34,
    headLength: 0.1,
    curveSegments: 100,
  },

  animation: {
    speed: 0.62,
    halfTurnSpeed: 0.42,
    phaseOffset: 0.5,
  },
};

function isHintObject(object) {
  return object?.name === 'cubeHintArrows' || object?.userData?.cubeHintArrow;
}

function findPuzzleRoot(scene, hintGroup) {
  return (
    scene.children.find((child) => child !== hintGroup && child.axesInfo) ??
    scene.children.find((child) => child !== hintGroup && child.type === 'Object3D') ??
    scene
  );
}

function findSampleMesh(root) {
  let sample = null;

  root.traverse((child) => {
    if (
      sample ||
      !child.isMesh ||
      isHintObject(child) ||
      !child.geometry?.getAttribute?.('position')
    ) {
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    if (materials.some((material) => material && material.visible !== false)) {
      sample = child;
    }
  });

  return sample;
}

function estimateCubeHalfExtent(root) {
  const sample = findSampleMesh(root);
  const positions = sample?.geometry?.getAttribute?.('position');

  return cubeHalfInRootSpace(root, sample, unscaledHalfFromPositions(positions?.array));
}

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose();

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    materials.forEach((material) => {
      if (material?.userData?.cubeHintOwned) {
        material.dispose();
      }
    });
  });
}

function makeMaterial(color, opacity = 1) {
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity,
    depthTest: true,
    depthWrite: false,
  });

  material.userData.cubeHintOwned = true;

  return material;
}

function makeCurvedArrowGeometry({
  length,
  width,
  orbitRadius,
  shaftWidthRatio,
  headLengthRatio,
  segments,
}) {
  const geometry = new THREE.BufferGeometry();

  const vertices = [];
  const indices = [];

  const shaftHalfWidth = width * shaftWidthRatio * 0.5;
  const headHalfWidth = width * 0.5;
  const headStart = 1 - headLengthRatio;

  const radialOffset = Math.max(orbitRadius * 0.025, width * 0.1);
  const halfThickness = width * 0.025;

  const segmentCount = Math.max(8, Math.floor(segments));
  const shaftSegments = Math.max(2, Math.round(segmentCount * headStart));
  const tipSegments = Math.max(2, segmentCount - shaftSegments);

  const addSection = (t, halfWidth) => {
    const distance = (t - 0.5) * length;
    const angle = distance / orbitRadius;

    const addVertex = (radialThickness, z) => {
      const radius = orbitRadius + radialOffset + radialThickness;

      vertices.push(radius * Math.sin(angle), orbitRadius - radius * Math.cos(angle), z);
    };

    addVertex(halfThickness, -halfWidth);
    addVertex(halfThickness, halfWidth);
    addVertex(-halfThickness, -halfWidth);
    addVertex(-halfThickness, halfWidth);
  };

  for (let i = 0; i <= shaftSegments; i += 1) {
    const t = (i / shaftSegments) * headStart;

    addSection(t, shaftHalfWidth);
  }

  addSection(headStart, headHalfWidth);

  for (let i = 1; i <= tipSegments; i += 1) {
    const t = i / tipSegments;

    addSection(headStart + (1 - headStart) * t, headHalfWidth * (1 - t));
  }

  const addQuad = (a, b, c, d) => {
    indices.push(a, b, c, a, c, d);
  };

  const sectionCount = vertices.length / 12;

  for (let i = 0; i < sectionCount - 1; i += 1) {
    const a = i * 4;
    const b = (i + 1) * 4;

    addQuad(a, b, b + 1, a + 1);
    addQuad(a + 2, a + 3, b + 3, b + 2);
    addQuad(a, a + 2, b + 2, b);
    addQuad(a + 1, b + 1, b + 3, a + 3);
  }

  addQuad(0, 1, 3, 2);

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function addArrowLayer(arrowGroup, color, opacity, width, length, orbitRadius, depth) {
  const { arrow } = HINT_STYLE;

  const geometry = makeCurvedArrowGeometry({
    length,
    width,
    orbitRadius,
    shaftWidthRatio: arrow.shaftWidth,
    headLengthRatio: arrow.headLength,
    segments: arrow.curveSegments,
  });

  geometry.translate(0, 0, depth);
  geometry.userData.cubeHintLocalPositions = geometry.getAttribute('position').array.slice();

  const mesh = new THREE.Mesh(geometry, makeMaterial(color, opacity));

  mesh.userData.cubeHintArrow = true;
  mesh.renderOrder = 12;
  mesh.frustumCulled = false;

  arrowGroup.add(mesh);

  return mesh;
}

function addOrbitingArrows(
  group,
  face,
  prime,
  repeats,
  cubeHalf,
  referenceAxes,
  centerOffset = HINT_STYLE.orbit.centerOffset
) {
  const axis = axisFromPuzzle(group.parent?.axesInfo, face);

  if (!axis) return;

  const normal = axis.clone().normalize();

  const projectToOrbitPlane = (vector) =>
    vector.clone().addScaledVector(normal, -vector.dot(normal)).normalize();

  let u = projectToOrbitPlane(referenceAxes.F ?? new THREE.Vector3(0, 0, 1));

  if (u.lengthSq() < 1e-6) {
    u = projectToOrbitPlane(referenceAxes.U ?? new THREE.Vector3(0, 1, 0));
  }

  if (u.lengthSq() < 1e-6) return;

  const v = new THREE.Vector3().crossVectors(normal, u).normalize();

  if (v.lengthSq() < 1e-6) return;

  const { orbit, arrow, animation, colors } = HINT_STYLE;

  const orbitRadius = cubeHalf * orbit.radius;

  const orbitCenter = normal.clone().multiplyScalar(cubeHalf * centerOffset);

  const orbitPoints = Array.from({ length: 96 }, (_, index) => {
    const angle = (index / 96) * Math.PI * 2;

    return orbitCenter
      .clone()
      .addScaledVector(u, Math.cos(angle) * orbitRadius)
      .addScaledVector(v, Math.sin(angle) * orbitRadius);
  });

  const curve = new THREE.CatmullRomCurve3(orbitPoints, true, 'centripetal');

  const track = new THREE.Mesh(
    new THREE.TubeGeometry(
      curve,
      orbit.segments,
      cubeHalf * orbit.thickness,
      orbit.radialSegments,
      true
    ),
    makeMaterial(colors.orbit, orbit.opacity)
  );

  track.userData.cubeHintArrow = true;
  track.renderOrder = 11;
  track.frustumCulled = false;

  group.add(track);

  const moveAngle = Math.abs(repeats) === 2 ? Math.PI : Math.abs(repeats || 1) * (Math.PI / 2);

  const moveDirection = Math.sign(prime ? moveAngle : -moveAngle) || 1;

  const speed = moveDirection * (repeats === 2 ? animation.halfTurnSpeed : animation.speed);

  const arrowLength = cubeHalf * arrow.length;
  const arrowWidth = cubeHalf * arrow.width;

  const startedAt = performance.now();

  for (let index = 0; index < arrow.count; index += 1) {
    const arrowGroup = new THREE.Group();

    arrowGroup.userData.cubeHintArrow = true;
    arrowGroup.renderOrder = 12;

    const meshes = [
      addArrowLayer(
        arrowGroup,
        colors.arrow,
        arrow.opacity,
        arrowWidth,
        arrowLength,
        orbitRadius,
        0
      ),
    ];

    group.add(arrowGroup);

    const position = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const inward = new THREE.Vector3();

    const updatePose = () => {
      const elapsed = (performance.now() - startedAt) / 1000;

      const angle = ((index * Math.PI * 4) / arrow.count) * animation.phaseOffset + elapsed * speed;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      position
        .copy(orbitCenter)
        .addScaledVector(u, cos * orbitRadius)
        .addScaledVector(v, sin * orbitRadius);

      tangent
        .copy(u)
        .multiplyScalar(-sin)
        .addScaledVector(v, cos)
        .multiplyScalar(moveDirection)
        .normalize();

      inward.copy(u).multiplyScalar(-cos).addScaledVector(v, -sin).normalize();

      meshes.forEach((mesh) => {
        const geometry = mesh.geometry;

        const localPositions = geometry.userData.cubeHintLocalPositions;

        const positions = geometry.getAttribute('position');

        const vertices = positions.array;

        for (let i = 0; i < localPositions.length; i += 3) {
          const x = localPositions[i];
          const y = localPositions[i + 1];
          const z = localPositions[i + 2];

          vertices[i] = position.x + tangent.x * x + inward.x * y + normal.x * z;

          vertices[i + 1] = position.y + tangent.y * x + inward.y * y + normal.y * z;

          vertices[i + 2] = position.z + tangent.z * x + inward.z * y + normal.z * z;
        }

        positions.needsUpdate = true;
      });
    };

    meshes.forEach((mesh) => {
      mesh.onBeforeRender = updatePose;
    });

    updatePose();
  }
}

function buildArrows(group, face, prime, repeats, cubeHalf, isWide = false) {
  while (group.children.length) {
    const child = group.children[0];

    group.remove(child);
    disposeObject(child);
  }

  const axesInfo = group.parent?.axesInfo;

  const referenceAxes = {
    F: axisFromPuzzle(axesInfo, 'F'),
    U: axisFromPuzzle(axesInfo, 'U'),
    R: axisFromPuzzle(axesInfo, 'R'),
  };

  // Wide moves rotate the outer and the middle layer in the same direction.
  addOrbitingArrows(group, face, prime, repeats, cubeHalf, referenceAxes);

  if (isWide) {
    addOrbitingArrows(group, face, prime, repeats, cubeHalf, referenceAxes, 0);
  }
}

/** Normalizes smart-cube / sheet notation to "U", "U'", "U2", … */
export function normalizeCubeMove(move) {
  if (!move || typeof move !== 'string') {
    return '';
  }

  const token = move
    .trim()
    .replace(/[()]/g, '')
    .replace(/[\u2018\u2019\u2032`´]/g, '\'');

  if (!token) {
    return '';
  }

  // Lowercase r/u/f/d denotes a wide turn, not a single-face turn.
  if (/^[rufd][2']?$/.test(token)) {
    return token;
  }

  return token[0].toUpperCase() + token.slice(1);
}

function parseHintMove(move) {
  const token = normalizeCubeMove(move);

  // Accept both r / r' / r2 and the equivalent Rw / Rw' / Rw2 notation.
  const wide = /^([rufd])([2']?)$/.exec(token) ?? /^([RUFD])w([2']?)$/.exec(token);

  const parsed = parseCubeMove(wide ? `${wide[1].toUpperCase()}${wide[2]}` : token);

  return parsed ? { ...parsed, isWide: Boolean(wide) } : null;
}

/** @param {string} alg */
export function parseAlgMoves(alg) {
  if (!alg || typeof alg !== 'string') {
    return [];
  }

  return alg
    .trim()
    .split(/\s+/)
    .map((token) => normalizeCubeMove(token))
    .filter(Boolean);
}

/** @param {string} alg @param {number} index
 * @param index
 */
export function getMoveAtAlgIndex(alg, index) {
  const moves = parseAlgMoves(alg);

  return moves[index] ?? null;
}

/** ColoredMove[] from scramble UI or similar */
export function getCurrentMoveFromDisplay(moveDisplay) {
  if (!Array.isArray(moveDisplay) || !moveDisplay.length) {
    return null;
  }

  return (
    moveDisplay.find((move) => move.isCurrent)?.move ??
    moveDisplay.find((move) => move.color !== 'gray')?.move ??
    null
  );
}

export function getCurrentScrambleMove(scrambleDisplay) {
  return getCurrentMoveFromDisplay(scrambleDisplay);
}

export function createCubeHintArrows() {
  const group = new THREE.Group();

  group.name = 'cubeHintArrows';
  group.visible = false;
  group.renderOrder = 10;

  let attachedRoot = null;
  let lastKey = '';

  let cubeHalf = visualCubeHalf(1.11, PG3D_MESH_SCALE);

  const refreshSize = () => {
    if (!attachedRoot) return;

    const nextSize = estimateCubeHalfExtent(attachedRoot);

    if (Math.abs(nextSize - cubeHalf) > 0.02) {
      cubeHalf = nextSize;
      lastKey = '';
    }
  };

  const attach = (scene) => {
    if (!scene) return;

    const root = findPuzzleRoot(scene, group);

    if (group.parent === root && attachedRoot === root) {
      return;
    }

    group.parent?.remove(group);

    attachedRoot = root;
    root.add(group);

    cubeHalf = estimateCubeHalfExtent(root);
    lastKey = '';
  };

  const update = ({ move, visible, theme }) => {
    refreshSize();

    if (!visible || !move || !attachedRoot) {
      group.visible = false;
      return;
    }

    const parsed = parseHintMove(move);

    if (
      !parsed ||
      !ENABLED_FACES.has(parsed.face) ||
      !axisFromPuzzle(attachedRoot.axesInfo, parsed.face)
    ) {
      group.visible = false;
      return;
    }

    const key = [
      parsed.face,
      Number(parsed.prime),
      parsed.repeats,
      Number(parsed.isWide),
      cubeHalf.toFixed(3),
      theme,
    ].join('|');

    if (key !== lastKey) {
      const color = theme === 'dark' ? 0xffffff : 0x000000;

      HINT_STYLE.colors.arrow = color;
      HINT_STYLE.colors.orbit = color;

      buildArrows(group, parsed.face, parsed.prime, parsed.repeats, cubeHalf, parsed.isWide);

      lastKey = key;
    }

    group.visible = true;
  };

  const dispose = () => {
    group.parent?.remove(group);
    attachedRoot = null;
    disposeObject(group);
  };

  return {
    group,
    attach,
    update,
    dispose,
  };
}
