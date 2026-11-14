import React, { useEffect, useState } from 'react';

import { History } from 'lucide-react';
import FullScreenModal from 'src/components/Modals/FullScreenModal.jsx';
import {
  cubeHistoryService,
  formatDateTime,
  formatDuration,
} from 'src/db/cubeHistoryService.js';

const endedByLabel = {
  user: 'Disconnected',
  lost: 'Lost',
  unload: 'Closed tab',
  interrupted: 'Interrupted',
};

const CubeHistoryModal = ({ isOpen, onClose }) => {
  const [cubes, setCubes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [confirmClear, setConfirmClear] = useState(false);

  const loadHistory = async () => {
    const [cubeSummaries, recentSessions] = await Promise.all([
      cubeHistoryService.getCubeSummaries(),
      cubeHistoryService.getRecentSessions(),
    ]);
    setCubes(cubeSummaries);
    setSessions(recentSessions);
  };

  useEffect(() => {
    if (!isOpen) {
      setConfirmClear(false);
      return undefined;
    }

    loadHistory();
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const reload = setInterval(loadHistory, 4000);
    return () => {
      clearInterval(tick);
      clearInterval(reload);
    };
  }, [isOpen]);

  const handleClear = async () => {
    await cubeHistoryService.deleteAll();
    setConfirmClear(false);
    await loadHistory();
  };

  if (!isOpen) return null;

  return (
    <FullScreenModal
      onClose={onClose}
      title={(
        <>
          <History size={22} />
          Cube history
        </>
      )}
      headerRight={sessions.length > 0 ? (
        <button
          type='button'
          className='app-btn rounded-full px-3 py-1.5 text-sm transition-colors'
          onClick={() => setConfirmClear(true)}
        >
          Clear history
        </button>
      ) : null}
    >
      <div>
        <p className='text-sm opacity-70 mb-5'>
          Cubes you have connected over Bluetooth, with session start, end and duration.
        </p>

        {confirmClear && (
          <div className='app-card rounded-lg p-4 mb-5'>
            <p className='mb-3'>Delete all cube connection history on this device?</p>
            <div className='flex gap-2'>
              <button type='button' className='app-btn-accent rounded-full px-3 py-1.5' onClick={handleClear}>
                Delete
              </button>
              <button
                type='button'
                className='app-btn rounded-full px-3 py-1.5'
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {cubes.length === 0 ? (
          <div className='app-card rounded-lg p-6 text-center opacity-70'>
            No cubes yet. Connect a smart cube to start recording sessions.
          </div>
        ) : (
          <>
            <h2 className='text-lg font-semibold mb-3'>Cubes</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
              {cubes.map((cube) => (
                <div key={cube.deviceMAC} className='app-card rounded-lg p-4'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <h3 className='font-bold'>{cube.deviceName || cube.hardwareName || 'Smart cube'}</h3>
                      <p className='text-sm opacity-70 selectable-text'>{cube.deviceMAC}</p>
                    </div>
                    {cube.live && (
                      <span className='app-btn-accent rounded-full px-2 py-0.5 text-xs'>Live</span>
                    )}
                  </div>
                  <dl className='mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm'>
                    <dt className='opacity-70'>Hardware</dt>
                    <dd>{cube.hardwareName || '—'}</dd>
                    <dt className='opacity-70'>Sessions</dt>
                    <dd>{cube.sessionCount}</dd>
                    <dt className='opacity-70'>Total time</dt>
                    <dd>{formatDuration(cube.totalDurationMs, { ongoing: cube.live })}</dd>
                    <dt className='opacity-70'>Last seen</dt>
                    <dd>{formatDateTime(cube.lastConnectedAt)}</dd>
                  </dl>
                </div>
              ))}
            </div>

            <h2 className='text-lg font-semibold mb-3'>Sessions</h2>
            <div className='app-card rounded-lg overflow-x-auto'>
              <table className='table w-full text-sm'>
                <thead>
                  <tr>
                    <th>Cube</th>
                    <th>Duration</th>
                    <th>Connected</th>
                    <th>Disconnected</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    const live = !session.disconnectedAt;
                    const duration = cubeHistoryService.sessionDurationMs(session, now);
                    return (
                      <tr key={session.id}>
                        <td>
                          <div className='font-medium'>{session.deviceName || session.hardwareName || 'Smart cube'}</div>
                          <div className='text-xs opacity-70 selectable-text'>{session.deviceMAC}</div>
                        </td>
                        <td>{formatDuration(duration, { ongoing: live })}</td>
                        <td>{formatDateTime(session.connectedAt)}</td>
                        <td>{live ? '—' : formatDateTime(session.disconnectedAt)}</td>
                        <td>
                          {live ? 'Connected' : endedByLabel[session.endedBy] || 'Ended'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </FullScreenModal>
  );
};

export default CubeHistoryModal;
