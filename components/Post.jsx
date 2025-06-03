import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import PostInteractions from './PostInteractions';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Post = ({ item, activeMenuPostId, setActiveMenuPostId, handleInteraction, handleOption }) => {
  const router = useRouter();

  const handleUserNavigation = () => {
    if (item.userId && item.username) {
      router.push(`/${item.username}`);
    }
  };

  const imageRatio = item.width && item.height ? item.width / item.height : 1.5;

  return (
    <View id="post-container">
      <TouchableOpacity onPress={handleUserNavigation} style={styles.usernameContainer}>
        <Text style={styles.username}>{item.username}</Text>
      </TouchableOpacity>

      <View id="post-content" style={styles.postContainer}>
        <View style={styles.imageWrapper}>
          <Image
            id="post-image"
            source={{ uri: item.imageUrl }}
            style={[styles.postImage, { aspectRatio: imageRatio }]}
          />

          {/* <TouchableOpacity
            id="menu-button"
            style={styles.menuButton}
            onPress={() =>
              setActiveMenuPostId(activeMenuPostId === item.id ? null : item.id)
            }
          >
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>

          {activeMenuPostId === item.id && (
            <View id="menu-container" style={styles.menuContainer}>
              <TouchableOpacity onPress={() => handleOption('Denunciar')}>
                <Text style={styles.menuItem}>Denunciar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleOption('Guardar')}>
                <Text style={styles.menuItem}>Guardar</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>

        <PostInteractions
          likes={item.likes}
          reposts={item.reposts}
          postId={item.id}
          handleInteraction={handleInteraction}
          style={styles.interactionContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: windowWidth < 426 ? '100%' : windowWidth < 769 ? '80%' : '60%',
    alignSelf: 'center',
  },
  usernameContainer: {
    marginHorizontal: windowWidth < 426 ? 5 : windowWidth < 769 ? 80 : 160,
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#70c0b7',
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
});

export default Post;