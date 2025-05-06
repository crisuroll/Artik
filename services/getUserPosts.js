import { supabase } from "../supabase/supabaseClient";

export const loadUserPosts = async (userId) => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        image_url,
        created_at,
        likes (id),
        reposts (id)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      imageUrl: post.image_url,
      likes: post.likes?.length || 0,
      reposts: post.reposts?.length || 0,
    }));

    return formattedPosts;
  } catch (err) {
    console.error("Error al cargar los posts del usuario:", err.message);
    return [];
  }
};