import { useState, useEffect } from 'react';
import { fetchPostStats, handleInteraction } from '../services/interactions';

export function usePostInteractions(postId, userId) {
  const [likes, setLikes] = useState(0);
  const [reposts, setReposts] = useState(0);
  const [shares, setShares] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const stats = await fetchPostStats(postId);
      setLikes(stats.likes);
      setReposts(stats.reposts);
      setShares(stats.shares ?? 0);
    };
    if (postId) loadStats();
  }, [postId]);

  const like = () => handleInteraction('likes', userId, postId, setLikes);
  const repost = () => handleInteraction('reposts', userId, postId, setReposts);
  const share = () => handleInteraction('shares', userId, postId, setShares);

  return { likes, reposts, shares, like, repost, share };
}