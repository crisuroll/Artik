import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';

export function useLoadChallenge(challengeId) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single();

        if (error) {
          console.error('Error loading challenge:', error);
        } else {
          setChallenge(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId]);

  return { challenge, loading };
}