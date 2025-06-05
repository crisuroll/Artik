import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLoadedChallenge } from '../hooks/useChallenges';
import Post from '../components/Post';
import { supabase } from '../supabase/supabaseClient';
import BackButton from '../components/BackButton';

export default function LoadedChallengePage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [creator, setCreator] = useState(null);

  const { challenge, posts, loading, fetchChallengeAndPosts } = useLoadedChallenge(id);

  useEffect(() => {
    fetchChallengeAndPosts();
  }, [fetchChallengeAndPosts]);

  useEffect(() => {
    const fetchCreator = async () => {
      if (challenge?.user_id) {
        const { data, error } = await supabase
          .from('users')
          .select('username, nickname, avatar_url')
          .eq('id', challenge.user_id)
          .single();
        if (!error) setCreator(data);
      }
    };
    fetchCreator();
  }, [challenge?.user_id]);

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

  const imageAspectRatio =
    challenge.width && challenge.height
      ? challenge.width / challenge.height
      : 1.5;

  return (
    <View style={styles.container}>
      <BackButton fallback="/challenges" />
      <Image
        source={{ uri: challenge.image_url || 'https://via.placeholder.com/200' }}
        style={[
          styles.challengeImage,
          { aspectRatio: imageAspectRatio, height: undefined }
        ]}
        onError={(error) => console.error('Error loading challenge image:', error.nativeEvent)}
      />
      <View style={styles.creatorRow}>
        {creator?.avatar_url && (
          <Image
            source={{ uri: creator.avatar_url }}
            style={styles.creatorAvatar}
          />
        )}
        <Text style={styles.creatorUsername}>
          {creator?.username ? `${creator.nickname} @${creator.username}` : ''}
        </Text>
      </View>
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
    fontFamily: 'Nunito',
  },
  challengeImage: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  creatorUsername: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Nunito',
  },
  challengeDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    fontFamily: 'Nunito',
  },
  postsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Nunito',
  },
  listContent: {
    paddingBottom: 16,
  },
});