import { supabase } from '../supabase/supabaseClient';

export async function interactWithPost(type, userId, postId) {
  const tableMap = {
    likes: 'likes',
    reposts: 'reposts',
    shares: 'shares',
  };

  const table = tableMap[type];
  if (!table) throw new Error('Tipo de interacción no válido');

  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  let data, error;

  if (existing) {
    ({ error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId));

    if (error) throw error;
    return { toggled: 'removed' };
  } else {
    ({ data, error } = await supabase
      .from(table)
      .insert([{ user_id: userId, post_id: postId }])
      .select());

    if (error) throw error;
    return { toggled: 'added', data };
  }
}