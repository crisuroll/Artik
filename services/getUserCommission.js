import { supabase } from '../supabase/supabaseClient';

export async function loadUserCommission(userId) {
  const { data, error } = await supabase
    .from('commissions_tab')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code === 'PGRST116') {
    return null;
  }
  if (error) throw error;
  return data;
}

export async function upsertUserCommission({ userId, title, description, imageUrl }) {
  const { data, error } = await supabase
    .from('commissions_tab')
    .upsert([{ user_id: userId, title, description, comm_url: imageUrl }], { onConflict: ['user_id'] })
    .select()
    .single();
  if (error) throw error;
  return data;
}