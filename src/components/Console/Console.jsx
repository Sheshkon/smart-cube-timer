import React, { useState, useEffect } from 'react';

import { Console, Hook, Unhook } from 'console-feed';
import {TerminalSquare}  from 'lucide-react';

function CustomConsole({showConsole = false}) {
  const [logs, setLogs] = useState([]);

  // Hook into console
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