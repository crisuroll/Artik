import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) setUsername(JSON.parse(user).username);
    };
    
    loadUser();
    // Datos de ejemplo
    setPosts([
      {
        id: '1',
        title: 'Welcome to Artik!',
        username: 'crisuroll',
        imageUrl: '',
        likes: 345,
        reposts: 92,
        shares: 27
      },
      {
        id: '2',
        title: 'This is a cool social network for artists :)',
        username: 'art_crafts',
        imageUrl: '',
        likes: 89,
        reposts: 24,
        shares: 15
      },
      {
        id: '3',
        title: 'Welcome to Artik!',
        username: 'crisuroll',
        imageUrl: '',
        likes: 345,
        reposts: 92,
        shares: 27
      },
      {
        id: '4',
        title: 'Welcome to Artik!',
        username: 'crisuroll',
        imageUrl: '',
        likes: 345,
        reposts: 92,
        shares: 27
      },
    ]);
  }, []);

  const handleInteraction = (type, postId) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, [type]: post[type] + 1 };
      }
      return post;
    }));
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const handleOption = (option) => {
    Alert.alert(option);
    setMenuVisible(false);
  };

  const renderPost = ({ item }) => (
    <View id='post-container'>
      <View id='post-content' style={styles.postContainer}>
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
      
        <Image id='post-image' source={{ uri: item.imageUrl }} style={styles.postImage} />
      </View>

      <View id='interaction-container' style={{flex: 1, flexDirection: 'row'}}>
        <Text style={styles.postTitle}>{item.title}</Text>
        
        <View id='interaction-options' style={styles.interactionContainer}>
          <TouchableOpacity onPress={() => handleInteraction('likes', item.id)}>
            <Text style={styles.interactionButton}>👍 {item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleInteraction('reposts', item.id)}>
            <Text style={styles.interactionButton}>🔄 {item.reposts}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleInteraction('shares', item.id)}>
            <Text style={styles.interactionButton}>📤 {item.shares}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
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
    padding: 15,
    '@media (min-width: 768px)': {
      marginVertical: 20,
      padding: 20,
    },
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postTitle: {
    flex: 1,
    justifyContent: 'flex-start',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  interactionButton: {
    fontSize: 14,
    color: '#1a365d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#e3eaf2',
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  menuText: {
    fontSize: 18,
    color: '#555',
  },
  menuContainer: {
    position: 'absolute',
    top: 30,
    right: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuItem: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    color: '#333',
  },

});

export default Home;