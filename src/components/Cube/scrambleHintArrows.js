import {
  PG3D_MESH_SCALE,
  axisFromPuzzle,
  cubeHalfInRootSpace,
  unscaledHalfFromPositions,
  visualCubeHalf,
} from 'src/components/Cube/scrambleHintArrowMath.js';
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
  return object?.name === 'scrambleHintArrows' || object?.userData?.scrambleHintArrow;
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
      if (material?.userData?.scrambleHintOwned) {
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

  material.userData.scrambleHintOwned = true;

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

  // Смещаем стрелку немного наружу от линии орбиты.
  const radialOffset = Math.max(orbitRadius * 0.025, width * 0.1);

  // Толщина объёмной стрелки.
  const halfThickness = width * 0.025;

  const segmentCount = Math.max(8, Math.floor(segments));

  const shaftSegments = Math.max(2, Math.round(segmentCount * headStart));

  const tipSegments = Math.max(2, segmentCount - shaftSegments);

  // Каждое поперечное сечение содержит 4 вершины.
  //
  // X — касательное направление орбиты.
  // Y — радиальное направление.
  // Z — ширина стрелки, перпендикулярная орбите.
  //
  // В отличие от ShapeGeometry, вершины
  // располагаются на цилиндрической поверхности.

  const addSection = (t, halfWidth) => {
    const distance = (t - 0.5) * length;
    const angle = distance / orbitRadius;

    const addVertex = (radialThickness, z) => {
      const radius = orbitRadius + radialOffset + radialThickness;

      vertices.push(radius * Math.sin(angle), orbitRadius - radius * Math.cos(angle), z);
    };

    // Внешняя сторона ленты.
    addVertex(halfThickness, -halfWidth);
    addVertex(halfThickness, halfWidth);

    // Внутренняя сторона ленты.
    addVertex(-halfThickness, -halfWidth);
    addVertex(-halfThickness, halfWidth);
  };

  // 1. Хвост и стержень стрелки.
  for (let i = 0; i <= shaftSegments; i += 1) {
    const t = (i / shaftSegments) * headStart;

    addSection(t, shaftHalfWidth);
  }

  // 2. Основание наконечника.
  addSection(headStart, headHalfWidth);

  // 3. Наконечник тоже повторяет дугу орбиты.
  for (let i = 1; i <= tipSegments; i += 1) {
    const t = i / tipSegments;

    addSection(headStart + (1 - headStart) * t, headHalfWidth * (1 - t));
  }

  const addQuad = (a, b, c, d) => {
    indices.push(a, b, c, a, c, d);
  };

  const sectionCount = vertices.length / 12;

  // Соединяем поперечные сечения,
  // создавая объёмную изогнутую поверхность.
  for (let i = 0; i < sectionCount - 1; i += 1) {
    const a = i * 4;
    const b = (i + 1) * 4;

    // Внешняя поверхность.
    addQuad(a, b, b + 1, a + 1);

    // Внутренняя поверхность.
    addQuad(a + 2, a + 3, b + 3, b + 2);

    // Нижняя боковая поверхность.
    addQuad(a, a + 2, b + 2, b);

    // Верхняя боковая поверхность.
    addQuad(a + 1, b + 1, b + 3, a + 3);
  }

  // Закрываем торец хвоста.
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
  geometry.userData.scrambleHintLocalPositions = geometry.getAttribute('position').array.slice();

  const mesh = new THREE.Mesh(geometry, makeMaterial(color, opacity));

  mesh.userData.scrambleHintArrow = true;
  mesh.renderOrder = 12;
  mesh.frustumCulled = false;

  arrowGroup.add(mesh);

  return mesh;
}

function addOrbitingArrows(group, face, prime, repeats, cubeHalf, referenceAxes) {
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

  const orbitCenter = normal.clone().multiplyScalar(cubeHalf * orbit.centerOffset);

  // Create the circular orbit around the selected face.
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

  track.userData.scrambleHintArrow = true;
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

    arrowGroup.userData.scrambleHintArrow = true;
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

      // Центр стрелки на орбите.
      position
        .copy(orbitCenter)
        .addScaledVector(u, cos * orbitRadius)
        .addScaledVector(v, sin * orbitRadius);

      // Направление движения по орбите.
      tangent
        .copy(u)
        .multiplyScalar(-sin)
        .addScaledVector(v, cos)
        .multiplyScalar(moveDirection)
        .normalize();

      // Направление к центру окружности.
      inward.copy(u).multiplyScalar(-cos).addScaledVector(v, -sin).normalize();

      // Преобразуем локальные вершины
      // объёмной стрелки в координаты сцены.
      meshes.forEach((mesh) => {
        const geometry = mesh.geometry;

        const localPositions = geometry.userData.scrambleHintLocalPositions;

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

function buildArrows(group, face, prime, repeats, cubeHalf) {
  while (group.children.length) {
    const child = group.children[0];

    group.remove(child);
    disposeObject(child);
  }

  const axesInfo = group.parent?.axesInfo;

  addOrbitingArrows(group, face, prime, repeats, cubeHalf, {
    F: axisFromPuzzle(axesInfo, 'F'),
    U: axisFromPuzzle(axesInfo, 'U'),
    R: axisFromPuzzle(axesInfo, 'R'),
  });
}

export function getCurrentScrambleMove(scrambleDisplay) {
  if (!Array.isArray(scrambleDisplay) || !scrambleDisplay.length) {
    return null;
  }

  return (
    scrambleDisplay.find((move) => move.isCurrent)?.move ??
    scrambleDisplay.find((move) => move.color !== 'gray')?.move ??
    null
  );
}

export function createScrambleHintArrows() {
  const group = new THREE.Group();

  group.name = 'scrambleHintArrows';
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

    const parsed = parseCubeMove(move);

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
      cubeHalf.toFixed(3),
      theme,
    ].join('|');

    if (key !== lastKey) {
      const color = theme === 'dark' ? 0xffffff : 0x000000;
      HINT_STYLE.colors.arrow = color;
      HINT_STYLE.colors.orbit = color;

      buildArrows(group, parsed.face, parsed.prime, parsed.repeats, cubeHalf);

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
