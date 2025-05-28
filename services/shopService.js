import { supabase } from '../supabase/supabaseClient';

export async function fetchCommissionTab(artistId) {
  if (!artistId) {
    console.log("No artistId provided");
    return null;
  }
  const { data, error } = await supabase
    .from("commissions_tab")
    .select("*")
    .eq("user_id", artistId)
    .maybeSingle();
  console.log("fetchCommissionTab result", data, error);
  return data;
}

export async function createCommission({ userId, artistId, type, numCharacters, size, description }) {
  const { data, error } = await supabase
    .from("commissions")
    .insert([{
      user_id: userId,
      artist_id: artistId,
      type,
      num_characters: numCharacters,
      size,
      description,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchArtistUsername(artistId) {
  const { data, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", artistId)
    .single();
  if (error) throw error;
  return data.username;
}

export async function sendCommissionMessage({ userId, artistId, content }) {
  const { error } = await supabase.from("messages").insert([{
    sender_id: userId,
    receiver_id: artistId,
    content,
    is_commission_related: true,
  }]);
  if (error) throw error;
}

export async function fetchUserCommission(userId) {
  const { data, error } = await supabase
    .from('commissions_tab')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function saveUserCommission({
  userId,
  title,
  description,
  imageUrl,
  type_options,
  num_characters_options,
  size_options,
}) {
  const { error } = await supabase
    .from('commissions_tab')
    .upsert([{
      user_id: userId,
      title,
      description,
      comm_url: imageUrl,
      type_options,
      num_characters_options,
      size_options,
    }]);
  if (error) throw error;
}