import Cube from "src/component/cube/Cube.jsx";
import CubeControls from "src/component/cubeControls/CubeControls.jsx";
import Scramble from "src/component/scramble/Scramble.jsx";
import Timer from "src/component/timer/Timer.jsx";
import {CubeProvider} from "src/context/CubeContext.jsx";

const App = () => {
    return (
        <>
            <CubeProvider>

                <div id="app">
                    <div className="scramble-container">
                        <Scramble/>
                    </div>
                    <Timer/>


                    <div className="app-container">
                        <div className="cube-container">
                            <Cube/>
                            <CubeControls/>
                        </div>
                    </div>
                </div>
            </CubeProvider>
        </>
    )
}

export default App
