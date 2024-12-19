import {
  Alg,
  Move,
  TraversalDownUp,
  functionFromTraversal
} from "./chunk-ADOABKV4.js";
import {
  __privateAdd,
  __privateGet,
  __privateSet,
  __publicField
} from "./chunk-WOOG5QLI.js";

// node_modules/cubing/dist/lib/cubing/chunks/chunk-H57WKFBE.js
function combineTransformationData(definition, transformationData1, transformationData2) {
  const newTransformationData = {};
  for (const orbitDefinition of definition.orbits) {
    const orbit1 = transformationData1[orbitDefinition.orbitName];
    const orbit2 = transformationData2[orbitDefinition.orbitName];
    if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      orbit2
    )) {
      newTransformationData[orbitDefinition.orbitName] = orbit1;
    } else if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      orbit1
    )) {
      newTransformationData[orbitDefinition.orbitName] = orbit2;
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitDefinition.orbitName] = {
          permutation: newPerm,
          orientationDelta: orbit1.orientationDelta
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] = (orbit1.orientationDelta[orbit2.permutation[idx]] + orbit2.orientationDelta[idx]) % orbitDefinition.numOrientations;
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitDefinition.orbitName] = {
          permutation: newPerm,
          orientationDelta: newOri
        };
      }
    }
  }
  return newTransformationData;
}
function applyTransformationDataToKPatternData(definition, patternData, transformationData) {
  const newPatternData = {};
  for (const orbitDefinition of definition.orbits) {
    const patternOrbit = patternData[orbitDefinition.orbitName];
    const transformationOrbit = transformationData[orbitDefinition.orbitName];
    if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      transformationOrbit
    )) {
      newPatternData[orbitDefinition.orbitName] = patternOrbit;
    } else {
      const newPieces = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPieces[idx] = patternOrbit.pieces[transformationOrbit.permutation[idx]];
        }
        const newOrbitData = {
          pieces: newPieces,
          orientation: patternOrbit.orientation
          // copy all 0
        };
        newPatternData[orbitDefinition.orbitName] = newOrbitData;
      } else {
        const newOrientation = new Array(orbitDefinition.numPieces);
        const newOrientationMod = patternOrbit.orientationMod ? new Array(orbitDefinition.numPieces) : void 0;
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          const transformationIdx = transformationOrbit.permutation[idx];
          let mod = orbitDefinition.numOrientations;
          if (patternOrbit.orientationMod) {
            const orientationMod = patternOrbit.orientationMod[transformationIdx];
            newOrientationMod[idx] = orientationMod;
            mod = orientationMod || orbitDefinition.numOrientations;
          }
          newOrientation[idx] = (patternOrbit.orientation[transformationIdx] + transformationOrbit.orientationDelta[idx]) % mod;
          newPieces[idx] = patternOrbit.pieces[transformationIdx];
        }
        const newOrbitData = {
          pieces: newPieces,
          orientation: newOrientation
        };
        if (newOrientationMod) {
          newOrbitData.orientationMod = newOrientationMod;
        }
        newPatternData[orbitDefinition.orbitName] = newOrbitData;
      }
    }
  }
  return newPatternData;
}
var FREEZE = false;
var identityOrbitCache = /* @__PURE__ */ new Map();
function constructIdentityOrbitTransformation(numPieces) {
  const cached = identityOrbitCache.get(numPieces);
  if (cached) {
    return cached;
  }
  const newPermutation = new Array(numPieces);
  const newOrientation = new Array(numPieces);
  for (let i = 0; i < numPieces; i++) {
    newPermutation[i] = i;
    newOrientation[i] = 0;
  }
  const orbitTransformation = {
    permutation: newPermutation,
    orientationDelta: newOrientation
  };
  if (FREEZE) {
    Object.freeze(newPermutation);
    Object.freeze(newOrientation);
    Object.freeze(orbitTransformation);
  }
  identityOrbitCache.set(numPieces, orbitTransformation);
  return orbitTransformation;
}
function constructIdentityTransformationDataUncached(definition) {
  const transformation = {};
  for (const orbitDefinition of definition.orbits) {
    transformation[orbitDefinition.orbitName] = constructIdentityOrbitTransformation(orbitDefinition.numPieces);
  }
  if (FREEZE) {
    Object.freeze(transformation);
  }
  return transformation;
}
function moveToTransformationUncached(kpuzzle, move) {
  function getTransformationData(key, multiplyAmount) {
    var _a3;
    const s = key.toString();
    const movesDef = kpuzzle.definition.moves[s];
    if (movesDef) {
      return repeatTransformationUncached(kpuzzle, movesDef, multiplyAmount);
    }
    const derivedDef = (_a3 = kpuzzle.definition.derivedMoves) == null ? void 0 : _a3[s];
    if (derivedDef) {
      return repeatTransformationUncached(
        kpuzzle,
        kpuzzle.algToTransformation(derivedDef).transformationData,
        multiplyAmount
      );
    }
    return void 0;
  }
  const data = getTransformationData(move.quantum, move.amount) ?? // Handle e.g. `y2` if `y2` is defined.
  // Note: this doesn't handle multiples.
  getTransformationData(move, 1) ?? // Handle e.g. `y2'` if `y2` is defined.
  // Note: this doesn't handle multiples.
  getTransformationData(move.invert, -1);
  if (data) {
    return data;
  }
  throw new Error(`Invalid move for KPuzzle (${kpuzzle.name()}): ${move}`);
}
var KPattern = class _KPattern {
  constructor(kpuzzle, patternData) {
    this.kpuzzle = kpuzzle;
    this.patternData = patternData;
  }
  toJSON() {
    return {
      experimentalPuzzleName: this.kpuzzle.name(),
      patternData: this.patternData
    };
  }
  static fromTransformation(transformation) {
    const newPatternData = applyTransformationDataToKPatternData(
      transformation.kpuzzle.definition,
      transformation.kpuzzle.definition.defaultPattern,
      transformation.transformationData
    );
    return new _KPattern(transformation.kpuzzle, newPatternData);
  }
  // Convenience function
  /** @deprecated */
  apply(source) {
    return this.applyTransformation(this.kpuzzle.toTransformation(source));
  }
  applyTransformation(transformation) {
    if (transformation.isIdentityTransformation()) {
      return new _KPattern(this.kpuzzle, this.patternData);
    }
    const newPatternData = applyTransformationDataToKPatternData(
      this.kpuzzle.definition,
      this.patternData,
      transformation.transformationData
    );
    return new _KPattern(this.kpuzzle, newPatternData);
  }
  applyMove(move) {
    return this.applyTransformation(this.kpuzzle.moveToTransformation(move));
  }
  applyAlg(alg) {
    return this.applyTransformation(this.kpuzzle.algToTransformation(alg));
  }
  isIdentical(other) {
    return isPatternDataIdentical(
      this.kpuzzle,
      this.patternData,
      other.patternData
    );
  }
  /** @deprecated */
  experimentalToTransformation() {
    if (!this.kpuzzle.canConvertDefaultPatternToUniqueTransformation()) {
      return null;
    }
    const transformationData = {};
    for (const [orbitName, patternOrbitData] of Object.entries(
      this.patternData
    )) {
      const transformationOrbit = {
        permutation: patternOrbitData.pieces,
        orientationDelta: patternOrbitData.orientation
      };
      transformationData[orbitName] = transformationOrbit;
    }
    return new KTransformation(this.kpuzzle, transformationData);
  }
  experimentalIsSolved(options) {
    if (!this.kpuzzle.definition.experimentalIsPatternSolved) {
      throw new Error(
        "`KPattern.experimentalIsPatternSolved()` is not supported for this puzzle at the moment."
      );
    }
    return this.kpuzzle.definition.experimentalIsPatternSolved(this, options);
  }
};
var _cachedIsIdentity, _a;
var KTransformation = (_a = class {
  constructor(kpuzzle, transformationData) {
    // For optimizations, we want to make it cheap to rely on optimizations when a
    // transformation is an identity. Here, we try to make it cheaper by:
    // - only calculating when needed, and
    // - caching the result.
    __privateAdd(this, _cachedIsIdentity);
    this.kpuzzle = kpuzzle;
    this.transformationData = transformationData;
  }
  toJSON() {
    return {
      experimentalPuzzleName: this.kpuzzle.name(),
      transformationData: this.transformationData
    };
  }
  invert() {
    return new _a(
      this.kpuzzle,
      invertTransformation(this.kpuzzle, this.transformationData)
    );
  }
  // TODO: is `null` worse here?
  isIdentityTransformation() {
    return __privateGet(this, _cachedIsIdentity) ?? __privateSet(this, _cachedIsIdentity, this.isIdentical(
      this.kpuzzle.identityTransformation()
    ));
  }
  /** @deprecated */
  static experimentalConstructIdentity(kpuzzle) {
    const transformation = new _a(
      kpuzzle,
      constructIdentityTransformationDataUncached(kpuzzle.definition)
    );
    __privateSet(transformation, _cachedIsIdentity, true);
    return transformation;
  }
  isIdentical(t2) {
    return isTransformationDataIdentical(
      this.kpuzzle,
      this.transformationData,
      t2.transformationData
    );
  }
  // Convenience function
  /** @deprecated */
  apply(source) {
    return this.applyTransformation(this.kpuzzle.toTransformation(source));
  }
  applyTransformation(t2) {
    if (this.kpuzzle !== t2.kpuzzle) {
      throw new Error(
        `Tried to apply a transformation for a KPuzzle (${t2.kpuzzle.name()}) to a different KPuzzle (${this.kpuzzle.name()}).`
      );
    }
    if (__privateGet(this, _cachedIsIdentity)) {
      return new _a(this.kpuzzle, t2.transformationData);
    }
    if (__privateGet(t2, _cachedIsIdentity)) {
      return new _a(this.kpuzzle, this.transformationData);
    }
    return new _a(
      this.kpuzzle,
      combineTransformationData(
        this.kpuzzle.definition,
        this.transformationData,
        t2.transformationData
      )
    );
  }
  applyMove(move) {
    return this.applyTransformation(this.kpuzzle.moveToTransformation(move));
  }
  applyAlg(alg) {
    return this.applyTransformation(this.kpuzzle.algToTransformation(alg));
  }
  // Convenience. Useful for chaining.
  toKPattern() {
    return KPattern.fromTransformation(this);
  }
  // TODO: support calculating this for a given start state. (For `R U R' U` on 3x3x3, should this default to 5 or 10?)
  repetitionOrder() {
    return transformationRepetitionOrder(this.kpuzzle.definition, this);
  }
  selfMultiply(amount) {
    return new _a(
      this.kpuzzle,
      repeatTransformationUncached(
        this.kpuzzle,
        this.transformationData,
        amount
      )
    );
  }
}, _cachedIsIdentity = new WeakMap(), _a);
function isOrbitTransformationDataIdentityUncached(numOrientations, orbitTransformationData) {
  if (!orbitTransformationData.permutation) {
    console.log(orbitTransformationData);
  }
  const { permutation } = orbitTransformationData;
  const numPieces = permutation.length;
  for (let idx = 0; idx < numPieces; idx++) {
    if (permutation[idx] !== idx) {
      return false;
    }
  }
  if (numOrientations > 1) {
    const { orientationDelta: orientation } = orbitTransformationData;
    for (let idx = 0; idx < numPieces; idx++) {
      if (orientation[idx] !== 0) {
        return false;
      }
    }
  }
  return true;
}
function isOrbitTransformationDataIdentical(orbitDefinition, orbitTransformationData1, orbitTransformationData2, options = {}) {
  for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
    if (!(options == null ? void 0 : options.ignorePieceOrientations) && orbitTransformationData1.orientationDelta[idx] !== orbitTransformationData2.orientationDelta[idx]) {
      return false;
    }
    if (!(options == null ? void 0 : options.ignorePiecePermutation) && orbitTransformationData1.permutation[idx] !== orbitTransformationData2.permutation[idx]) {
      return false;
    }
  }
  return true;
}
function isTransformationDataIdentical(kpuzzle, transformationData1, transformationData2) {
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    if (!isOrbitTransformationDataIdentical(
      orbitDefinition,
      transformationData1[orbitDefinition.orbitName],
      transformationData2[orbitDefinition.orbitName]
    )) {
      return false;
    }
  }
  return true;
}
function isOrbitPatternDataIdentical(orbitDefinition, orbitPatternData1, orbitPatternData2, options = {}) {
  var _a3, _b;
  for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
    if (!(options == null ? void 0 : options.ignorePieceOrientations) && (orbitPatternData1.orientation[idx] !== orbitPatternData2.orientation[idx] || (((_a3 = orbitPatternData1.orientationMod) == null ? void 0 : _a3[idx]) ?? 0) !== (((_b = orbitPatternData2.orientationMod) == null ? void 0 : _b[idx]) ?? 0))) {
      return false;
    }
    if (!(options == null ? void 0 : options.ignorePieceIndices) && orbitPatternData1.pieces[idx] !== orbitPatternData2.pieces[idx]) {
      return false;
    }
  }
  return true;
}
function isPatternDataIdentical(kpuzzle, patternData1, patternData2) {
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    if (!isOrbitPatternDataIdentical(
      orbitDefinition,
      patternData1[orbitDefinition.orbitName],
      patternData2[orbitDefinition.orbitName]
    )) {
      return false;
    }
  }
  return true;
}
function invertTransformation(kpuzzle, transformationData) {
  const newTransformationData = {};
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    const orbitTransformationData = transformationData[orbitDefinition.orbitName];
    if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      orbitTransformationData
    )) {
      newTransformationData[orbitDefinition.orbitName] = orbitTransformationData;
    } else if (orbitDefinition.numOrientations === 1) {
      const newPerm = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        newPerm[orbitTransformationData.permutation[idx]] = idx;
      }
      newTransformationData[orbitDefinition.orbitName] = {
        permutation: newPerm,
        orientationDelta: orbitTransformationData.orientationDelta
      };
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      const newOri = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        const fromIdx = orbitTransformationData.permutation[idx];
        newPerm[fromIdx] = idx;
        newOri[fromIdx] = (orbitDefinition.numOrientations - orbitTransformationData.orientationDelta[idx] + orbitDefinition.numOrientations) % orbitDefinition.numOrientations;
      }
      newTransformationData[orbitDefinition.orbitName] = {
        permutation: newPerm,
        orientationDelta: newOri
      };
    }
  }
  return newTransformationData;
}
function repeatTransformationUncached(kpuzzle, transformationData, amount) {
  if (amount === 1) {
    return transformationData;
  }
  if (amount < 0) {
    return repeatTransformationUncached(
      kpuzzle,
      invertTransformation(kpuzzle, transformationData),
      -amount
    );
  }
  if (amount === 0) {
    const { transformationData: transformationData2 } = kpuzzle.identityTransformation();
    return transformationData2;
  }
  let halfish = transformationData;
  if (amount !== 2) {
    halfish = repeatTransformationUncached(
      kpuzzle,
      transformationData,
      Math.floor(amount / 2)
    );
  }
  const twiceHalfish = combineTransformationData(
    kpuzzle.definition,
    halfish,
    halfish
  );
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return combineTransformationData(
      kpuzzle.definition,
      transformationData,
      twiceHalfish
    );
  }
}
var AlgToTransformationTraversal = class extends TraversalDownUp {
  traverseAlg(alg, kpuzzle) {
    let transformation = null;
    for (const algNode of alg.childAlgNodes()) {
      if (transformation) {
        transformation = transformation.applyTransformation(
          this.traverseAlgNode(algNode, kpuzzle)
        );
      } else {
        transformation = this.traverseAlgNode(algNode, kpuzzle);
      }
    }
    return transformation ?? kpuzzle.identityTransformation();
  }
  traverseGrouping(grouping, kpuzzle) {
    const algTransformation = this.traverseAlg(grouping.alg, kpuzzle);
    return new KTransformation(
      kpuzzle,
      repeatTransformationUncached(
        kpuzzle,
        algTransformation.transformationData,
        grouping.amount
      )
    );
  }
  traverseMove(move, kpuzzle) {
    return kpuzzle.moveToTransformation(move);
  }
  traverseCommutator(commutator, kpuzzle) {
    const aTransformation = this.traverseAlg(commutator.A, kpuzzle);
    const bTransformation = this.traverseAlg(commutator.B, kpuzzle);
    return aTransformation.applyTransformation(bTransformation).applyTransformation(aTransformation.invert()).applyTransformation(bTransformation.invert());
  }
  traverseConjugate(conjugate, kpuzzle) {
    const aTransformation = this.traverseAlg(conjugate.A, kpuzzle);
    const bTransformation = this.traverseAlg(conjugate.B, kpuzzle);
    return aTransformation.applyTransformation(bTransformation).applyTransformation(aTransformation.invert());
  }
  traversePause(_, kpuzzle) {
    return kpuzzle.identityTransformation();
  }
  traverseNewline(_, kpuzzle) {
    return kpuzzle.identityTransformation();
  }
  traverseLineComment(_, kpuzzle) {
    return kpuzzle.identityTransformation();
  }
};
var algToTransformation = functionFromTraversal(
  AlgToTransformationTraversal
);
function gcd(a, b) {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}
function transformationRepetitionOrder(definition, transformation) {
  let order = 1;
  for (const orbitDefinition of definition.orbits) {
    const transformationOrbit = transformation.transformationData[orbitDefinition.orbitName];
    const orbitPieces = new Array(orbitDefinition.numPieces);
    for (let startIdx = 0; startIdx < orbitDefinition.numPieces; startIdx++) {
      if (!orbitPieces[startIdx]) {
        let currentIdx = startIdx;
        let orientationSum = 0;
        let cycleLength = 0;
        for (; ; ) {
          orbitPieces[currentIdx] = true;
          orientationSum = orientationSum + transformationOrbit.orientationDelta[currentIdx];
          cycleLength = cycleLength + 1;
          currentIdx = transformationOrbit.permutation[currentIdx];
          if (currentIdx === startIdx) {
            break;
          }
        }
        if (orientationSum !== 0) {
          cycleLength = cycleLength * orbitDefinition.numOrientations / gcd(orbitDefinition.numOrientations, Math.abs(orientationSum));
        }
        order = order * cycleLength / gcd(order, cycleLength);
      }
    }
  }
  return order;
}
var _indexedOrbits, _moveToTransformationDataCache, _cachedCanConvertDefaultPatternToUniqueTransformation, _a2;
var KPuzzle = (_a2 = class {
  constructor(definition, options) {
    __publicField(this, "experimentalPGNotation");
    __privateAdd(this, _indexedOrbits);
    __privateAdd(this, _moveToTransformationDataCache, /* @__PURE__ */ new Map());
    __privateAdd(this, _cachedCanConvertDefaultPatternToUniqueTransformation);
    this.definition = definition;
    this.experimentalPGNotation = options == null ? void 0 : options.experimentalPGNotation;
  }
  // Note: this function is needed much more rarely than you might think. Most
  // operations related to orbits require iterating through all of them, for
  // which the following is better:
  //
  //    for (const orbitDefinition of kpuzzle.definition.orbits) { // …
  //    }
  lookupOrbitDefinition(orbitName) {
    __privateGet(this, _indexedOrbits) || __privateSet(this, _indexedOrbits, (() => {
      const indexedOrbits = {};
      for (const orbitDefinition of this.definition.orbits) {
        indexedOrbits[orbitDefinition.orbitName] = orbitDefinition;
      }
      return indexedOrbits;
    })());
    return __privateGet(this, _indexedOrbits)[orbitName];
  }
  name() {
    return this.definition.name;
  }
  identityTransformation() {
    return KTransformation.experimentalConstructIdentity(this);
  }
  moveToTransformation(move) {
    if (typeof move === "string") {
      move = new Move(move);
    }
    const cacheKey = move.toString();
    const cachedTransformationData = __privateGet(this, _moveToTransformationDataCache).get(cacheKey);
    if (cachedTransformationData) {
      return new KTransformation(this, cachedTransformationData);
    }
    if (this.experimentalPGNotation) {
      const transformationData2 = this.experimentalPGNotation.lookupMove(move);
      if (!transformationData2) {
        throw new Error(`could not map to internal move: ${move}`);
      }
      __privateGet(this, _moveToTransformationDataCache).set(cacheKey, transformationData2);
      return new KTransformation(this, transformationData2);
    }
    const transformationData = moveToTransformationUncached(this, move);
    __privateGet(this, _moveToTransformationDataCache).set(cacheKey, transformationData);
    return new KTransformation(this, transformationData);
  }
  algToTransformation(alg) {
    if (typeof alg === "string") {
      alg = new Alg(alg);
    }
    return algToTransformation(alg, this);
  }
  /** @deprecated */
  toTransformation(source) {
    var _a3, _b;
    if (typeof source === "string") {
      return this.algToTransformation(source);
    } else if ((_a3 = source == null ? void 0 : source.is) == null ? void 0 : _a3.call(source, Alg)) {
      return this.algToTransformation(source);
    } else if ((_b = source == null ? void 0 : source.is) == null ? void 0 : _b.call(source, Move)) {
      return this.moveToTransformation(source);
    } else {
      return source;
    }
  }
  defaultPattern() {
    return new KPattern(this, this.definition.defaultPattern);
  }
  // TODO: Handle incomplete default pattern data
  canConvertDefaultPatternToUniqueTransformation() {
    return __privateGet(this, _cachedCanConvertDefaultPatternToUniqueTransformation) ?? __privateSet(this, _cachedCanConvertDefaultPatternToUniqueTransformation, (() => {
      for (const orbitDefinition of this.definition.orbits) {
        const pieces = new Array(orbitDefinition.numPieces).fill(false);
        for (const piece of this.definition.defaultPattern[orbitDefinition.orbitName].pieces) {
          pieces[piece] = true;
        }
        for (const piece of pieces) {
          if (!piece) {
            return false;
          }
        }
      }
      return true;
    })());
  }
}, _indexedOrbits = new WeakMap(), _moveToTransformationDataCache = new WeakMap(), _cachedCanConvertDefaultPatternToUniqueTransformation = new WeakMap(), _a2);

export {
  KPattern,
  KTransformation,
  KPuzzle
};
//# sourceMappingURL=chunk-Q6LPAKSJ.js.map
