import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import BackButton from '../components/BackButton';
import { loadUser } from '../services/usersService';
import { loadUserPosts } from '../services/usersService';
import { loadUserReposts } from '../services/usersService';
import { loadUserProducts  } from '../services/usersService';
import Post from '../components/Post';
import CreatePostButton from '../components/CreatePostButton';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Product from '../components/Product';
import { loadUserCommission } from '../services/usersService';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Posts');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReposts, setUserReposts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null);
  const [commission, setCommission] = useState(null);
  const router = useRouter();
  const { userId: profileUserId } = useLocalSearchParams();

  const tabs = ['Posts', , 'Shop', 'Commissions', 'Repost'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await loadUser();
        if (user) {
          setUserData(user);
          setUserId(user.userId);
          setDescription(user.bio || '');

          const posts = await loadUserPosts(user.userId);
          setUserPosts(posts);

          const reposts = await loadUserReposts(user.userId);
          setUserReposts(reposts);

          console.log('userId para productos:', user.userId);
          const products = await loadUserProducts(user.userId);
          console.log('Productos obtenidos:', products);
          setUserProducts(products);

          const commissionData = await loadUserCommission(user.userId);
          setCommission(commissionData);
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchCommission = async () => {
      if (!userId) return;
      const data = await loadUserCommission(userId);
      setCommission(data);
    };
    fetchCommission();
  }, [userId]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!profileUserId) return;
      const products = await loadUserProducts(profileUserId);
      setUserProducts(products);
    };
    fetchProducts();
  }, [profileUserId]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let isActive = true;
      const fetchProducts = async () => {
        const products = await loadUserProducts(userId);
        if (isActive) setUserProducts(products);
        console.log('userId:', userId, 'products:', products);
      };
      fetchProducts();
      return () => { isActive = false; };
    }, [userId])
  );

  return (
    <View style={styles.container}>
      <BackButton />

      {/* Botón para editar perfil */}
      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => router.push('/edit_profile')}
      >
        <Text style={styles.editProfileButtonText}>Editar perfil</Text>
      </TouchableOpacity>

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

      </View>

      <View style={styles.descriptionBox}>
        <TextInput
          placeholder="Descripción"
          multiline
          value={description}
          onChangeText={setDescription}
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
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push({ pathname: '/loaded_post', params: { postId: item.id } })}>
                <Post item={item} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.postsList}
          />
        )}
        {activeTab === 'Shop' && (
          <>
            <CreatePostButton onPress={() => router.push('/create-product')} />
            <FlatList
              data={userProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Product item={item} />
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 20 }}>
                  No hay productos
                </Text>
              }
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          </>
        )}
        {activeTab === 'Commissions' && (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#e1f3f2',
                padding: 10,
                borderRadius: 20,
                alignSelf: 'center',
                marginBottom: 10,
                marginTop: 10,
                opacity: commission ? 0.7 : 1,
              }}
              onPress={() => router.push('/edit_commission')}
              disabled={!!commission}
            >
              <Text style={{ color: '#007b7f', fontWeight: 'bold' }}>
                {commission ? 'Ya tienes una commission' : 'Crear commission'}
              </Text>
            </TouchableOpacity>
            {commission ? (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                {commission.comm_url ? (
                  <Image source={{ uri: commission.comm_url }} style={{ width: 200, height: 200, borderRadius: 10 }} />
                ) : null}
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 10 }}>{commission.title}</Text>
                <Text style={{ color: '#555', marginTop: 6, textAlign: 'center' }}>{commission.description}</Text>
                <TouchableOpacity
                  style={{
                    marginTop: 12,
                    backgroundColor: '#007b7f',
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                  }}
                  onPress={() => router.push('/edit_commission')}
                >
                  <Text style={{ color: '#fff' }}>Editar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.placeholder}>No tienes commission publicada</Text>
            )}
          </View>
        )}
        {activeTab === 'Repost' && (
          <FlatList
            data={userReposts}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push({ pathname: '/loaded_post', params: { postId: item.id } })}>
                <Post item={item} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
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
  editProfileButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#e1f3f2',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  editProfileButtonText: {
    color: '#007b7f',
    fontWeight: 'bold',
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
  productContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  productDesc: {
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    color: '#007b7f',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productStock: {
    color: '#888',
    fontSize: 13,
  },
});
