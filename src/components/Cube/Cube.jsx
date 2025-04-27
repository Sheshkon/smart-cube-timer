import {useEffect, useRef} from "react";
import {useCubeState} from "../../contexts/CubeContext";
import {cubeQuaternion} from "../../utils/util.ts";
import '../../style.css'

const Cube = () => {
    const initialized = useRef(false);
    const cubeRef = useRef(null);
    const animationRef = useRef(-1);
    const {twistyPlayerRef} = useCubeState();

    const {connection, batteryLevel} = useCubeState()

    const getBatteryColor = (batteryLevel) => {
        if (batteryLevel > 80) return "text-success"
        if (batteryLevel > 40) return "text-warning"
        if (batteryLevel > 15) return "text-error"
        return "text-error"
    }

    const animateCubeOrientation = async () => {
        try {
            if (!twistyPlayerRef.current) return;

            const vantageList = await twistyPlayerRef.current.experimentalCurrentVantages();
            if (!vantageList || vantageList.size === 0) {
                animationRef.current = requestAnimationFrame(animateCubeOrientation);
                return;
            }

            const twistyVantage = [...vantageList][0];
            if (!twistyVantage?.scene) {
                animationRef.current = requestAnimationFrame(animateCubeOrientation);
                return;
            }

            const twistyScene = await twistyVantage.scene.scene();
            if (!twistyScene?.quaternion) {
                animationRef.current = requestAnimationFrame(animateCubeOrientation);
                return;
            }

            twistyScene.quaternion.slerp(cubeQuaternion, 0.25);
            twistyVantage.render();

            animationRef.current = requestAnimationFrame(animateCubeOrientation);
        } catch (error) {
            console.error("Error in animation loop:", error);
        }
    };

    useEffect(() => {
        if (initialized.current) return;

        if (cubeRef.current && twistyPlayerRef.current) {
            cubeRef.current.appendChild(twistyPlayerRef.current);
            initialized.current = true;
            animationRef.current = requestAnimationFrame(animateCubeOrientation);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [twistyPlayerRef]);

    return (<>
        <div className="relative" id="cube" ref={cubeRef}>

            {connection &&
                <div className="absolute" style={{flexDirection: "column-reverse", right: "0.25rem", top: "1.25rem"}}>
                    {/*<p>Battery</p>*/}
                    <div className={`radial-progress ${getBatteryColor(batteryLevel)}       `}
                         style={{
                             "--value": batteryLevel,
                             "--size": "45px",
                             "--thickness": "5px",
                         } /* as React.CSSProperties */}
                         aria-valuenow={batteryLevel} role="progressbar">
                        <p className="text-black dark:text-white" style={{fontSize: "12px"}}>{batteryLevel}%</p>
                    </div>
                </div>}
        </div>
        </>
    );
};

export default Cube;
