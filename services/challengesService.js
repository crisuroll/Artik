import { supabase } from '../supabase/supabaseClient';
import { useState, useEffect } from 'react';

export async function fetchChallengeById(challengeId) {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchChallengePosts(challengeId) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, image_url, user_id, users(username)')
    .eq('challenge_id', challengeId);
  if (error) throw error;
  return data;
}

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

export async function fetchChallengeWithPosts(challengeId) {
  const { data: challengeData, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();
  if (challengeError) throw challengeError;
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('challenge_id', challengeId);
  if (postsError) throw postsError;

  return { challengeData, postsData };
}

export async function loadChallengePosts(challengeId) {
  const { data: challengeData, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();
  if (challengeError) throw challengeError;

  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('challenge_id', challengeId);
  if (postsError) throw postsError;

  return { challengeData, postsData };
}