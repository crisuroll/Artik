import { supabase } from "../supabase/supabaseClient";

export const loadUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (data?.user) {
      return data.user.user_metadata.username || data.user.email;
    }
    return null;
  } catch (err) {
    console.error('Error al obtener el usuario:', err.message);
    return null;
  }
};