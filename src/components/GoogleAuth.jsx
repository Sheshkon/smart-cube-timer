import { useEffect } from 'react';

import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import useLocalStorage from 'src/hooks/useLocalStorage.js';

export const GoogleAuth = ({ className = '' }) => {
  const [user, setUser] = useLocalStorage('googleAuthUser', null);

  useEffect(() => {
    console.group('Auth Debug');
    console.log('Initial user from storage:', user);
    console.log('Raw localStorage:', localStorage.getItem('googleAuthUser'));
    console.groupEnd();
  }, []);

  const handleLoginSuccess = (credentialResponse) => {
    try {
      const userObject = jwtDecode(credentialResponse.credential);
      console.log('New login:', {
        user: userObject,
        rawToken: credentialResponse.credential,
        expiry: new Date(userObject.exp * 1000),
      });
      setUser(userObject);
    } catch (error) {
      console.error('Decoding failed:', {
        error,
        token: credentialResponse.credential,
      });
      setUser(null);
    }
  };

  const handleLogout = () => {
    googleLogout();
    console.log('Logging out - clearing:', user);
    setUser(null);
  };

  // Token validation on load
  useEffect(() => {
    if (!user) return;

    const isExpired = user.exp * 1000 < Date.now();
    console.log('Token validation:', {
      now: new Date(),
      expires: new Date(user.exp * 1000),
      isExpired,
    });

    if (isExpired) {
      console.warn('Clearing expired session');
      setUser(null);
    }
  }, [user, setUser]);

  return (
    <div className={className}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <div className="border border-0">
          {user ? (
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleLogout}
                className="relative group shrink-0"
                aria-label="Logout"
              >
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </button>
              <div
                className="text-gray-800 dark:text-gray-200 text-xs truncate min-w-0"
                title={user.name} // Показывает полное имя при наведении
              >
                {user.name}
              </div>
            </div>
          ) : (
            <div style={{ colorScheme: 'light' }} className="flex justify-center">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login failed')}
                type="icon"
                shape="circle"
                theme="filled_blue"
                size="medium"
              />
            </div>
          )}
        </div>
      </GoogleOAuthProvider>
    </div>
  );
};