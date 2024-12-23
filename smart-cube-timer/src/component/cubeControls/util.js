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

export {
    CubeCommand,
    CubeEventType
}