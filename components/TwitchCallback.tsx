import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import twitchAuthService from '../services/twitchAuthService';

const TwitchCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        setStatus('error');
        return;
      }

      const success = await twitchAuthService.handleCallback(code);
      
      if (success) {
        setStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setStatus('error');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Connecting to Twitch...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <p className="text-white text-lg">Successfully connected!</p>
            <p className="text-zinc-500 text-sm mt-2">Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <p className="text-white text-lg">Failed to connect</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TwitchCallback;
