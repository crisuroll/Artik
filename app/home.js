import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { interactWithPost, getPostInteractions } from '../services/postsService';
import Post from '../components/Post';
import CreatePostButton from '../components/CreatePostButton';
import { useHomePosts } from '../hooks/usePosts';

export default function Home() {
  const router = useRouter();
  const {
    username,
    userId,
    posts,
    setPosts,
    activeMenuPostId,
    setActiveMenuPostId,
    loadUserAndPosts,
  } = useHomePosts();

  useEffect(() => {
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