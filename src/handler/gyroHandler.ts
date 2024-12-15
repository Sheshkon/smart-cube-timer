import * as THREE from "three";
import {GanCubeEvent} from "gan-web-bluetooth";
import $ from "jquery";
import {cubeQuaternion, HOME_ORIENTATION} from "../utils.ts";

let basis: THREE.Quaternion | null;

export default async function handleGyroEvent(event: GanCubeEvent) {
    if (event.type === "GYRO") {
        let {x: qx, y: qy, z: qz, w: qw} = event.quaternion;
        let quat = new THREE.Quaternion(qx, qz, -qy, qw).normalize();
        if (!basis) {
            basis = quat.clone().conjugate();
        }
        cubeQuaternion.copy(quat.premultiply(basis).premultiply(HOME_ORIENTATION));
        $('#quaternion').val(`x: ${qx.toFixed(3)}, y: ${qy.toFixed(3)}, z: ${qz.toFixed(3)}, w: ${qw.toFixed(3)}`);
        if (event.velocity) {
            let {x: vx, y: vy, z: vz} = event.velocity;
            $('#velocity').val(`x: ${vx}, y: ${vy}, z: ${vz}`);
        }
    }
}

$('#reset-gyro').on('click', async () => {
    basis = null;
});