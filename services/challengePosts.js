import { supabase } from '../supabase/supabaseClient';

export const loadChallengePosts = async (challengeId) => {
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
};