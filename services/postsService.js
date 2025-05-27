import { supabase } from '../supabase/supabaseClient';

export async function interactWithPost(type, userId, postId) {
  const tableMap = {
    likes: 'likes',
    reposts: 'reposts',
    shares: 'shares',
  };

  const table = tableMap[type];
  if (!table) throw new Error('Tipo de interacción no válido');

  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  let data, error;

  if (existing) {
    ({ error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId));

    if (error) throw error;
    return { toggled: 'removed' };
  } else {
    ({ data, error } = await supabase
      .from(table)
      .insert([{ user_id: userId, post_id: postId }])
      .select());

    if (error) throw error;
    return { toggled: 'added', data };
  }
}

export const fetchPostStats = async (postId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        likes:likes(id),
        reposts:reposts(id)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post stats:', error);
      return { likes: 0, reposts: 0 };
    }

    console.log('Fetched post stats:', data);
    return {
      likes: data?.likes?.length || 0,
      reposts: data?.reposts?.length || 0,
    };
  } catch (err) {
    console.error('Error fetching post stats:', err);
    return { likes: 0, reposts: 0 };
  }
};

export const handleInteraction = async (type, userId, postId, setState) => {
  try {
    const result = await interactWithPost(type, userId, postId);
    setState((prevState) =>
      result.toggled === 'added' ? prevState + 1 : Math.max(prevState - 1, 0)
    );
  } catch (error) {
    console.error(`Error al interactuar con el post (${type}):`, error);
  }
};

export async function fetchCommentsByPostId(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, users(id, username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addCommentToPost(postId, content, userId) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id: postId, content, user_id: userId }])
    .select('id, content, created_at, users(id, username, avatar_url)')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, users(id, username, avatar_url), styles(name), categories(name)')
    .eq('id', postId)
    .single();

  if (error) throw error;
  return data;
}

export const fetchPostDetails = async (postId) => {
  const { data: postDetails, error: postError } = await supabase
    .from('posts')
    .select(`
      id, title, description, image_url, created_at,
      category_id,
      style_id,
      user_id,
      users:user_id (username, avatar_url),
      categories:category_id (name),
      styles:style_id (name)
    `)
    .eq('id', postId)
    .single();

  if (postError) throw postError;

  return postDetails;
};

export const fetchPostComments = async (postId) => {
  const { data: postComments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id, content, created_at,
      users (username)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) throw commentsError;

  return postComments;
};

export const addComment = async (postId, content, userId) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ content, post_id: postId, user_id: userId }])
    .select('id, content, created_at, users (username)')
    .single();

  if (error) throw error;

  return data;
};

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
