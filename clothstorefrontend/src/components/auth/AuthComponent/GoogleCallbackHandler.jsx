import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GoogleCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');
      
      if (error) {
        console.error('Google auth error:', error);
        navigate('/login?error=auth_failed');
        return;
      }
      
      if (userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem('loggedUser', JSON.stringify(user));
          navigate('/home', { replace: true });
        } catch (err) {
          console.error('Error handling Google callback:', err);
          navigate('/login?error=invalid_user_data');
        }
      } else {
        // No user data, redirect to login
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google login...</p>
      </div>
    </div>
  );
}