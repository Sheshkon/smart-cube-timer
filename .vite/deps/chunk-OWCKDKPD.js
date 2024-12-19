import {
  randomChoice
} from "./chunk-7ZL7KPOF.js";
import {
  from,
  puzzles
} from "./chunk-DFTALVS4.js";
import {
  KPattern
} from "./chunk-Q6LPAKSJ.js";
import {
  Alg,
  AlgBuilder,
  Move
} from "./chunk-ADOABKV4.js";

// node_modules/cubing/dist/lib/cubing/chunks/chunk-I4MRKD4Z.js
var isInsideWorker = false;
function setIsInsideWorker(inside) {
  isInsideWorker = inside;
}
function mustBeInsideWorker() {
  if (!isInsideWorker) {
    throw new Error(
      "Must be called from inside a worker, to avoid impact on page performance. Try importing from the top level of `cubing/solve`?"
    );
  }
}
function addOrientationSuffix(alg, suffixSpec) {
  const algBuilder = new AlgBuilder();
  algBuilder.experimentalPushAlg(alg);
  for (const suffix of suffixSpec) {
    const choice = randomChoice(suffix);
    if (choice !== null) {
      algBuilder.push(Move.fromString(choice));
    }
  }
  return algBuilder.toAlg();
}
var dynamic3x3x3min2phase = from(() => import("./search-dynamic-solve-3x3x3-QHRLSVAC-JOYIIV3R.js"));
var reidEdgeOrder = "UF UR UB UL DF DR DB DL FR FL BR BL".split(" ");
var reidCornerOrder = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");
var centerOrder = "U L F R B D".split(" ");
var map = [
  [1, 2, 0],
  [0, 2, 0],
  [1, 1, 0],
  [0, 3, 0],
  [2, 0, 0],
  [0, 1, 0],
  [1, 3, 0],
  [0, 0, 0],
  [1, 0, 0],
  [1, 0, 2],
  [0, 1, 1],
  [1, 1, 1],
  [0, 8, 1],
  [2, 3, 0],
  [0, 10, 1],
  [1, 4, 1],
  [0, 5, 1],
  [1, 7, 2],
  [1, 3, 2],
  [0, 0, 1],
  [1, 0, 1],
  [0, 9, 0],
  [2, 2, 0],
  [0, 8, 0],
  [1, 5, 1],
  [0, 4, 1],
  [1, 4, 2],
  [1, 5, 0],
  [0, 4, 0],
  [1, 4, 0],
  [0, 7, 0],
  [2, 5, 0],
  [0, 5, 0],
  [1, 6, 0],
  [0, 6, 0],
  [1, 7, 0],
  [1, 2, 2],
  [0, 3, 1],
  [1, 3, 1],
  [0, 11, 1],
  [2, 1, 0],
  [0, 9, 1],
  [1, 6, 1],
  [0, 7, 1],
  [1, 5, 2],
  [1, 1, 2],
  [0, 2, 1],
  [1, 2, 1],
  [0, 10, 0],
  [2, 4, 0],
  [0, 11, 0],
  [1, 7, 1],
  [0, 6, 1],
  [1, 6, 2]
];
function rotateLeft(s, i) {
  return s.slice(i) + s.slice(0, i);
}
function toReid333Struct(pattern) {
  const output = [[], []];
  for (let i = 0; i < 6; i++) {
    if (pattern.patternData["CENTERS"].pieces[i] !== i) {
      throw new Error("non-oriented puzzles are not supported");
    }
  }
  for (let i = 0; i < 12; i++) {
    output[0].push(
      rotateLeft(
        reidEdgeOrder[pattern.patternData["EDGES"].pieces[i]],
        pattern.patternData["EDGES"].orientation[i]
      )
    );
  }
  for (let i = 0; i < 8; i++) {
    output[1].push(
      rotateLeft(
        reidCornerOrder[pattern.patternData["CORNERS"].pieces[i]],
        pattern.patternData["CORNERS"].orientation[i]
      )
    );
  }
  output.push(centerOrder);
  return output;
}
function toMin2PhasePattern(pattern) {
  const reid = toReid333Struct(pattern);
  return map.map(([orbit, perm, ori]) => reid[orbit][perm][ori]).join("");
}
function isEquivalentTranformationIgnoringCENTERS(t1, t2) {
  const t1NoCenterOri = new KPattern(t1.kpuzzle, {
    EDGES: t1.patternData.EDGES,
    CORNERS: t1.patternData.CORNERS,
    CENTERS: {
      pieces: t1.patternData.CENTERS.pieces,
      orientation: new Array(6).fill(0)
    }
  }).experimentalToTransformation();
  const t2NoCenterOri = new KPattern(t2.kpuzzle, {
    EDGES: t2.patternData.EDGES,
    CORNERS: t2.patternData.CORNERS,
    CENTERS: {
      pieces: t2.patternData.CENTERS.pieces,
      orientation: new Array(6).fill(0)
    }
  }).experimentalToTransformation();
  return t1NoCenterOri.isIdentical(t2NoCenterOri);
}
function passesFilter(kpuzzle, pattern) {
  if (isEquivalentTranformationIgnoringCENTERS(kpuzzle.defaultPattern(), pattern)) {
    return false;
  }
  for (const face of "ULFRBD") {
    for (let amount = 1; amount < 4; amount++) {
      const transformation = kpuzzle.moveToTransformation(new Move(face, amount)).toKPattern();
      if (isEquivalentTranformationIgnoringCENTERS(transformation, pattern)) {
        return false;
      }
    }
  }
  return true;
}
var sgs3x3x3 = [
  [
    "R U'",
    "R2 B",
    //
    "D2 B2",
    "D' L B'",
    //
    "R' U'",
    "B",
    //
    "D B2",
    "R' B",
    //
    "L' U",
    "L2 B'",
    //
    "B2",
    "D L B'",
    //
    "L U",
    "B'",
    //
    "U'",
    "R B",
    //
    "D' B2",
    "L B'",
    //
    "U2",
    "U L' B'",
    //
    "",
    "U' L' B'",
    //
    "U",
    "L' B'"
  ],
  [
    "F2 L2",
    "F' L'",
    "R' F L2",
    //
    "D' L2",
    "F L2",
    "F2 L'",
    //
    "R' F' L'",
    "R2 F L2",
    "R2 F2 L'",
    //
    "L2",
    "F L'",
    "D' L",
    //
    "D2 L2",
    "R2 F' L'",
    "D L",
    //
    "",
    "L2 F L'",
    "L F' L2",
    //
    "L F L'",
    "F' L2",
    "L'",
    //
    "D L2",
    "D F L'",
    "L"
  ],
  [
    "R B U2 B'",
    "R2 B U' B'",
    //
    "F2 B U B'",
    "F B2 L' B2",
    //
    "B2 L B2",
    "B U' B'",
    //
    "R2 B U2 B'",
    "R' B U' B'",
    //
    "B2 L' B2",
    "F B U B'",
    //
    "B2 U' B2",
    "B' L B",
    //
    "L F' B D' B'",
    "B' U' B2 D B'",
    //
    "B U2 B'",
    "R B U' B'",
    //
    "B2 L2 B2",
    "D' B' L B",
    //
    "B U B'",
    "F' B2 L' B2",
    //
    "",
    "B2 L' B' U' B'"
  ],
  [
    "U F2 L2 U'",
    "F' U L' U'",
    //
    "F2 U L' U'",
    "U F L2 U'",
    //
    "U2 B2 U2",
    "R' U' B U",
    //
    "D2 U L U'",
    "D U2 B' U2",
    //
    "U L2 U'",
    "F U L' U'",
    //
    "D U L U'",
    "U2 B' U2",
    //
    "",
    "U2 B' U' L' U'",
    //
    "U2 L' U2",
    "U' B U",
    //
    "U L U'",
    "D' U2 B' U2",
    //
    "U L' U'",
    "U2 B U2"
  ],
  [
    "R' D' F2",
    "F'",
    //
    "F2",
    "D R F'",
    //
    "R D' F2",
    "R2 F'",
    //
    "D' F2",
    "R F'",
    //
    "F2 R' D' F2",
    "F",
    //
    "D2 F2",
    "D' R F'",
    //
    "R2 D' F2",
    "R' F'",
    //
    "D F2",
    "D2 R F'",
    //
    "",
    "F R' D' F2"
  ],
  [
    "R' D2 F' D F",
    "R F2 R2 F2",
    "R2 F' D2 F",
    //
    "F' R2 D2 F",
    "L D' L'",
    "D F' D2 F",
    //
    "F2 R2 F2",
    "R F' D2 F",
    "F' R2 D' F",
    //
    "F' R' D2 F",
    "F2 R' F2",
    "L D L'",
    //
    "F' R D' F",
    "F2 R F2",
    "F' D2 F",
    //
    "",
    "L D2 R D' L'",
    "F' D2 F' R F2",
    //
    "D2 R2 F2 R2 F2",
    "D F' D' F",
    "F' D F"
  ],
  [
    "U F2 U'",
    "R U F' U'",
    //
    "D R U F2 U'",
    "U F U'",
    //
    "R2 U F2 U'",
    "R' U F' U'",
    //
    "R U F2 U'",
    "R2 U F' U'",
    //
    "",
    "U L D L' F U'",
    //
    "F2 D' R D F2",
    "D2 U F U'",
    //
    "R' U F2 U'",
    "U F' U'",
    //
    "F2 D2 R D2 F2",
    "D U F U'"
  ],
  [
    "R2",
    "R' B' D B",
    //
    "D R'",
    "F' R2 F",
    //
    "",
    "R B' D B",
    //
    "R'",
    "B' D B",
    //
    "D' R'",
    "D2 F' R2 F",
    //
    "R",
    "R2 B' D B",
    //
    "D2 R'",
    "B' D' B"
  ],
  [
    "R2 D' R2",
    "F' R' F R",
    "R D' R2 D R'",
    //
    "D2 R2 D2 R2",
    "R' D' F' R F",
    "U F D F' U'",
    //
    "",
    "R2 D2 B R' B' R'",
    "R' F D' F2 R F",
    //
    "R2 D R2",
    "F2 U F U' F",
    "R' D F' R F",
    //
    "D R2 D2 R2",
    "U F D' F' U'",
    "D R' D2 F' R F",
    //
    "R2 D2 R2",
    "U F D2 F' U'",
    "R' D2 F' R F"
  ],
  [
    "B R B'",
    "F D F' B R2 B'",
    //
    "D B R2 B'",
    "D2 B R' B'",
    //
    "B R2 B'",
    "D B R' B'",
    //
    "D' B R2 B'",
    "B R' B'",
    //
    "",
    "B R2 B' D B R' B'",
    //
    "D2 B R2 B'",
    "D' B R' B'"
  ],
  [
    "",
    "R' D R F D2 F'",
    //
    "R' D R",
    "D F D' F'",
    //
    "R F' R' F",
    "F D' F'",
    //
    "R' D' R",
    "F D2 F'",
    //
    "R' D2 R",
    "F D F'"
  ],
  [
    "",
    "F2 D2 R F' R' D2 F' D2 F'",
    "F2 D2 F' D' F D' F' D2 F'",
    //
    "F2 D F2 D F2 D2 F2",
    "D2 F L D2 L' D2 F'",
    "D F D2 L D2 L' F'",
    //
    "R' D B' D2 B D' R",
    "R' D2 B' D2 B R",
    "F D2 F' D F D F'",
    //
    "F D' L D2 L' D F'",
    "B D' F D B' D' F'",
    "F D2 L D2 L' F'",
    //
    "F D' L D L' D F'",
    "F L D2 L' D2 F'",
    "R' B' D2 B D2 R"
  ],
  [
    "D'",
    "F L D L' D' F'",
    //
    "D2",
    "L B D B' D' L'",
    //
    "D",
    "B' L' D' L D B",
    //
    "",
    "D F L D L' D' F'"
  ],
  [
    "F' D2 F D F' D F",
    "F' D' R' D R F",
    //
    "F' R' D' R D F",
    "B D R D' R' B'",
    //
    "",
    "D B' D' L' D L B"
  ],
  [
    "D F D F' D F D2 F'",
    "F' U2 B' R' B U2 F' L F' L' F'",
    //
    "",
    "D2 L D L2 F L F2 D F"
  ],
  [
    "L B' L' F L B L' F'",
    "F2 U F' D2 F U' F' D2 F'",
    "D' F' D B D' F D B'",
    //
    "F L2 F R2 F' L2 F R2 F2",
    "D B D' F' D B' D' F",
    "R F L F' R' F L' F'",
    //
    "",
    "D2 B L' U2 L B' D2 B L' U2 L B'",
    "D2 F R' U2 R F' D2 F R' U2 R F'",
    //
    "R F L' F' R' F L F'",
    "D F D' B' D F' D' B",
    "L2 F2 L' B2 L F2 L' B2 L'"
  ],
  [
    "L B R' B' L' B R B'",
    "R' B R F' R' B' R F",
    "L D2 L U L' D2 L U' L2",
    //
    "",
    "D2 B' D2 F D' L2 F L2 F' D2 B D' F'",
    "D2 F' R' F R2 B' D2 B D2 R' F D2 F'",
    //
    "L B L' F L B' L' F'",
    "F' D2 F' U' F D2 F' U F2",
    "D' B' D F D' B D F'"
  ],
  ["", "D2 F' L U2 L' F D2 F' L U2 L' F", "D2 B' R U2 R' B D2 B' R U2 R' B"]
];
async function random333Pattern() {
  const kpuzzle = await puzzles["3x3x3"].kpuzzle();
  let pattern = kpuzzle.defaultPattern();
  for (const piece of sgs3x3x3) {
    pattern = pattern.applyAlg(Alg.fromString(randomChoice(piece)));
  }
  if (!passesFilter(kpuzzle, pattern)) {
    return random333Pattern();
  }
  return pattern;
}
async function solve333(s) {
  mustBeInsideWorker();
  return Alg.fromString(
    (await dynamic3x3x3min2phase).solvePattern(toMin2PhasePattern(s))
  );
}
async function random333Scramble() {
  return solve333(await random333Pattern());
}
async function initialize333() {
  (await dynamic3x3x3min2phase).initialize();
}
var randomSuffixes = [
  [null, "Rw", "Rw2", "Rw'", "Fw", "Fw'"],
  [null, "Dw", "Dw2", "Dw'"]
];
async function random333OrientedScramble() {
  return addOrientationSuffix(await random333Scramble(), randomSuffixes);
}

export {
  setIsInsideWorker,
  mustBeInsideWorker,
  addOrientationSuffix,
  random333Pattern,
  solve333,
  random333Scramble,
  initialize333,
  random333OrientedScramble
};
//# sourceMappingURL=chunk-OWCKDKPD.js.map
