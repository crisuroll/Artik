import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useFollowActions } from '../hooks/useFollow';

function FollowButton({ myUserId, targetUser, onFollowChange }) {
  const [followers, setFollowers] = useState(targetUser.followers || []);
  const { follow, unfollow, loading } = useFollowActions(myUserId, targetUser.id);

  useEffect(() => {
    setFollowers(targetUser.followers || []);
  }, [targetUser.followers]);

  const isFollowing = Array.isArray(followers)
    ? followers.includes(myUserId)
    : false;

  const handlePress = async () => {
    try {
      if (isFollowing) {
        await unfollow();
        const newFollowers = followers.filter(id => id !== myUserId);
        setFollowers(newFollowers);
      } else {
        await follow();
        const newFollowers = [...followers, myUserId];
        setFollowers(newFollowers);
      }

      if (onFollowChange) {
        onFollowChange();
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
    }
  };

  return (
    <TouchableOpacity
      style={{
        marginTop: 8,
        backgroundColor: isFollowing ? '#e1f3f2' : '#70c0b7',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 18,
        alignSelf: 'center',
        borderWidth: isFollowing ? 1 : 0,
        borderColor: '#70c0b7',
        opacity: loading ? 0.7 : 1,
      }}
      onPress={handlePress}
      disabled={loading}
    >
      <Text style={{ color: isFollowing ? '#70c0b7' : '#fff', fontWeight: 'bold' }}>
        {isFollowing ? 'Siguiendo' : 'Seguir'}
      </Text>
    </TouchableOpacity>
  );
}

export default FollowButton;