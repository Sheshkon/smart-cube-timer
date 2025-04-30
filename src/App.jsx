import { Cuboid } from 'lucide-react';
import React from 'react';
import Cube from 'src/components/Cube/Cube.jsx';
import CubeControls from 'src/components/CubeControls/CubeControls.jsx';
import Footer from 'src/components/Footer/Footer';
import Header from 'src/components/Header/Header';
import Scramble from 'src/components/Scramble/Scramble.jsx';
import StatsDisplay from 'src/components/StatsDisplay/StatsDisplay';
import Timer from 'src/components/Timer/Timer';
import TimesTable from 'src/components/TimesTable/TimesTable';
import useLocalStorage from 'src/hooks/useLocalStorage';
import { CubeProvider } from 'src/providers/CubeProvider';
import { SettingsProvider } from 'src/providers/settingsProvider';

function App() {
  const [storedTimes, setStoredTimes] = useLocalStorage('cube-timer-times', []);

  const handleSaveTime = (solve) => {
    const result = {
      id: Date.now(),
      formattedTime: solve?.formattedTime,
      originalTime: solve?.originalTime,
      scramble: solve?.scramble,
      date: new Date(),
      solution: solve.solution,
    };

    setStoredTimes((prevTimes) => [...prevTimes, result]);
  };

  const handleDeleteTime = (id) => {
    setStoredTimes((prevTimes) => prevTimes.filter((time) => time.id !== id));
  };

  const handleDeleteTimes = () => {
    setStoredTimes(() => []);
  };

  return (
    <>
      <SettingsProvider>
        <CubeProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-4 md:space-y-6">
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 opacity-5 transform rotate-12">
                    <Cuboid size={200} />
                  </div>
                  <div className="py-4">
                    <CubeControls />
                  </div>
                  <div className="flex flex-col md:flex-row items-center w-full">
                    <div className="w-full md:w-1/2 flex justify-center md:mb-0">
                      <div className="cube-container">
                        <Cube containerId="main" />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col items-center">
                      <Timer onSaveTime={handleSaveTime} className="mb-6" />
                      <Scramble className="w-full max-w-md" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <StatsDisplay times={storedTimes} />
                  <TimesTable
                    onDeleteTimes={handleDeleteTimes}
                    times={storedTimes}
                    onDeleteTime={handleDeleteTime}
                  />
                </div>
              </div>
            </main>
            <Footer />
          </div>
        </CubeProvider>
      </SettingsProvider>
    </>
  );
}

export default App;
