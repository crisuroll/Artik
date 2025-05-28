import { supabase } from '../supabase/supabaseClient';

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session?.user || null;
}

export async function getUserAvatar(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data?.avatar_url || null;
}