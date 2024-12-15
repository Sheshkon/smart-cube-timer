import $ from 'jquery';
import {TwistyPlayer} from 'cubing/twisty';

import {GanCubeConnection} from 'gan-web-bluetooth';


const twistyPlayer = new TwistyPlayer({
    puzzle: '3x3x3',
    visualization: 'PG3D',
    alg: '',
    experimentalSetupAnchor: 'start',
    background: 'none',
    controlPanel: 'none',
    hintFacelets: 'none',
    experimentalDragInput: 'none',
    cameraLatitude: 0,
    cameraLongitude: 0,
    cameraLatitudeLimit: 0,
    tempoScale: 5
});

$('#cube').append(twistyPlayer);

let conn: GanCubeConnection | null;

function setConnection(connection: GanCubeConnection | null) {
    conn = connection
}


export {
    conn,
    setConnection,
    twistyPlayer
}
