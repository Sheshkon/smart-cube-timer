import Cube from "src/component/cube/Cube";
import CubeControls from "src/component/cubeControls/CubeControls.jsx";
import Scramble from "src/component/scramble/Scramble.jsx";
import Timer from "src/component/timer/Timer.jsx";
import {CubeProvider} from "src/context/CubeContext.jsx";
import Stats from "src/component/stats/Stats.jsx";

const App = () => {
    return (
        <>
            <CubeProvider>
                <div id="app">
                    <Scramble/>
                    <Timer/>
                    <div className="app-container">
                        <div className="cube-container">
                            <Cube/>
                            <CubeControls/>
                        </div>

                    </div>
                    <Stats/>
                </div>
            </CubeProvider>
        </>
    )
}

export default App
