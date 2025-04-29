import { supabase } from '../supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function likePost(userId, postId) {
  const { data, error } = await supabase
    .from('likes')
    .insert([{ user_id: userId, post_id: postId }])
    .select();

  if (error) throw error;
  return data;
}

export async function repostPost(userId, postId) {
  const { data, error } = await supabase
    .from('reposts')
    .insert([{ user_id: userId, post_id: postId }])
    .select();

  if (error) throw error;
  return data;
}

export async function commentPost(userId, postId, content) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ id: uuidv4(), user_id: userId, post_id: postId, content }])
    .select();

  if (error) throw error;
  return data;
}
