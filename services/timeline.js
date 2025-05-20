import { supabase } from "../supabase/supabaseClient";

export const loadTimeline = async () => {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        image_url,
        created_at,
        user_id,
        users (
          username
        ),
        likes (id),
        reposts (id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const formatted = posts.map(post => ({
      id: post.id,
      title: post.title,
      imageUrl: post.image_url,
      username: post.users?.username || 'usuario',
      userId: post.user_id,
      likes: post.likes?.length || 0,
      reposts: post.reposts?.length || 0,
      shares: Math.floor(Math.random() * 30)
    }));

    return formatted;
  } catch (err) {
    console.error('Error al obtener los posts:', err.message);
    return [];
  }
};
