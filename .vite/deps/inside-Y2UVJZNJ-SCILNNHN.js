import {
  expose
} from "./chunk-X7KU3X3S.js";
import {
  countMoves
} from "./chunk-GO5VLOZP.js";
import {
  addOrientationSuffix,
  initialize333,
  mustBeInsideWorker,
  random333OrientedScramble,
  random333Scramble,
  setIsInsideWorker,
  solve333
} from "./chunk-OWCKDKPD.js";
import "./chunk-DGSRAQEJ.js";
import {
  randomChoice
} from "./chunk-7ZL7KPOF.js";
import {
  cube2x2x2,
  from,
  puzzles
} from "./chunk-DFTALVS4.js";
import {
  KPattern,
  KPuzzle
} from "./chunk-Q6LPAKSJ.js";
import {
  Alg,
  AlgBuilder,
  Move
} from "./chunk-ADOABKV4.js";
import {
  __publicField
} from "./chunk-WOOG5QLI.js";

// node_modules/cubing/dist/lib/cubing/chunks/inside-Y2UVJZNJ.js
var DEFAULT_STAGE1_DEPTH_LIMIT = 2;
var DOUBLECHECK_PLACED_PIECES = true;
var DEBUG = false;
function calculateMoves(kpuzzle, moveNames) {
  const searchMoves = [];
  for (const moveName of moveNames) {
    const rootMove = new Move(moveName);
    if (rootMove.amount !== 1) {
      throw new Error(
        "SGS cannot handle def moves with an amount other than 1 yet."
      );
    }
    let transformation = kpuzzle.identityTransformation();
    for (let i = 1; ; i++) {
      transformation = transformation.applyMove(rootMove);
      if (transformation.isIdentityTransformation()) {
        break;
      }
      searchMoves.push({
        move: rootMove.modified({ amount: i }),
        transformation
      });
    }
  }
  return searchMoves;
}
var TrembleSolver = class {
  constructor(kpuzzle, sgs, trembleMoveNames) {
    __publicField(this, "searchMoves");
    this.kpuzzle = kpuzzle;
    this.sgs = sgs;
    this.searchMoves = calculateMoves(
      this.kpuzzle,
      trembleMoveNames ?? Object.keys(this.kpuzzle.definition.moves)
    );
  }
  // public badRandomMoves(): KSolvePuzzleState {
  //   return badRandomMoves(this.moves, this.ksp);
  // }
  async solve(pattern, stage1DepthLimit = DEFAULT_STAGE1_DEPTH_LIMIT, quantumMoveOrder) {
    const transformation = pattern.experimentalToTransformation();
    if (!transformation) {
      throw new Error(
        "distinguishable pieces are not supported in tremble solver yt"
      );
    }
    let bestAlg = null;
    let bestLen = 1e6;
    const recur = (recursiveTransformation, togo, sofar) => {
      if (togo === 0) {
        const sgsAlg = this.sgsPhaseSolve(recursiveTransformation, bestLen);
        if (!sgsAlg) {
          return;
        }
        const newAlg = sofar.concat(sgsAlg).experimentalSimplify({
          cancel: {
            directional: "any-direction",
            puzzleSpecificModWrap: "canonical-centered"
          },
          puzzleSpecificSimplifyOptions: { quantumMoveOrder }
        });
        const len = countMoves(newAlg);
        if (bestAlg === null || len < bestLen) {
          if (DEBUG) {
            console.log(`New best (${len} moves): ${newAlg.toString()}`);
            console.log(`Tremble moves are: ${sofar.toString()}`);
          }
          bestAlg = newAlg;
          bestLen = len;
        }
        return;
      }
      for (const searchMove of this.searchMoves) {
        recur(
          recursiveTransformation.applyTransformation(
            searchMove.transformation
          ),
          togo - 1,
          sofar.concat([searchMove.move])
        );
      }
    };
    for (let d = 0; d <= stage1DepthLimit; d++) {
      recur(transformation, d, new Alg());
    }
    if (bestAlg === null) {
      throw new Error("SGS search failed.");
    }
    return bestAlg;
  }
  sgsPhaseSolve(initialTransformation, bestLenSofar) {
    const algBuilder = new AlgBuilder();
    let transformation = initialTransformation;
    for (const step of this.sgs.ordering) {
      const cubieSeq = step.pieceOrdering;
      let key = "";
      const inverseTransformation = transformation.invert();
      for (let i = 0; i < cubieSeq.length; i++) {
        const loc = cubieSeq[i];
        const orbitName = loc.orbitName;
        const idx = loc.permutationIdx;
        key += ` ${inverseTransformation.transformationData[orbitName].permutation[idx]} ${inverseTransformation.transformationData[orbitName].orientationDelta[idx]}`;
      }
      const info = step.lookup[key];
      if (!info) {
        throw new Error("Missing algorithm in sgs or esgs?");
      }
      algBuilder.experimentalPushAlg(info.alg);
      if (algBuilder.experimentalNumAlgNodes() >= bestLenSofar) {
        return null;
      }
      transformation = transformation.applyTransformation(info.transformation);
      if (DOUBLECHECK_PLACED_PIECES) {
        for (let i = 0; i < cubieSeq.length; i++) {
          const location = cubieSeq[i];
          const orbitName = location.orbitName;
          const idx = location.permutationIdx;
          if (transformation.transformationData[orbitName].permutation[idx] !== idx || transformation.transformationData[orbitName].orientationDelta[idx] !== 0) {
            throw new Error("bad SGS :-(");
          }
        }
      }
    }
    return algBuilder.toAlg();
  }
};
function randomPatternFromSGS(kpuzzle, sgs) {
  let transformation = kpuzzle.identityTransformation();
  for (const step of sgs.ordering) {
    const sgsAction = randomChoice(Object.values(step.lookup));
    transformation = transformation.applyTransformation(
      sgsAction.transformation
    );
  }
  return transformation.toKPattern();
}
var twsearchPromise = from(async () => import("./twsearch-MRZGOB6T-JKTSIS35.js"));
async function wasmTwsearch(def, pattern, options) {
  const { wasmTwsearch: wasmTwsearch2 } = await twsearchPromise;
  return wasmTwsearch2(def, pattern, options);
}
async function wasmRandomScrambleForEvent(eventID) {
  const { wasmRandomScrambleForEvent: wasmRandomScrambleForEvent2 } = await twsearchPromise;
  return wasmRandomScrambleForEvent2(eventID);
}
var searchDynamicSideEvents = from(() => import("./search-dynamic-sgs-side-events-RPVZU2YB-2DALDADD.js"));
var cachedTrembleSolver = null;
async function getCachedTrembleSolver() {
  return cachedTrembleSolver || (cachedTrembleSolver = (async () => {
    const sgsCachedData = await (await searchDynamicSideEvents).cachedData222();
    return new TrembleSolver(
      await puzzles["2x2x2"].kpuzzle(),
      sgsCachedData,
      "URFLBD".split("")
    );
  })());
}
async function preInitialize222() {
  await getCachedTrembleSolver();
}
async function solve222(pattern) {
  mustBeInsideWorker();
  return wasmTwsearch((await cube2x2x2.kpuzzle()).definition, pattern, {
    generatorMoves: "UFLR".split("")
  });
}
var dynamic4x4x4Solver = from(() => import("./search-dynamic-solve-4x4x4-V5D7RQND-6MQFEVDP.js"));
var randomSuffixes = [
  [null, "x", "x2", "x'", "z", "z'"],
  [null, "y", "y2", "y'"]
];
async function initialize444() {
  return (await dynamic4x4x4Solver).initialize();
}
async function random444Scramble() {
  mustBeInsideWorker();
  return (await dynamic4x4x4Solver).random444Scramble();
}
async function random444OrientedScramble() {
  return addOrientationSuffix(await random444Scramble(), randomSuffixes);
}
var dynamicFTO = from(
  () => import("./search-dynamic-solve-fto-UOKDYVD5-J6GTHILD.js")
);
var dynamic = from(() => import("./search-dynamic-sgs-unofficial-2TYKOUM4-UEU3VXDC.js"));
async function randomFTOScramble() {
  mustBeInsideWorker();
  return new Alg(await (await dynamicFTO).getRandomFTOScramble());
}
var dynamicKilominxSolver = from(() => import("./search-dynamic-solve-kilominx-RAZM75GA-WFI3GUSF.js"));
async function randomKilominxScramble() {
  mustBeInsideWorker();
  return (await dynamicKilominxSolver).getRandomKilominxScramble();
}
var dynamicMasterTetraminxSolver = from(() => import("./search-dynamic-solve-master_tetraminx-3D4MBF3V-NJOJVTRQ.js"));
async function randomMasterTetraminxScramble() {
  mustBeInsideWorker();
  return new Alg(
    await (await dynamicMasterTetraminxSolver).randomMasterTetraminxScrambleString()
  );
}
var TREMBLE_DEPTH = 2;
var cachedTrembleSolver2 = null;
async function getCachedTrembleSolver2() {
  return cachedTrembleSolver2 || (cachedTrembleSolver2 = (async () => {
    const json = await (await searchDynamicSideEvents).cachedSGSDataMegaminx();
    return new TrembleSolver(
      await (await searchDynamicSideEvents).cachedMegaminxKPuzzleWithoutMO(),
      json,
      ["U", "R", "F", "L", "BR", "BL", "FR", "FL", "DR", "DL", "B", "D"]
    );
  })());
}
async function solveMegaminx(pattern) {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver2();
  const patternDataWithoutMO = structuredClone(
    pattern.patternData
  );
  patternDataWithoutMO.CENTERS.orientation = new Array(12).fill(0);
  const patternWithoutMO = new KPattern(
    await (await searchDynamicSideEvents).cachedMegaminxKPuzzleWithoutMO(),
    patternDataWithoutMO
  );
  const alg = await trembleSolver.solve(
    patternWithoutMO,
    TREMBLE_DEPTH,
    () => 5
    // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
var TREMBLE_DEPTH2 = 3;
var cachedTrembleSolver3 = null;
async function getCachedTrembleSolver3() {
  return cachedTrembleSolver3 || (cachedTrembleSolver3 = (async () => {
    const json = await (await searchDynamicSideEvents).sgsDataPyraminx();
    return new TrembleSolver(
      await puzzles.pyraminx.kpuzzle(),
      json,
      "RLUB".split("")
    );
  })());
}
async function solvePyraminx(pattern) {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver3();
  const alg = await trembleSolver.solve(pattern, TREMBLE_DEPTH2, () => 3);
  return alg;
}
var searchDynamicUnofficial = from(() => import("./search-dynamic-sgs-unofficial-2TYKOUM4-UEU3VXDC.js"));
async function randomRediCubeScramble() {
  mustBeInsideWorker();
  return (await searchDynamicUnofficial).getRandomRediCubeScramble();
}
var TREMBLE_DEPTH3 = 3;
var cachedTrembleSolver4 = null;
async function getCachedTrembleSolver4() {
  return cachedTrembleSolver4 || (cachedTrembleSolver4 = (async () => {
    const json = await (await searchDynamicSideEvents).sgsDataSkewb();
    return new TrembleSolver(
      await (await searchDynamicSideEvents).skewbKPuzzleWithoutMOCached(),
      json,
      "RLUB".split("")
    );
  })());
}
async function resetCenterOrientation(pattern) {
  return new KPattern(
    await (await searchDynamicSideEvents).skewbKPuzzleWithoutMOCached(),
    {
      CORNERS: pattern.patternData.CORNERS,
      CENTERS: {
        pieces: pattern.patternData.CENTERS.pieces,
        orientation: new Array(6).fill(0)
      }
    }
  );
}
async function solveSkewb(pattern) {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver4();
  const alg = await trembleSolver.solve(
    await resetCenterOrientation(pattern),
    TREMBLE_DEPTH3,
    (quantumMove) => quantumMove.family === "y" ? 4 : 3
    // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
async function randomSkewbFixedCornerPattern() {
  return randomPatternFromSGS(
    await (await searchDynamicSideEvents).skewbKPuzzleWithoutMOCached(),
    await (await searchDynamicSideEvents).sgsDataSkewbFixedCorner()
  );
}
async function randomSkewbFixedCornerScramble() {
  return solveSkewb(await randomSkewbFixedCornerPattern());
}
var dynamicSq1Solver = from(() => import("./search-dynamic-solve-sq1-YESVPPLF-AFRBRA3F.js"));
async function getRandomSquare1Scramble() {
  return Alg.fromString(
    await (await dynamicSq1Solver).getRandomSquare1ScrambleString()
  );
}
var IDLE_PREFETCH_TIMEOUT_MS = 1e3;
setIsInsideWorker(true);
var DEBUG_MEASURE_PERF = true;
function setDebugMeasurePerf(newDebugMeasurePerf) {
  DEBUG_MEASURE_PERF = newDebugMeasurePerf;
}
function now() {
  return (typeof performance === "undefined" ? Date : performance).now();
}
async function measurePerf(name, f, options) {
  if (!DEBUG_MEASURE_PERF) {
    return f();
  }
  const start = now();
  const result = f();
  if (result == null ? void 0 : result.then) {
    await result;
  }
  const end = now();
  console.warn(
    `${name}${(options == null ? void 0 : options.isPrefetch) ? " (prefetched)" : ""}: ${Math.round(
      end - start
    )}ms`
  );
  return result;
}
var prefetchPromises = /* @__PURE__ */ new Map();
var queuedPrefetchTimeoutID = null;
async function randomScrambleForEvent(eventID, options) {
  function wasm() {
    return measurePerf(
      `wasmRandomScrambleForEvent(${JSON.stringify(eventID)})`,
      () => wasmRandomScrambleForEvent(eventID),
      {
        isPrefetch: options == null ? void 0 : options.isPrefetch
      }
    );
  }
  switch (eventID) {
    case "222":
      return (await wasm()).experimentalSimplify({
        puzzleSpecificSimplifyOptions: {
          quantumMoveOrder: () => 4
        }
      });
    case "555":
    case "666":
    case "777":
    case "333fm":
    case "minx":
    case "pyram":
    case "555bf":
      return wasm();
    case "333":
    case "333oh":
    case "333ft":
      return measurePerf("random333Scramble", random333Scramble, {
        isPrefetch: options == null ? void 0 : options.isPrefetch
      });
    case "333bf":
    case "333mbf":
      return measurePerf(
        "random333OrientedScramble",
        random333OrientedScramble
      );
    case "444":
      return measurePerf("random444Scramble", random444Scramble, {
        isPrefetch: options == null ? void 0 : options.isPrefetch
      });
    case "444bf":
      return measurePerf(
        "random444OrientedScramble",
        random444OrientedScramble
      );
    case "skewb":
      return measurePerf(
        "randomSkewbFixedCornerScramble",
        randomSkewbFixedCornerScramble
      );
    case "sq1":
      return measurePerf("getRandomSquare1Scramble", getRandomSquare1Scramble, {
        isPrefetch: options == null ? void 0 : options.isPrefetch
      });
    case "fto":
      return measurePerf("randomFTOScramble", randomFTOScramble, {
        isPrefetch: options == null ? void 0 : options.isPrefetch
      });
    case "master_tetraminx":
      return measurePerf(
        "randomMasterTetraminxScramble",
        randomMasterTetraminxScramble
      );
    case "kilominx":
      return measurePerf("randomKilominxScramble", randomKilominxScramble, {
        isPrefetch: options == null ? void 0 : options.isPrefetch
      });
    case "redi_cube":
      return measurePerf("randomRediCubeScramble", randomRediCubeScramble, {
        isPrefetch: options == null ? void 0 : options.isPrefetch
      });
    default:
      throw new Error(`unsupported event: ${eventID}`);
  }
}
var currentPrefetchLevel = "auto";
var insideAPI = {
  initialize: async (eventID) => {
    switch (eventID) {
      case "222":
        return measurePerf("preInitialize222", preInitialize222);
      case "333":
      case "333oh":
      case "333ft":
        return measurePerf("initialize333", initialize333);
      case "444":
        return measurePerf("initialize444", initialize444);
      default:
        throw new Error(`unsupported event: ${eventID}`);
    }
  },
  setScramblePrefetchLevel(prefetchLevel) {
    currentPrefetchLevel = prefetchLevel;
  },
  randomScrambleForEvent: async (eventID) => {
    let promise = prefetchPromises.get(eventID);
    if (promise) {
      prefetchPromises.delete(eventID);
    } else {
      promise = randomScrambleForEvent(eventID);
    }
    if (currentPrefetchLevel !== "none") {
      promise.then(() => {
        if (queuedPrefetchTimeoutID) {
          clearTimeout(queuedPrefetchTimeoutID);
        }
        queuedPrefetchTimeoutID = setTimeout(
          () => {
            prefetchPromises.set(
              eventID,
              randomScrambleForEvent(eventID, {
                isPrefetch: true
              })
            );
          },
          currentPrefetchLevel === "immediate" ? 0 : IDLE_PREFETCH_TIMEOUT_MS
        );
      });
    }
    return promise;
  },
  randomScrambleStringForEvent: async (eventID) => {
    return (await insideAPI.randomScrambleForEvent(eventID)).toString();
  },
  solve333ToString: async (patternData) => {
    const pattern = new KPattern(await puzzles["3x3x3"].kpuzzle(), patternData);
    return (await solve333(pattern)).toString();
  },
  solve222ToString: async (patternData) => {
    const pattern = new KPattern(await puzzles["2x2x2"].kpuzzle(), patternData);
    return (await solve222(pattern)).toString();
  },
  solveSkewbToString: async (patternData) => {
    const pattern = new KPattern(await puzzles["skewb"].kpuzzle(), patternData);
    return (await solveSkewb(pattern)).toString();
  },
  solvePyraminxToString: async (patternData) => {
    const pattern = new KPattern(
      await puzzles["pyraminx"].kpuzzle(),
      patternData
    );
    return (await solvePyraminx(pattern)).toString();
  },
  solveMegaminxToString: async (patternData) => {
    const pattern = new KPattern(
      await puzzles["megaminx"].kpuzzle(),
      patternData
    );
    return (await solveMegaminx(pattern)).toString();
  },
  setDebugMeasurePerf: async (measure) => {
    setDebugMeasurePerf(measure);
  },
  solveTwsearchToString: async (def, patternData, options) => {
    const kpuzzle = new KPuzzle(def);
    const pattern = new KPattern(kpuzzle, patternData);
    return (await wasmTwsearch(def, pattern, options)).toString();
  }
};
expose(insideAPI);
//# sourceMappingURL=inside-Y2UVJZNJ-SCILNNHN.js.map
