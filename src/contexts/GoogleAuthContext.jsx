import { createContext, useContext, useEffect } from 'react';

import { jwtDecode } from 'jwt-decode';
import useLocalStorage from 'src/hooks/useLocalStorage.js';

const GoogleAuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [authState, setAuthState] = useLocalStorage('googleAuth', {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    expiresAt: null,
  });

  const [driveState, setDriveState] = useLocalStorage('drive', {
    accessToken: null,
    expiresAt: null,
  });

  useEffect(() => {
    const checkTokenValidity = () => {
      if (authState.expiresAt && new Date(authState.expiresAt) < new Date()) {
        console.log(true);
        handleLogout();
      }
    };

    checkTokenValidity();
    const interval = setInterval(checkTokenValidity, 45000);
    return () => clearInterval(interval);
  }, [authState.expiresAt]);


  const getDriveAccessToken = async () => new Promise((resolve) => {
    if (!window.google?.accounts?.oauth2) {
      console.error('Google client library not loaded');
      resolve(null);
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
      prompt: 'none',
      callback: (tokenResponse) => {
        console.log('refresh', tokenResponse);
        if (tokenResponse?.access_token) {
          const driveTokenExpiresAt = new Date(Date.now() + 3600000);
          console.log('token: ', tokenResponse);
          setDriveState(prev => ({
            ...prev,
            accessToken: tokenResponse.access_token,
            expiresAt: driveTokenExpiresAt,
          }));
          resolve(tokenResponse.access_token);
        } else {
          resolve(null);
        }
      },
      error_callback: (error) => {
        handleLogout();
        console.error('Drive access error:', error);
        resolve(null);
      },
    });
    client.requestAccessToken();
  });


  const handleLogin = async (credentialResponse) => {
    console.log('credentials: ', credentialResponse);
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const userObject = jwtDecode(credentialResponse.credential);
      const expiresAt = new Date(userObject.exp * 1000);

      console.log('parsed ', userObject);

      // Store the initial auth state
      setAuthState(prev => ({
        ...prev,
        user: userObject,
        token: credentialResponse.credential,
        expiresAt,
        isLoading: false,
      }));

      return await getDriveAccessToken();

    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed. Please try again.',
      }));
    }
  };

  const handleLogout = () => {
    if (authState.token && window.google?.accounts?.id) {

      window.google.accounts.id.ref;
      try {
        window.google.accounts.id.revoke(authState.token, () => {
          console.log('Google token revoked');
        });
      } catch (e) {
        console.error('Error revoking token:', e);
      }
    }

    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      expiresAt: null,
    });
  };

  return (
    <GoogleAuthContext.Provider value={{
      user: authState.user,
      token: authState.token,
      driveState,
      setDriveState,
      isLoading: authState.isLoading,
      error: authState.error,
      isAuthenticated: !!authState.user,
      setAuthState,
      handleLogin,
      handleLogout,
    }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);