import { supabase } from '../supabase/supabaseClient';

export const fetchPostDetails = async (postId) => {
  const { data: postDetails, error: postError } = await supabase
    .from('posts')
    .select(`
      id, title, description, image_url, created_at,
      category_id,
      style_id,
      user_id,
      users:user_id (username, avatar_url),
      categories:category_id (name),
      styles:style_id (name)
    `)
    .eq('id', postId)
    .single();

  if (postError) throw postError;

  return postDetails;
};

export const fetchPostComments = async (postId) => {
  const { data: postComments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id, content, created_at,
      users (username)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) throw commentsError;

  return postComments;
};

export const addComment = async (postId, content, userId) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ content, post_id: postId, user_id: userId }])
    .select('id, content, created_at, users (username)')
    .single();

  if (error) throw error;

  return data;
};