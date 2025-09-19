import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseHashTokens, storeTokens, decodeJwtPayload } from '../auth/cognito';

export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    const tokens = parseHashTokens(window.location.hash);
    if (tokens) {
      storeTokens(tokens);
      const id = decodeJwtPayload<any>(tokens.id_token);
      if (id?.email) localStorage.setItem('userEmail', id.email);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center">
      <div className="text-center text-muted">Signing you in…</div>
    </div>
  );
}
