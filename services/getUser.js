import { supabase } from "../supabase/supabaseClient";

export const loadUser = async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) return null;
    
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username, email, avatar_url, bio, created_at")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    return {
      userId,
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      bio: userData.bio,
      createdAt: userData.created_at,
    };
  } catch (err) {
    console.error("Error al obtener el usuario:", err.message);
    return null;
  }
};
