import { useState, useEffect } from 'react';
import { fetchPostById } from '../services/loadPost';
import { fetchCommentsByPostId, addCommentToPost } from '../services/interactions';
import { supabase } from '../supabase/supabaseClient';

export function useLoadPost(postId) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    Promise.all([
      fetchPostById(postId),
      fetchCommentsByPostId(postId)
    ]).then(([postData, commentsData]) => {
      setPost(postData);
      setComments(commentsData);
      setLoading(false);
    });
  }, [postId]);

  const handleAddComment = async (content) => {
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) return;
    const newComment = await addCommentToPost(postId, content, user.id);
    setComments((prev) => [newComment, ...prev]);
  };

  return { post, comments, loading, handleAddComment };
}