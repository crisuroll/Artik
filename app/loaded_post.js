import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLoadPost } from '../hooks/usePosts';
import { loadUser } from '../services/usersService';
import Svg, { Path } from 'react-native-svg';
import { getPostInteractions, interactWithPost } from '../services/postsService';
import PostInteractions from '../components/PostInteractions';

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const { post, comments, loading, handleAddComment } = useLoadPost(postId);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState(null);
  const [likes, setLikes] = useState(0);
  const [reposts, setReposts] = useState(0);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      const user = await loadUser();
      setUserId(user?.userId || null);
      if (postId) {
        const stats = await getPostInteractions(postId);
        setLikes(stats.likes);
        setReposts(stats.reposts);
      }
    };
    fetchUserAndStats();
  }, [postId, post]);

  const handleInteraction = async (type) => {
    if (!userId) return;
    try {
      await interactWithPost(type, userId, postId);
      const stats = await getPostInteractions(postId);
      setLikes(stats.likes);
      setReposts(stats.reposts);
    } catch (e) {
      // Manejo de error opcional
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>▶ Back</Text>
        </TouchableOpacity>
        <Text style={styles.dots}>●●●</Text>
        <View style={styles.userRow}>
          <Text style={styles.username}>{post.users?.username || 'Anonymous'}</Text>
          {post.users?.avatar_url ? (
            <Image source={{ uri: post.users.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
        </View>
      </View>

      <Image source={{ uri: post.image_url }} style={styles.postImage} />

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{post.title}</Text>
        </View>
                <PostInteractions
  likes={likes}
  reposts={reposts}
  postId={postId}
  handleInteraction={handleInteraction}
  style={styles.actionButtons}
/>
        <Text style={styles.description}>{post.description}</Text>

        <View style={styles.detailsBox}>
          <Text style={styles.detailItem}>Style: {post.styles?.name || 'N/A'}</Text>
          <Text style={styles.detailItem}>Category: {post.categories?.name || 'N/A'}</Text>
          <Text style={styles.detailItem}>Tags: {post.tags || 'N/A'}</Text>
        </View>
      </View>

      <ScrollView style={styles.commentSection}>
        <Text style={styles.commentsTitle}>Comment Section</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                {item.users?.avatar_url ? (
                  <Image source={{ uri: item.users.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar} />
                )}
                <Text style={[styles.commentAuthor, { marginLeft: 8 }]}>
                  {item.users?.username || 'Anonymous'}
                </Text>
              </View>
              <Text style={styles.commentContent}>{item.content}</Text>
            </View>
          )}
        />
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Add a comment..."
          style={styles.commentInput}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity
          onPress={async () => {
            if (newComment.trim().length === 0) return;
            await handleAddComment(newComment);
            setNewComment('');
          }}
        >
          <Text style={styles.sendText}>send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  backText: {
    color: '#333',
  },
  dots: {
    color: '#00b3b3',
    fontSize: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d3d3d3',
  },
  postImage: {
    height: 200,
    backgroundColor: '#d3d3d3',
    margin: 15,
    borderRadius: 5,
  },
  infoContainer: {
    paddingHorizontal: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  description: {
    marginTop: 5,
    color: '#333',
  },
  detailsBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  detailItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentSection: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  commentsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  comment: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    padding: 10,
    paddingBottom: 100
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  sendText: {
    color: '#00b3b3',
    marginLeft: 10,
    fontWeight: 'bold',
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
});
