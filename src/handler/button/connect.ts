import $ from "jquery";
import {connectGanCube, MacAddressProvider} from "gan-web-bluetooth";
import {conn, setConnection} from "../../index.ts";
import {handleCubeEvent} from "../handleCubeEvent.ts";
import {generateScramble} from "../../scramble.ts";

const customMacAddressProvider: MacAddressProvider = async (device, isFallbackCall): Promise<string | null> => {
    if (isFallbackCall) {
        return prompt('Unable do determine cube MAC address!\nPlease enter MAC address manually:');
    } else {
        return typeof device.watchAdvertisements == 'function' ? null :
            prompt('Seems like your browser does not support Web Bluetooth watchAdvertisements() API. Enable following flag in Chrome:\n\nchrome://flags/#enable-experimental-web-platform-features\n\nor enter cube MAC address manually:');
    }
};


$('#connect').on('click', async () => {
    if (conn) {
        await conn.disconnect();
        setConnection(null);
        $('#reset-gyro').hide();
        $('#reset-state').hide();
        $('#battery').hide();


    } else {
        setConnection(await connectGanCube(customMacAddressProvider));
        conn!.events$?.subscribe(handleCubeEvent);
        await conn!.sendCubeCommand({type: "REQUEST_HARDWARE"});
        await conn!.sendCubeCommand({type: "REQUEST_FACELETS"});
        await conn!.sendCubeCommand({type: "REQUEST_BATTERY"});
        $('#deviceName').val(conn!.deviceName);
        $('#deviceMAC').val(conn!.deviceMAC);
        $('#connect').html('Disconnect');
        await generateScramble()
        $('#reset-gyro').show();
        $('#reset-state').show();
        $('#battery').show();
    }
});


