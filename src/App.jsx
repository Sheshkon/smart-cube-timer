import React, { useEffect, useMemo, useState } from 'react';

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Cuboid } from 'lucide-react';
import { toast } from 'react-toastify';
import { SolveReconstructionChart } from 'src/components/Chart/SolveChart.jsx';
import Cube from 'src/components/Cube/Cube.jsx';
import CubeControls from 'src/components/CubeControls/CubeControls.jsx';
import Scramble from 'src/components/Scramble/Scramble.jsx';
import SortableItem from 'src/components/SortableItem/SortableItem.jsx';
import StatsDisplay from 'src/components/StatsDisplay/StatsDisplay';
import Timer from 'src/components/Timer/Timer';
import TimesTable from 'src/components/TimesTable/TimesTable';
import { DEFAULT_SESSION_ID } from 'src/db/configDB.js';
import { sessionService } from 'src/db/sessionService.js';
import { useCube } from 'src/hooks/useCube.js';
import useLocalStorage from 'src/hooks/useLocalStorage.js';
import { useSettings } from 'src/hooks/useSettings.js';

function App() {
  const { practiceModeEnabled } = useCube();
  const { settings, settingsRef, updateSetting } = useSettings();
  const [sessions, setSessions] = useState([]);
  const [storedTimes, setStoredTimes] = useState([]);
  const [stats, setStats] = useState({});

  const handleSaveTime = async (solve) => {
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
    sessionService.getAllSessions().then(setSessions);

    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return;
    }

    Notification.requestPermission().then((permission) => {
      console.log('Permission:', permission);
    });
  }, []);

  const [blocks, setBlocks] = useLocalStorage('blocksOrder', [
    { id: 'base' },
    { id: 'stats' },
    { id: 'chart' },
    { id: 'times' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  function shouldShow(block) {
    switch (block.id) {
      case 'base':
        return true;
      case 'stats':
        return !practiceModeEnabled;
      case 'chart':
        return (
          settings.solutionChart &&
          stats?.current?.reconstruction?.steps != null &&
          !practiceModeEnabled
        );
      case 'times':
        return !practiceModeEnabled;
      default:
        return false;
    }
  }

  const visibleBlocks = useMemo(() => {
    const filtered = blocks.filter(shouldShow);
    console.log('visibleBlocks:', filtered);
    return filtered;
  }, [blocks, practiceModeEnabled, settings.solutionChart, stats?.current?.reconstruction?.steps]);

  return (
    <main className='flex-grow container mx-auto px-4 py-4 lg:px-64'>
      <div className='flex flex-col space-y-4 md:space-y-6'>
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (over && active.id !== over.id) {
              setBlocks((prev) => {
                const oldIndex = prev.findIndex((b) => b.id === active.id);
                const newIndex = prev.findIndex((b) => b.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
              });
            }
          }}
        >
          <SortableContext
            items={visibleBlocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {visibleBlocks.map((block) => (
              <SortableItem key={block.id} id={block.id}>
                {block.id === 'base' && (
                  <div className='bg-white dark:bg-gray-800 rounded-b-lg shadow-md p-6 flex flex-col items-center justify-center relative overflow-hidden'>
                    <Cuboid
                      className='absolute -right-16 -top-16 opacity-5 transform rotate-12'
                      size={200}
                    />
                    <CubeControls />
                    <div className='flex flex-col md:flex-row items-center'>
                      <Cube className='flex justify-center items-center' />
                      <div className='w-full flex flex-col items-center'>
                        <Timer onSaveTime={handleSaveTime} className='mb-6' />
                        <Scramble className='w-full max-w-md' />
                      </div>
                    </div>
                  </div>
                )}

                {block.id === 'stats' && (
                  <StatsDisplay times={storedTimes} stats={stats} setStats={setStats} />
                )}
                {block.id === 'chart' && (
                  <SolveReconstructionChart
                    className='flex-col'
                    reconstruction={stats?.current?.reconstruction}
                  />
                )}
                {block.id === 'times' && (
                  <TimesTable
                    stats={stats}
                    onImport={handleImport}
                    sessions={sessions}
                    setSessions={setSessions}
                    onDeleteTimes={handleDeleteTimes}
                    times={storedTimes}
                    onDeleteTime={handleDeleteTime}
                    onDeleteSession={handleDeleteSession}
                    onAddSession={handleAddSession}
                  />
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
}

export default App;
