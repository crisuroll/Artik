import { useEffect, useState } from 'react';
import { fetchPostDetails, fetchPostComments, addComment } from '../services/loadPost';
import { supabase } from '../supabase/supabaseClient';

export const useLoadPost = (postId) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPostData = async () => {
      try {
        const postDetails = await fetchPostDetails(postId);
        setPost(postDetails);

        const postComments = await fetchPostComments(postId);
        setComments(postComments);
      } catch (error) {
        console.error('Error loading post data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPostData();
  }, [postId]);

  const handleAddComment = async (newComment) => {
    if (!newComment.trim()) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to comment.');
        return;
      }

      const comment = await addComment(postId, newComment, user.id);
      setComments((prev) => [...prev, comment]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return { post, comments, loading, handleAddComment };
};