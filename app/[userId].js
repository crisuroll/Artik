import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import BackButton from '../components/BackButton';
import { loadUserById } from '../services/getUser';
import { loadUserPosts } from '../services/getUserPosts';
import { useLocalSearchParams } from 'expo-router';

export default function UserProfile() {
  const { userId } = useLocalSearchParams();

  if (!userId) return <Text>No se proporcionó un userId</Text>;

  const [activeTab, setActiveTab] = useState('Posts');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [description, setDescription] = useState('');

  const tabs = ['Posts', 'Commissions', 'Repost'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await loadUserById(userId);
        if (user) {
          setUserData(user);
          setDescription(user.bio || '');

          const posts = await loadUserPosts(user.userId);
          setUserPosts(posts);
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <Text style={styles.postTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackButton />

      <View style={styles.profileSection}>
        {userData?.avatarUrl ? (
          <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>No Image</Text>
          </View>
        )}
        <Text style={styles.username}>
          {userData?.nickname || 'Usuario'} <Text style={styles.at}>@{userData?.username || ''}</Text>
        </Text>

        <TouchableOpacity style={styles.mailIcon}>
          <Text style={styles.icon}>✉️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.descriptionBox}>
        <TextInput
          placeholder="Descripción"
          multiline
          value={description}
          editable={false}
          style={styles.description}
        />
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contentArea}>
        {activeTab === 'Posts' && (
          <FlatList
            data={userPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.postsList}
          />
        )}
        {activeTab !== 'Posts' && (
          <Text style={styles.placeholder}>Contenido para: {activeTab}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#666',
    fontSize: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  at: {
    fontWeight: 'normal',
    color: '#666',
  },
  mailIcon: {
    marginTop: 6,
    backgroundColor: '#e1f3f2',
    borderRadius: 20,
    padding: 6,
  },
  icon: {
    fontSize: 18,
  },
  descriptionBox: {
    marginBottom: 10,
  },
  description: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 6,
    minHeight: 40,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginTop: 10,
  },
  tab: {
    paddingVertical: 8,
    fontWeight: '600',
    color: '#555',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    fontWeight: 'bold',
    color: '#000',
  },
  contentArea: {
    flex: 1,
  },
  postsList: {
    paddingTop: 10,
  },
  postContainer: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    padding: 10,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});