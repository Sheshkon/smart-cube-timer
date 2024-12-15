import {cubeQuaternion} from "../../utils.ts";
import {twistyPlayer} from "../../index.ts";
import * as THREE from "three";

let twistyScene: THREE.Scene;
let twistyVantage: any;

async function animateCubeOrientation() {
    if (!twistyScene || !twistyVantage) {
        const vantageList = await twistyPlayer.experimentalCurrentVantages();
        twistyVantage = [...vantageList][0];
        twistyScene = await twistyVantage.scene.scene();
    }
    twistyScene.quaternion.slerp(cubeQuaternion, 0.25);
    twistyVantage.render();
    requestAnimationFrame(animateCubeOrientation);
}

requestAnimationFrame(animateCubeOrientation);