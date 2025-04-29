import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { loadTimeline } from '../services/timeline';
import { loadUser } from '../services/getUser';
import { getImageSize } from '../services/getImages';
import { likePost, repostPost, commentPost } from '../services/interactions';

export default function Home() {
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadUserAndPosts = async () => {
      const username = await loadUser();
      if (username) setUsername(username);
  
      const fetchedPosts = await loadTimeline();
      const postsWithSizes = await Promise.all(
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
  
      setPosts(postsWithSizes);
    };
  
    loadUserAndPosts();
  }, []);  

  const handleInteraction = async (type, postId) => {
    try {
      if (type === 'likes') {
        await likePost(userId, postId);
      } else if (type === 'reposts') {
        await repostPost(userId, postId);
      } else if (type === 'comments') {
        await commentPost(userId, postId, 'Default comment');
      }
  
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, [type]: post[type] + 1 };
        }
        return post;
      }));
  
    } catch (error) {
      console.error(error);
    }
  };  

  const [menuVisible, setMenuVisible] = useState(false);

  const handleOption = (option) => {
    Alert.alert(option);
    setMenuVisible(false);
  };

  const renderPost = ({ item }) => {
    const imageRatio = item.width && item.height ? item.width / item.height : 1.5;
  
    return (
      <View id='post-container'>
        <View id='post-content' style={styles.postContainer}>
  
          <View style={styles.imageWrapper}>
            <Image
              id='post-image'
              source={{ uri: item.imageUrl }}
              style={[styles.postImage, { aspectRatio: imageRatio }]}
            />
  
            <TouchableOpacity id='menu-button' style={styles.menuButton} onPress={() => setMenuVisible(!menuVisible)}>
              <Text style={styles.menuText}>⋮</Text>
            </TouchableOpacity>
  
            {menuVisible && (
              <View id='menu-container' style={styles.menuContainer}>
                <TouchableOpacity onPress={() => handleOption('Denunciar')}>
                  <Text style={styles.menuItem}>Denunciar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOption('Guardar')}>
                  <Text style={styles.menuItem}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
  
          <Text style={styles.postTitle}>{item.title}</Text>
  
          <View id='interaction-container' style={styles.interactionContainer}>
            <TouchableOpacity onPress={() => handleInteraction('likes', item.id)}>
              <Text style={styles.interactionButton}>👍 {item.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleInteraction('reposts', item.id)}>
              <Text style={styles.interactionButton}>🔄 {item.reposts}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleInteraction('comments', item.id)}>
              <Text style={styles.interactionButton}>💬 {item.comments}</Text>
            </TouchableOpacity>
          </View>
  
        </View>
      </View>
    );
  };  

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
        <Pressable style={styles.createPostButton} onPress={() => router.push('/create-post')}>
          
          <Svg width={50} height={50} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15"
              stroke="#1C274C"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <Path
              d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
              stroke="#70c0b7"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </Svg>
          
        </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    '@media (min-width: 768px)': {
      paddingHorizontal: 40,
    },
    '@media (min-width: 1024px)': {
      maxWidth: 1000,
    },
  },

  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  postContainer: {
    marginVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  imageWrapper: {
    position: 'relative',
    width: '100%',
  },
  
  postImage: {
    width: '100%',
    height: undefined,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  
  
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 6,
  },
  
  menuText: {
    fontSize: 18,
    color: '#333',
  },
  
  menuContainer: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  
  menuItem: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    color: '#333',
  },
  
  postTitle: {
    fontSize: 16,
    marginVertical: 10,
    marginHorizontal: 15,
    lineHeight: 22,
    color: '#333',
    fontWeight: 'bold',
  },
  
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  
  interactionButton: {
    fontSize: 14,
    color: '#1a365d',
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#e3eaf2',
  },  
  
  createPostButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  }

});