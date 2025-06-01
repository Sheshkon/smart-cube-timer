import { useEffect, useRef, useState } from 'react';

import { useGoogleAuth } from 'src/contexts/GoogleAuthContext.jsx';

export function UserProfile({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { handleLogout } = useGoogleAuth();

  const logout = () => {
    handleLogout();
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 min-w-0 focus:outline-none"
      >
        <img
          src={user.picture}
          alt="Profile"
          className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500"
        />
        <div
          className="text-gray-800 dark:text-gray-200 text-xs truncate min-w-0"
          title={user.name}
        >
          {user.name}
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
          <div
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            {user.email}
          </div>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
