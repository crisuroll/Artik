import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { loadChallengePosts } from '../services/challengesService';
import { getImageSize } from '../services/getImages';
import Post from '../components/Post';

export default function LoadedChallengePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [challenge, setChallenge] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);

  useEffect(() => {
    const fetchChallengeAndPosts = async () => {
      setLoading(true);
      try {
        const { challengeData, postsData } = await loadChallengePosts(id);
        console.log('Challenge data:', challengeData);
        console.log('Posts data:', postsData);

        setChallenge(challengeData);

        const processedPosts = await Promise.all(
          postsData.map(async (post) => {
            if (post.image_url) {
              try {
                const { width, height } = await getImageSize(post.image_url);
                return { ...post, imageUrl: post.image_url, width, height };
              } catch (error) {
                console.error('Error processing post image:', error);
                return { ...post, imageUrl: post.image_url };
              }
            }
            return post;
          })
        );

        setPosts(processedPosts);
      } catch (error) {
        console.error('Error fetching challenge or posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeAndPosts();
  }, [id]);

  const handlePostClick = (postId) => {
    router.push(`/loaded_post?postId=${postId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#70c0b7" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Challenge not found.</Text>
      </View>
    );
  }

  const renderPost = ({ item }) => (
    <TouchableOpacity onPress={() => handlePostClick(item.id)}>
      <Post
        item={item}
        activeMenuPostId={activeMenuPostId}
        setActiveMenuPostId={setActiveMenuPostId}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: challenge.image_url || 'https://via.placeholder.com/200' }}
        style={styles.challengeImage}
        onError={(error) => console.error('Error loading challenge image:', error.nativeEvent)}
      />
      <Text style={styles.challengeTitle}>{challenge.title}</Text>
      <Text style={styles.challengeDescription}>{challenge.description}</Text>

      <Text style={styles.postsHeader}>Posts:</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  challengeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  postsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
});