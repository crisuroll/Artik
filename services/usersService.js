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
    .maybeSingle();
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

export const createProduct = async ({ name, description, price, stock, user_id, product_url }) => {
  const { error } = await supabase.from('products').insert([
    { name, description, price, stock, user_id, product_url }
  ]);
  if (error) throw error;
};

export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('username, email, avatar_url, bio, nickname')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserProfile({ userId, nickname, username, email, avatarUrl, bio }) {
  const { error, data } = await supabase
    .from('users')
    .update({
      nickname,
      username,
      email,
      avatar_url: avatarUrl,
      bio,
    })
    .eq('id', userId)
    .select();
  if (error) throw error;
  return data;
}

export async function addFollower(userId, followerId) {
  if (!userId || !followerId) {
    console.error('addFollower: Missing userId or followerId', { userId, followerId });
    return;
  }

  console.log('addFollower called:', { userId, followerId });

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('followers')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('addFollower: Error fetching user:', fetchError);
    throw fetchError;
  }

  let followers = user.followers || [];
  if (!Array.isArray(followers)) {
    console.warn('addFollower: followers is not an array, resetting to []');
    followers = [];
  }

  if (!followers.includes(followerId)) {
    followers.push(followerId);
  } else {
    console.log('addFollower: followerId already exists in followers');
  }

  console.log('addFollower: Updating followers for userId:', userId, 'new followers:', followers);

  const { error: updateError } = await supabase
    .from('users')
    .update({ followers })
    .eq('id', userId);

  if (updateError) {
    console.error('addFollower: Error updating followers:', updateError);
    throw updateError;
  }

  console.log('addFollower: Successfully updated followers for userId:', userId);
}

export async function removeFollower(userId, followerId) {
  if (!userId || !followerId) return;
  
  console.log('removeFollower called:', { userId, followerId });
  
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('followers')
    .eq('id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching user for removeFollower:', fetchError);
    throw fetchError;
  }

  let followers = user.followers || [];
  followers = followers.filter(id => id !== followerId);

  console.log('Updating followers for userId:', userId, 'new followers:', followers);

  const { error: updateError } = await supabase
    .from('users')
    .update({ followers })
    .eq('id', userId);
    
  if (updateError) {
    console.error('Error updating followers:', updateError);
    throw updateError;
  }
  
  console.log('removeFollower completed successfully');
}

export async function addFollowing(userId, followingId) {
  if (!userId || !followingId) return;
  
  console.log('addFollowing called:', { userId, followingId });
  
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('follows')
    .eq('id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching user for addFollowing:', fetchError);
    throw fetchError;
  }

  let follows = user.follows || [];
  if (!follows.includes(followingId)) {
    follows.push(followingId);
  }

  console.log('Updating follows for userId:', userId, 'new follows:', follows);

  const { error: updateError } = await supabase
    .from('users')
    .update({ follows })
    .eq('id', userId);
    
  if (updateError) {
    console.error('Error updating follows:', updateError);
    throw updateError;
  }
  
  console.log('addFollowing completed successfully');
}

export async function removeFollowing(userId, followingId) {
  if (!userId || !followingId) return;
  
  console.log('removeFollowing called:', { userId, followingId });
  
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('follows')
    .eq('id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching user for removeFollowing:', fetchError);
    throw fetchError;
  }

  let follows = user.follows || [];
  follows = follows.filter(id => id !== followingId);

  console.log('Updating follows for userId:', userId, 'new follows:', follows);

  const { error: updateError } = await supabase
    .from('users')
    .update({ follows })
    .eq('id', userId);
    
  if (updateError) {
    console.error('Error updating follows:', updateError);
    throw updateError;
  }
  
  console.log('removeFollowing completed successfully');
}

export async function searchUsers(term) {
  if (!term) return [];
  const { data, error } = await supabase
    .from('users')
    .select('id, username, nickname, avatar_url')
    .or(`username.ilike.%${term}%,nickname.ilike.%${term}%`);
  if (error) {
    console.error('Error searching users:', error);
    return [];
  }
  return data;
}