import React, {useState} from 'react';
import {Cuboid } from 'lucide-react';
import Scramble from "./components/scramble/Scramble.jsx";
import CubeControls from "./components/cubeControls/CubeControls.jsx";
import Cube from "./components/Cube/Cube.jsx";

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Timer from './components/Timer/Timer';
import StatsDisplay from './components/StatsDisplay/StatsDisplay';
import TimesTable from './components/TimesTable/TimesTable';

import {ThemeProvider} from './contexts/ThemeContext';
import {CubeProvider} from "./contexts/CubeContext.jsx";
import useLocalStorage from './hooks/useLocalStorage';
import {generateScramble} from './utils/timeUtils';

function App() {
    const [scramble, setScramble] = useState(generateScramble());
    const [storedTimes, setStoredTimes] = useLocalStorage('cube-timer-times', []);

    // Generate new scramble
    const handleNewScramble = () => {
        setScramble(generateScramble());
    };

    // Save new time
    const handleSaveTime = (time, originalTime) => {
        console.log(time, originalTime)
        const newTime = {
            id: Date.now(),
            time,
            originalTime,
            date: new Date()
        };

        setStoredTimes(prevTimes => [...prevTimes, newTime]);
        handleNewScramble();
    };

    // Delete time
    const handleDeleteTime = (id) => {
        setStoredTimes(prevTimes => prevTimes.filter(time => time.id !== id));
    };

    const handleDeleteTimes = () => {
        setStoredTimes(prevTimes => []);
    };


    return (
        <>
            <CubeProvider>
                <ThemeProvider>

                    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
                        <Header/>

                        <main className="flex-grow container mx-auto px-4 py-6">
                            <div className="flex flex-col space-y-4 md:space-y-6">
                                {/* Main timer section */}
                                <div

                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center relative overflow-hidden">
                                    {/* Cube background effect */}
                                    <div className="absolute -right-16 -top-16 opacity-5 transform rotate-12">
                                        <Cuboid size={200}/>
                                    </div>

                                    <div>
                                        <CubeControls/>

                                    </div>


                                    <div className="flex flex-col md:flex-row items-center w-full">
                                        <div className="w-full md:w-1/2 flex justify-center md:mb-0">
                                            <div className="cube-container">
                                                <Cube containerId="main"/>

                                            </div>


                                        </div>

                                        <div className="w-full md:w-1/2 flex flex-col items-center">
                                            <Timer onSaveTime={handleSaveTime} className="mb-6"/>
                                            <Scramble
                                                className="w-full max-w-md"
                                            />
                                        </div>
                                    </div>


                                </div>

                                {/* Statistics section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                    <StatsDisplay onDeleteTimes={handleDeleteTimes} times={storedTimes}/>
                                    <TimesTable
                                        times={storedTimes}
                                        onDeleteTime={handleDeleteTime}
                                    />
                                </div>
                            </div>
                        </main>

                        <Footer/>
                    </div>

                </ThemeProvider>
            </CubeProvider>
        </>
    );
}

export default App;