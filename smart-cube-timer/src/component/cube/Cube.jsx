import {cubeQuaternion} from "@utils/util.ts";
import {useEffect, useRef} from "react";
import {useCubeState} from "src/context/CubeContext.jsx";
import 'src/style.css'


const Cube = () => {
    const initialized = useRef(false);
    const cubeRef = useRef(null);

    const {twistyPlayerRef} = useCubeState();

    const startAnimation = () => {

        const animateCubeOrientation = async () => {
            let twistyScene;
            let twistyVantage;

            if (!twistyScene || !twistyVantage) {
                const vantageList = await twistyPlayerRef.current.experimentalCurrentVantages();
                twistyVantage = [...vantageList][0];
                twistyScene = await twistyVantage.scene.scene();
            }
            twistyScene.quaternion.slerp(cubeQuaternion, 0.25);
            twistyVantage.render();

            requestAnimationFrame(animateCubeOrientation);
        }
        requestAnimationFrame(animateCubeOrientation);
    }

    useEffect(() => {
        if (initialized.current) return;

        if (cubeRef.current) {
            cubeRef.current.appendChild(twistyPlayerRef.current);
            initialized.current = true;
        }

        startAnimation()
    }, []);


    return (
        <>
            <div id="cube" ref={cubeRef}/>
        </>
    )
};

export default Cube;