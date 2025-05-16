import { supabase } from "../supabase/supabaseClient";

export const loadUserReposts = async (userId) => {
  try {
    const { data: reposts, error } = await supabase
      .from("reposts")
      .select(`
        id,
        created_at,
        posts (
          id,
          title,
          image_url,
          likes (id),
          reposts (id)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedReposts = reposts
      .filter(repost => repost.posts)
      .map(({ posts }) => ({
        id: posts.id,
        title: posts.title,
        imageUrl: posts.image_url,
        likes: posts.likes?.length || 0,
        reposts: posts.reposts?.length || 0,
      }));

    return formattedReposts;
  } catch (err) {
    console.error("Error al cargar los reposts del usuario:", err.message);
    return [];
  }
};