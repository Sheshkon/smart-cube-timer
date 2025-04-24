const CubeCommand = Object.freeze({
    RESET: {type: "REQUEST_RESET"},
    HARDWARE: {type: "REQUEST_HARDWARE"},
    FACELETS: {type: "REQUEST_FACELETS"},
    BATTERY: {type: "REQUEST_BATTERY"}
})

const CubeEventType = Object.freeze({
    FACELETS: "FACELETS",
    MOVE: "MOVE",
    GYRO: "GYRO",
})


const customMacAddressProvider = async (device, isFallbackCall) => {
    if (isFallbackCall) {
        return prompt('Unable do determine cube MAC address!\nPlease enter MAC address manually:');
    } else {
        return typeof device.watchAdvertisements == 'function' ? null :
            prompt('Seems like your browser does not support Web Bluetooth watchAdvertisements() API. Enable following flag in Chrome:\n\nchrome://flags/#enable-experimental-web-platform-features\n\nor enter cube MAC address manually:');
    }
};

export {
    customMacAddressProvider,
    CubeCommand,
    CubeEventType
}

