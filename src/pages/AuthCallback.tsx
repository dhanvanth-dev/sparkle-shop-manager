
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideLoader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the session from the URL
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        navigate('/auth');
        return;
      }
      
      if (data.session) {
        // Authentication successful
        navigate('/');
      } else {
        // No session found
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LucideLoader2 className="h-10 w-10 animate-spin text-gold mb-4" />
      <h2 className="text-xl font-serif">Processing authentication...</h2>
    </div>
  );
};

export default AuthCallback;
