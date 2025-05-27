import { supabase } from "../supabase/supabaseClient";

export const loadUser = async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;

    const userId = authData?.user?.id;
    if (!userId) return null;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username, email, avatar_url, nickname, bio, created_at")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    return {
      userId,
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      nickname: userData.nickname,
      bio: userData.bio,
      createdAt: userData.created_at,
    };
  } catch (err) {
    console.error("Error al obtener el usuario autenticado:", err.message);
    return null;
  }
};

export const loadUserById = async (userId) => {
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("username, email, avatar_url, nickname, bio, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return {
      userId,
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      nickname: userData.nickname,
      bio: userData.bio,
      createdAt: userData.created_at,
    };
  } catch (err) {
    console.error("Error al cargar el usuario por ID:", err.message);
    return null;
  }
};

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

export const loadUserProducts = async (userId) => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        stock,
        product_url,
        created_at
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return products || [];
  } catch (err) {
    console.error("Error al cargar los productos del usuario:", err.message);
    return [];
  }
};

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