import React, { useState, useEffect } from 'react';

import { Console, Hook, Unhook } from 'console-feed';
import { useConsole } from 'src/contexts/ConsoleContext.jsx';

function CustomConsole() {
  const [logs, setLogs] = useState([]);
  const { showConsole } = useConsole();

  useEffect(() => {
    Hook(
      window.console,
      (log) => setLogs((prevLogs) => [...prevLogs, log]),
      false
    );
    return () => Unhook(window.console);
  }, []);

  return (
    <div>
      {showConsole && (
        <div style={{ backgroundColor: '#242424', height: '12em', overflow: 'auto' }}>
          <Console logs={logs} variant='dark'/>
        </div>
      )}
    </div>
  );
}

export default CustomConsole;