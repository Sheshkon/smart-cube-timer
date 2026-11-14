import { useContext } from 'react';

import { AppUpdateContext } from 'src/contexts/AppUpdateContext.jsx';

export const useAppUpdate = () => {
  const context = useContext(AppUpdateContext);
  if (!context) {
    throw new Error('useAppUpdate must be used within an AppUpdateProvider');
  }
  return context;
};
