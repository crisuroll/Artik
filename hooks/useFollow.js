import { useState } from 'react';
import { addFollower, addFollowing, removeFollower, removeFollowing } from '../services/usersService';

export function useFollowActions(myUserId, targetUserId) {
  const [loading, setLoading] = useState(false);

  const follow = async () => {
    console.log('useFollow: Starting follow action', { myUserId, targetUserId });
    setLoading(true);
    try {
      console.log('useFollow: Adding follower...');
      await addFollower(targetUserId, myUserId);
      console.log('useFollow: Follower added successfully');
      
      console.log('useFollow: Adding following...');
      await addFollowing(myUserId, targetUserId);
      console.log('useFollow: Following added successfully');
    } catch (error) {
      console.error('useFollow: Error in follow action:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unfollow = async () => {
    console.log('useFollow: Starting unfollow action', { myUserId, targetUserId });
    setLoading(true);
    try {
      console.log('useFollow: Removing follower...');
      await removeFollower(targetUserId, myUserId);
      console.log('useFollow: Follower removed successfully');
      
      console.log('useFollow: Removing following...');
      await removeFollowing(myUserId, targetUserId);
      console.log('useFollow: Following removed successfully');
    } catch (error) {
      console.error('useFollow: Error in unfollow action:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { follow, unfollow, loading };
}