import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as THREE from 'three';

import {
  FACE_AXES,
  PG3D_MESH_SCALE,
  axisFromPuzzle,
  cubingLayerAngleRad,
  layerWrapAnchor,
  layerWrapPoint,
  layerWrapSweep,
  layerWrapTangent,
  ribbonFrameAt,
  unscaledHalfFromPositions,
  visualCubeHalf,
} from './scrambleHintArrowMath.js';
import { parseCubeMove } from '../MiniGames/useFaceMoveInput.js';

function sampleWrap(axis, cubeHalf, moveAngle, steps = 12, references = FACE_AXES) {
  const path = layerWrapAnchor(axis, cubeHalf, references);
  const sweep = layerWrapSweep(moveAngle, path.pathRotationSign);
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const progress = sweep.pathStart + (sweep.pathEnd - sweep.pathStart) * (i / steps);
    points.push(layerWrapPoint(path, progress));
  }
  return { path, points, sweep };
}

describe('parseCubeMove', () => {
  it('parses all face and turn variants', () => {
    for (const face of Object.keys(FACE_AXES)) {
      assert.deepEqual(parseCubeMove(face), { face, prime: false, repeats: 1 });
      assert.deepEqual(parseCubeMove(`${face}'`), { face, prime: true, repeats: 1 });
      assert.deepEqual(parseCubeMove(`${face}2`), { face, prime: false, repeats: 2 });
    }
  });
});

describe('R layer wrap trajectory', () => {
  const h = 0.555;
  const axis = FACE_AXES.R.clone();

  it('uses cubing R sign: -pi/2 around +X, opposite for R\'', () => {
    assert.equal(cubingLayerAngleRad(false, 1), -Math.PI / 2);
    assert.equal(cubingLayerAngleRad(true, 1), Math.PI / 2);
  });

  it('runs from the upper front face area across the upper-front edge', () => {
    const path = layerWrapAnchor(axis, h);
    const fCenter = new THREE.Vector3(0, 0, h);
    assert.ok(path.start.x > h, 'belongs to the R layer');
    assert.ok(path.start.z > h, 'starts above the F surface');
    assert.ok(path.start.y > 0, 'starts at the upper row, not the face centre');
    assert.ok(path.end.y > h, 'ends above the U surface');
    assert.ok(path.end.z > 0, 'remains near the front row of U');
    assert.ok(path.start.distanceTo(fCenter) > h * 0.8);
  });

  it('stays outside the square cube while rounding the edge', () => {
    const { path, points } = sampleWrap(axis, h, cubingLayerAngleRad(false, 1), 30);
    for (const p of points) {
      assert.ok(Math.abs(p.dot(path.axis) - path.axialCenter.dot(path.axis)) < 1e-8);
      const firstCoord = p.clone().sub(path.axialCenter).dot(path.first);
      const secondCoord = p.clone().sub(path.axialCenter).dot(path.second);
      assert.ok(Math.max(firstCoord, secondCoord) > h * 1.02, 'path must not cut through the cube');
    }
  });

  it('takes R from F toward U and reverses the same path for R\'', () => {
    const { points: fwd } = sampleWrap(axis, h, cubingLayerAngleRad(false, 1));
    const { points: rev } = sampleWrap(axis, h, cubingLayerAngleRad(true, 1));
    assert.ok(fwd[fwd.length - 1].y > fwd[0].y, 'R moves toward U');
    assert.ok(rev[rev.length - 1].y < rev[0].y, 'R\' points from U toward F');
    for (let i = 0; i < fwd.length; i += 1) {
      assert.ok(fwd[i].distanceTo(rev[rev.length - 1 - i]) < 1e-8);
    }
  });

  it('points the head along the wrap tangent', () => {
    const moveAngle = cubingLayerAngleRad(false, 1);
    const path = layerWrapAnchor(axis, h);
    const { pathEnd, dir } = layerWrapSweep(moveAngle, path.pathRotationSign);
    const tangent = layerWrapTangent(path, pathEnd, dir);
    const end = layerWrapPoint(path, pathEnd);
    const beforeEnd = layerWrapPoint(path, pathEnd - dir * 0.01);
    const numericTangent = end.clone().sub(beforeEnd).normalize();
    assert.ok(tangent.dot(numericTangent) > 0.95);
  });

  it('orients ribbon width along the edge and thickness away from the cube', () => {
    const path = layerWrapAnchor(axis, h);
    const frame = ribbonFrameAt(path, 0.5, 1);
    assert.ok(Math.abs(frame.widthDir.dot(axis) - 1) < 1e-6);
    assert.ok(Math.abs(frame.thickDir.dot(axis)) < 1e-6);
    assert.ok(Math.abs(frame.thickDir.dot(frame.tangent)) < 1e-6);
    assert.ok(frame.thickDir.dot(frame.center.clone().sub(path.axialCenter)) > 0);
  });
});

describe('all layer axes and notation directions', () => {
  const h = 0.555;

  for (const face of Object.keys(FACE_AXES)) {
    it(`${face}, ${face}' and ${face}2 stay on the selected local layer`, () => {
      const axis = FACE_AXES[face];
      const direct = sampleWrap(axis, h, cubingLayerAngleRad(false, 1));
      const prime = sampleWrap(axis, h, cubingLayerAngleRad(true, 1));
      const half = sampleWrap(axis, h, cubingLayerAngleRad(false, 2));

      for (const p of [...direct.points, ...prime.points, ...half.points]) {
        assert.ok(Math.abs(p.dot(axis) - h * 1.015) < 1e-8);
      }

      const directStart = direct.points[0].clone().sub(direct.path.axialCenter);
      const directEnd = direct.points.at(-1).clone().sub(direct.path.axialCenter);
      const rotationSign = Math.sign(axis.dot(directStart.cross(directEnd)));
      assert.equal(rotationSign, Math.sign(cubingLayerAngleRad(false, 1)));
      assert.equal(half.sweep.isHalfTurn, true);
    });
  }
});

describe('cube-local orientation', () => {
  it('rotates axes and arrow placement together with puzzle axesInfo', () => {
    const cubeQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, -0.4, 0.1));
    const axesInfo = Object.fromEntries(
      Object.entries(FACE_AXES).map(([face, axis]) => [
        face,
        { axis: axis.clone().applyQuaternion(cubeQuat) },
      ])
    );
    const references = {
      F: axisFromPuzzle(axesInfo, 'F'),
      U: axisFromPuzzle(axesInfo, 'U'),
      R: axisFromPuzzle(axesInfo, 'R'),
    };
    const rotatedPath = layerWrapAnchor(axisFromPuzzle(axesInfo, 'R'), 0.555, references);
    const localPath = layerWrapAnchor(FACE_AXES.R, 0.555);
    assert.ok(
      rotatedPath.start.distanceTo(localPath.start.clone().applyQuaternion(cubeQuat)) < 1e-6
    );
  });

  it('reads R from puzzle axesInfo', () => {
    const axis = axisFromPuzzle({ R: { axis: { x: 0.999, y: 0, z: 0 } } }, 'R');
    assert.ok(axis.distanceTo(new THREE.Vector3(1, 0, 0)) < 1e-6);
  });
});

describe('PG3D scale', () => {
  it('converts unscaled sticker coords through PG_SCALE', () => {
    assert.ok(Math.abs(visualCubeHalf(1.11, PG3D_MESH_SCALE) - 0.555) < 1e-6);
  });

  it('uses the median vertex shell so hint stickers do not inflate the cube', () => {
    const stickers = [];
    for (let i = 0; i < 20; i += 1) stickers.push(1.11, 0, 0);
    const hints = [];
    for (let i = 0; i < 8; i += 1) hints.push(1.61, 0, 0);
    assert.ok(Math.abs(unscaledHalfFromPositions([...stickers, ...hints]) - 1.11) < 0.02);
  });
});
