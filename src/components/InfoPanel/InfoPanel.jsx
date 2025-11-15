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
        const panelStyle =
          panel.type === 'success'
            ? 'bg-green-100 text-green-900 border-green-300'
            : 'bg-yellow-100 text-yellow-900 border-yellow-300';
        return (
          <div
            key={panel.id}
            className={`${panelStyle} w-full min-h-[200px] p-3 rounded border relative mb-3`}
          >
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
              className='mt-3 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300'
            >
              Don&#39;t show again
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default InfoPanel;
