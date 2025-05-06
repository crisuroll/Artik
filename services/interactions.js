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

export const fetchPostStats = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        likes:likes(id),
        reposts:reposts(id)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post stats:', error);
      return { likes: 0, reposts: 0 };
    }

    console.log('Fetched post stats:', data);
    return {
      likes: data?.likes?.length || 0,
      reposts: data?.reposts?.length || 0,
    };
  } catch (err) {
    console.error('Error fetching post stats:', err);
    return { likes: 0, reposts: 0 };
  }
};

export const handleInteraction = async (type, userId, postId, setState) => {
  try {
    const result = await interactWithPost(type, userId, postId);
    setState((prevState) =>
      result.toggled === 'added' ? prevState + 1 : Math.max(prevState - 1, 0)
    );
  } catch (error) {
    console.error(`Error al interactuar con el post (${type}):`, error);
  }
};