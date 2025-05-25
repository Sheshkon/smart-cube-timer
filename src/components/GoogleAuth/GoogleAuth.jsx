import { GoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from 'src/contexts/GoogleAuthContext.jsx';

export const GoogleAuth = ({ className = '' }) => {
  const {
    user,
    isLoading,
    error,
    handleLogin
  } = useGoogleAuth();

  return (
    <div className={className}>
        <div className="border border-0">
          {error && (
            <div className="text-red-500 text-sm mb-2">
              {error}
            </div>
          )}

          {!user && (
            <div style={{ colorScheme: 'light' }} className="flex justify-center">
              <GoogleLogin
                onSuccess={handleLogin}
                onError={() => console.log('Login failed')}
                type="icon"
                shape="circle"
                theme="filled_blue"
                size="medium"
                scope="openid email profile https://www.googleapis.com/auth/drive.file"
                ux_mode="popup"
              />
              {isLoading && (
                <div className="ml-2">
                  {/* Loading spinner or other indicator */}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
};