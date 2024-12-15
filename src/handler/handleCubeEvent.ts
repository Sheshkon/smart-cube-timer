import {GanCubeEvent} from "gan-web-bluetooth";
import handleGyroEvent from "./gyroHandler.ts";
import {handleMoveEvent, handleFaceletsEvent} from "./moveHandler.ts";
import $ from "jquery";
import {twistyPlayer} from "../index.ts";

function handleCubeEvent(event: GanCubeEvent) {
    if (event.type != "GYRO"){
        // console.log("GanCubeEvent", event);
        }
    if (event.type == "GYRO") {
        handleGyroEvent(event);
    } else if (event.type == "MOVE") {
        handleMoveEvent(event);
    } else if (event.type == "FACELETS") {
        handleFaceletsEvent(event);
    } else if (event.type == "HARDWARE") {
        $('#hardwareName').val(event.hardwareName || '- n/a -');
        $('#hardwareVersion').val(event.hardwareVersion || '- n/a -');
        $('#softwareVersion').val(event.softwareVersion || '- n/a -');
        $('#productDate').val(event.productDate || '- n/a -');
        $('#gyroSupported').val(event.gyroSupported ? "YES" : "NO");
    } else if (event.type == "BATTERY") {
        $('#batteryLevel').val(event.batteryLevel + '%');
    } else if (event.type == "DISCONNECT") {
        twistyPlayer.alg = '';
        $('.info input').val('- n/a -');
        $('#connect').html('Connect');
    }
}

export {
    handleCubeEvent
}