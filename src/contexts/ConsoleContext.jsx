import { createContext, useState, useContext } from 'react';

const ConsoleContext = createContext();

export function ConsoleProvider({ children }) {
  const [showConsole, setShowConsole] = useState(false);
  return (
    <ConsoleContext.Provider value={{ showConsole, setShowConsole }}>
      {children}
    </ConsoleContext.Provider>
  );
}

export function useConsole() {
  return useContext(ConsoleContext);
}