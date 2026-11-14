import React, { useEffect, useState } from 'react';

import { notifications } from 'src/components/InfoPanel/NotificationConfig.jsx';
import useLocalStorage from 'src/hooks/useLocalStorage.js';

const InfoPanel = ({ wrapperClassName = '' }) => {
  const [panels, setPanels] = useState([]);
  const [closedPanels, setClosedPanels] = useLocalStorage('notifications', []);

  const handleCloseTemporary = (id) => {
    setPanels((prev) => prev.filter((panel) => panel.id !== id));
  };

  const handleCloseForever = (id) => {
    setClosedPanels([...closedPanels, id]);
    handleCloseTemporary(id);
  };

  console.log('Current User Agent:', navigator.userAgent);

  useEffect(() => {
    const visibleMessages = notifications.filter((msg) => !closedPanels.includes(msg.id));

    if (visibleMessages.length > 0) {
      setPanels(visibleMessages);
    }
  }, [closedPanels]);

  if (panels.length === 0) return null;

  return (
    <div className={wrapperClassName}>
      {panels.map((panel) => {
        return (
          <div
            key={panel.id}
            className='app-card w-[calc(100%-35px)] min-h-[100px] rounded-lg relative text-sm mt-1 overflow-hidden'
          >
            <div className='sortable-handle-bar pointer-events-none h-6' aria-hidden />
            <div className='relative p-3'>
              <button
                onClick={() => handleCloseTemporary(panel.id)}
                aria-label='Close panel'
                className='absolute top-2 right-2 font-bold text-lg hover:opacity-70'
              >
                ×
              </button>

              {panel.content}

              <button
                onClick={() => handleCloseForever(panel.id)}
                className='app-btn mt-3 px-2 py-1 rounded transition-colors'
              >
                Don&#39;t show again
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InfoPanel;
