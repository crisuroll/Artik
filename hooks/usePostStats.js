import { useEffect, useState, useRef } from 'react';
import { getPostInteractions } from '../services/postsService';

export function usePostStats(postId, refresh) {
  const [stats, setStats] = useState({ likes: 0, reposts: 0 });
  const lastStats = useRef(stats);

  useEffect(() => {
    let mounted = true;
    setTimeout(async () => {
      const newStats = await getPostInteractions(postId);
      if (mounted && newStats) {
        setStats(newStats);
        lastStats.current = newStats;
      }
    }, 0);
    return () => { mounted = false; };
  }, [postId, refresh]);

  return stats.likes === 0 && stats.reposts === 0 && lastStats.current
    ? lastStats.current
    : stats;
}