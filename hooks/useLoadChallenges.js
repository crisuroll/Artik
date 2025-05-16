import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';

export function useLoadChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading challenges:', error);
        } else {
          setChallenges(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  return { challenges, loading };
}