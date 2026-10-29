import * as THREE from 'three';

/**
 * Puzzle-geometry 3x3 face planes sit near |coord| ≈ 1.11; PG3D then scales
 * sticker meshes by 0.5 (cubing PG_SCALE). Arrows parented to PG3D must use
 * the *scaled* half-extent or they sit in the unscaled sticker vertex space.
 */
export const PG3D_MESH_SCALE = 0.5;

export const FACE_AXES = {
  R: new THREE.Vector3(1, 0, 0),
  L: new THREE.Vector3(-1, 0, 0),
  U: new THREE.Vector3(0, 1, 0),
  D: new THREE.Vector3(0, -1, 0),
  F: new THREE.Vector3(0, 0, 1),
  B: new THREE.Vector3(0, 0, -1),
};

const _q = new THREE.Quaternion();
const _t = new THREE.Vector3();

/**
 * Same signed angle cubing PG3D applies to the moving layer:
 * `angle = -direction * amount * TAU / order` with order 4.
 * @see node_modules/cubing/.../PG3D.ts onPositionChange / rotateOnAxis
 */
export function cubingLayerAngleRad(prime, repeats) {
  const direction = prime ? -1 : 1;
  const amount = repeats || 1;
  return -direction * amount * (Math.PI / 2);
}

export function axisFromPuzzle(axesInfo, face) {
  const fromPuzzle = axesInfo?.[face]?.axis;
  if (fromPuzzle && Number.isFinite(fromPuzzle.x)) {
    const axis = new THREE.Vector3(fromPuzzle.x, fromPuzzle.y, fromPuzzle.z);
    if (axis.lengthSq() > 1e-8) return axis.normalize();
  }
  const fallback = FACE_AXES[face];
  return fallback ? fallback.clone() : null;
}

function projectedDirection(direction, normal) {
  if (!direction) return null;
  const projected = direction.clone().addScaledVector(normal, -direction.dot(normal));
  return projected.lengthSq() > 1e-6 ? projected.normalize() : null;
}

/**
 * Builds a short rounded path around the most visible corner of a layer.
 *
 * A circle around the cube centre cuts through a square cube near a corner.
 * This path instead joins two offset face planes with a cubic fillet. For R
 * those planes are F and U, so the path sits over the upper-front edge.
 */
export function layerWrapAnchor(axis, cubeHalf, referenceAxes = FACE_AXES) {
  const n = axis.clone().normalize();
  const front = projectedDirection(referenceAxes.F || FACE_AXES.F, n);
  const up = projectedDirection(referenceAxes.U || FACE_AXES.U, n);
  const right = projectedDirection(referenceAxes.R || FACE_AXES.R, n);

  let first = front;
  let second = up;
  if (!first) {
    first = up || right;
    second = right;
  } else if (!second) {
    second = right;
  }
  if (!first || !second) return null;

  second.addScaledVector(first, -second.dot(first)).normalize();
  const surface = cubeHalf * 1.12;
  const inner = cubeHalf * 0.48;
  const axialCenter = n.clone().multiplyScalar(cubeHalf * 1.015);
  const corner = axialCenter
    .clone()
    .addScaledVector(first, surface)
    .addScaledVector(second, surface);
  const start = axialCenter.clone().addScaledVector(first, surface).addScaledVector(second, inner);
  const end = axialCenter.clone().addScaledVector(first, inner).addScaledVector(second, surface);
  const pathRotationSign = Math.sign(n.clone().cross(first).dot(second)) || 1;

  return {
    axis: n,
    axialCenter,
    first,
    second,
    start,
    corner,
    end,
    pathRotationSign,
    cubeHalf,
  };
}

/** @deprecated use layerWrapAnchor */
export function arcAnchorOnFace(face, cubeHalf) {
  return layerWrapAnchor(FACE_AXES[face] || FACE_AXES.U, cubeHalf);
}

export function rotateAroundAxis(point, axis, angle, target = new THREE.Vector3()) {
  _q.setFromAxisAngle(axis, angle);
  return target.copy(point).applyQuaternion(_q);
}

export function layerWrapPoint(path, progress, target = new THREE.Vector3()) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const oneMinusT = 1 - t;
  const startWeight = oneMinusT * oneMinusT * oneMinusT;
  const cornerWeight = 3 * t * oneMinusT;
  const endWeight = t * t * t;
  return target
    .copy(path.start)
    .multiplyScalar(startWeight)
    .addScaledVector(path.corner, cornerWeight)
    .addScaledVector(path.end, endWeight);
}

export function layerWrapTangent(path, progress, travelSign = 1, target = new THREE.Vector3()) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  const oneMinusT = 1 - t;
  target
    .copy(path.corner)
    .sub(path.start)
    .multiplyScalar(3 * oneMinusT * oneMinusT)
    .addScaledVector(_t.copy(path.end).sub(path.corner), 3 * t * t);
  if (target.lengthSq() < 1e-10) target.copy(path.second);
  target.normalize();
  if (travelSign < 0) target.multiplyScalar(-1);
  return target;
}

/** @deprecated Alias retained for callers from the first arrow implementation. */
export function arcTangent(path, progress, travelSign = 1, target = new THREE.Vector3()) {
  return layerWrapTangent(path, progress, travelSign, target);
}

/**
 * Direction and endpoints are deliberately separate from path placement.
 * Prime moves therefore reverse the same visible arrow instead of moving it
 * to the opposite side of the cube. A half turn has no distinct prime form.
 */
export function layerWrapSweep(moveAngle, pathRotationSign = 1) {
  const moveSign = Math.sign(moveAngle) || 1;
  const dir = moveSign === Math.sign(pathRotationSign || 1) ? 1 : -1;
  const isHalfTurn = Math.abs(moveAngle) > Math.PI * 0.75;
  return {
    pathStart: dir > 0 ? 0 : 1,
    pathEnd: dir > 0 ? 1 : 0,
    dir,
    isHalfTurn,
  };
}

/**
 * Median max-norm of mesh vertices, excluding the farther hint-sticker shell.
 * PG3D packs stickers first, then hints offset by 0.5 along the face normal.
 */
export function unscaledHalfFromPositions(positions) {
  if (!positions || !positions.length) return 1.11;
  const mags = [];
  for (let i = 0; i + 2 < positions.length; i += 3) {
    const mag = Math.max(
      Math.abs(positions[i]),
      Math.abs(positions[i + 1]),
      Math.abs(positions[i + 2])
    );
    if (mag > 0.05) mags.push(mag);
  }
  if (!mags.length) return 1.11;
  mags.sort((a, b) => a - b);
  return mags[Math.floor(mags.length * 0.5)];
}

export function visualCubeHalf(unscaledHalf, meshScale) {
  const scale = Number.isFinite(meshScale) && meshScale > 0 ? meshScale : PG3D_MESH_SCALE;
  const half = unscaledHalf * scale;
  return Number.isFinite(half) && half > 0.05 ? half : PG3D_MESH_SCALE * 1.11;
}

/** Face half-extent of a sticker mesh, expressed in `root` local space. */
export function cubeHalfInRootSpace(root, mesh, unscaledHalf) {
  if (!root || !mesh) return visualCubeHalf(unscaledHalf, PG3D_MESH_SCALE);
  mesh.updateWorldMatrix(true, false);
  root.updateWorldMatrix(true, false);
  const v = new THREE.Vector3(unscaledHalf, 0, 0).applyMatrix4(mesh.matrixWorld);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  v.applyMatrix4(inv);
  const half = v.length();
  return Number.isFinite(half) && half > 0.05
    ? half
    : visualCubeHalf(unscaledHalf, PG3D_MESH_SCALE);
}

export function ribbonFrameAt(path, progress, travelSign = 1) {
  const center = layerWrapPoint(path, progress);
  const tangent = layerWrapTangent(path, progress, travelSign);
  const widthDir = path.axis.clone();
  const thickDir = new THREE.Vector3().crossVectors(tangent, widthDir).normalize();
  const radial = center.clone().sub(path.axialCenter);
  if (thickDir.dot(radial) < 0) thickDir.multiplyScalar(-1);
  return { center, tangent, widthDir, thickDir };
}
