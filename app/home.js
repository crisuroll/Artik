import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { loadTimeline } from '../services/postsService';
import { loadUser } from '../services/usersService';
import { getImageSize } from '../services/getImages';
import { interactWithPost } from '../services/postsService';
import Post from '../components/Post';
import CreatePostButton from '../components/CreatePostButton';

export default function Home() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserAndPosts = async () => {
      const user = await loadUser();
      if (user?.username) setUsername(user.username);
      if (user?.userId) setUserId(user.userId);
      const fetchedPosts = await loadTimeline();
      const getPosts = await Promise.all(
        fetchedPosts.map(async (post) => {
          if (post.imageUrl) {
            try {
              const { width, height } = await getImageSize(post.imageUrl);
              return { ...post, width, height };
            } catch (error) {
              return post;
            }
          }
          return post;
        })
      );
      setPosts(getPosts);
    };
    loadUserAndPosts();
  }, []);

  const handleInteraction = async (type, postId) => {
    try {
      if (!userId) return;
      const result = await interactWithPost(type, userId, postId);
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const currentValue = post[type] || 0;
            return {
              ...post,
              [type]: result.toggled === 'added' ? currentValue + 1 : Math.max(currentValue - 1, 0),
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error al interactuar:', error);
    }
  };

  const handleOption = (option) => {
    Alert.alert(option);
    setActiveMenuPostId(null);
  };

  const handlePostClick = (postId) => {
    router.push(`/loaded_post?postId=${postId}`);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity onPress={() => handlePostClick(item.id)}>
      <Post
        item={item}
        activeMenuPostId={activeMenuPostId}
        setActiveMenuPostId={setActiveMenuPostId}
        handleInteraction={handleInteraction}
        handleOption={handleOption}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <CreatePostButton onPress={() => router.push('/create-post')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
});