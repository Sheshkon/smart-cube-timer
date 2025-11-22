import React, { useState } from 'react';

import { Settings } from 'lucide-react';
import { SettingsModal } from 'src/components/Modals/SettingsModal.jsx';

const SettingsControl = ({className}) => {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleSettingsModalOpen = () => setSettingsModalOpen(!settingsModalOpen);

  return (
    <>
      <button
        onClick={handleSettingsModalOpen}
        className={className}
        title='Settings'
      >
        <Settings />
      </button>

      <SettingsModal isOpen={settingsModalOpen} onClose={handleSettingsModalOpen} />
    </>
  );
};

export default SettingsControl;
