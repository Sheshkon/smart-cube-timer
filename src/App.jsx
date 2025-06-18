import React, { useEffect, useState } from 'react';

import { Cuboid } from 'lucide-react';
import { toast } from 'react-toastify';
import Cube from 'src/components/Cube/Cube.jsx';
import CubeControls from 'src/components/CubeControls/CubeControls.jsx';
import Scramble from 'src/components/Scramble/Scramble.jsx';
import StatsDisplay from 'src/components/StatsDisplay/StatsDisplay';
import Timer from 'src/components/Timer/Timer';
import TimesTable from 'src/components/TimesTable/TimesTable';
import { DEFAULT_SESSION_ID } from 'src/db/configDB.js';
import { sessionService } from 'src/db/sessionService.js';
import { useCube } from 'src/hooks/useCube.js';
import { useSettings } from 'src/hooks/useSettings.js';

function App() {
  const { practiceModeEnabled } = useCube();
  const { settings, settingsRef, updateSetting } = useSettings();
  const [sessions, setSessions] = useState([]);
  const [storedTimes, setStoredTimes] = useState([]);
  const [stats, setStats] = useState({});
  const handleSaveTime = async (solve) => {
    console.log('solve', solve);
    const storedTime = await sessionService.addSolveToSession(settings.selectedSessionId, solve);

    const bestTime = await sessionService.getBestSolveBySession(settings.selectedSessionId);

    if (bestTime.id === storedTime.id) {
      toast.info(`Personal Best of the session: ${storedTime.time}`, {
        theme: settingsRef.current.theme,
      });
    }

    setStoredTimes((prevTimes) => [...prevTimes, storedTime]);
  };

  const handleDeleteTime = (id) => {
    sessionService.deleteSolve(id);
    setStoredTimes((prevTimes) => prevTimes.filter((time) => time.id !== id));
  };

  const handleDeleteSession = (sessionId) => {
    sessionService.deleteSession(sessionId);
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== parseInt(sessionId))
    );
  };

  const handleAddSession = async (name) => {
    const newSession = await sessionService.addSession(name);
    setSessions((prevSessions) => [...prevSessions, newSession]);
    updateSetting('selectedSessionId', newSession.id);
  };

  const handleDeleteTimes = (sessionId) => {
    sessionService.deleteSolvesBySession(sessionId);
    setStoredTimes(() => []);
  };

  const handleImport = () => {
    sessionService.getAllSessions().then((sessions) => {
      setSessions(sessions);
      const lastSession = sessions.at(-1);
      updateSetting('selectedSessionId', lastSession?.id || DEFAULT_SESSION_ID);
      sessionService
        .getSolvesBySessionId(lastSession?.id)
        .then((session) => {
          setStoredTimes(session);
        })
        .catch(() => sessionService.getSolvesBySessionId(DEFAULT_SESSION_ID).then(setStoredTimes));
    });
  };

  useEffect(() => {
    sessionService.getSolvesBySessionId(settings.selectedSessionId).then((session) => {
      setStoredTimes(session);
    });
  }, [settings.selectedSessionId]);

  useEffect(() => {
    sessionService.getAllSessions()
      .then(setSessions);

    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    Notification.requestPermission().then((permission) => {
      console.log('Permission:', permission);
    });
  }, []);

  return (
      <main className='flex-grow container mx-auto px-4 py-6 lg:px-64'>
        <div className='flex flex-col space-y-4 md:space-y-6'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center relative overflow-hidden'>
            <Cuboid
              className='absolute -right-16 -top-16 opacity-5 transform rotate-12'
              size={200}
            />
            <CubeControls className='py-4' />
            <div className='flex flex-col md:flex-row items-center w-full'>
              <Cube className='w-full md:w-1/2 flex justify-center md:mb-0' containerId='main' />
              <div className='w-full md:w-1/2 flex flex-col items-center'>
                <Timer onSaveTime={handleSaveTime} className='mb-6' />
                <Scramble className='w-full max-w-md p-4' />
              </div>
            </div>
          </div>
          <>
            {!practiceModeEnabled && (
              <div className='grid grid-cols-1 gap-4 md:gap-6'>
                <StatsDisplay times={storedTimes} stats={stats} setStats={setStats} />
                <TimesTable
                  stats={stats}
                  onImport={handleImport}
                  sessions={sessions}
                  onDeleteTimes={handleDeleteTimes}
                  times={storedTimes}
                  onDeleteTime={handleDeleteTime}
                  onDeleteSession={handleDeleteSession}
                  onAddSession={handleAddSession}
                />
              </div>
            )}
          </>
        </div>
      </main>
  );
}

export default App;
