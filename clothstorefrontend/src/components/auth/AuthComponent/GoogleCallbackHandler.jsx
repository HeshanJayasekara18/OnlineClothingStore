import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GoogleCallbackHandler({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      navigate(`/auth?error=${error}`, { replace: true });
      return;
    }

    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('loggedUser', JSON.stringify(user));
        if (onLogin) onLogin(user);
        navigate('/home', { replace: true });
      } catch {
        navigate('/auth?error=invalid_user_data', { replace: true });
      }
    } else {
      navigate('/auth', { replace: true });
    }
  }, [searchParams, navigate, onLogin]);

  return <div className="min-h-screen flex items-center justify-center">Completing Google login...</div>;
}
