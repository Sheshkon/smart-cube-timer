import { cubeQuaternion } from "../../utils/util.ts";
import { useEffect, useRef } from "react";
import { useCubeState } from "../../contexts/CubeContext";
import '../../style.css'

const Cube = () => {
    const initialized = useRef(false);
    const cubeRef = useRef(null);
    const animationRef = useRef();
    const { twistyPlayerRef } = useCubeState();

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
            // Optionally stop the animation on error
            // cancelAnimationFrame(animationRef.current);
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

    return (
        <div id="cube" ref={cubeRef} />
    );
};

export default Cube;