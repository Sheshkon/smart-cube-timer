import $ from "jquery";
import {conn, twistyPlayer} from "../../index.ts";

$('#reset-state').on('click', async () => {
    console.log("reseting state")
    conn?.sendCubeCommand({type: "REQUEST_RESET"});
    twistyPlayer.alg = '';
});