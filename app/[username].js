import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import BackButton from '../components/BackButton';
import { supabase } from '../supabase/supabaseClient';
import { loadUserPosts } from '../services/usersService';
import { loadUserProducts  } from '../services/usersService';
import { loadUserReposts } from '../services/usersService';
import { loadUserCommission } from '../services/usersService';
import Product from '../components/Product';
import Post from '../components/Post';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function UserProfile() {
  const { username } = useLocalSearchParams();
  const router = useRouter();

  if (!username) return <Text>No se proporcionó un username</Text>;

  const [activeTab, setActiveTab] = useState('Posts');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [userReposts, setUserReposts] = useState([]);
  const [description, setDescription] = useState('');
  const [commission, setCommission] = useState(null);

  const tabs = ['Posts', , 'Shop', 'Commissions', 'Repost'];
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (user) {
          setUserData(user);
          setDescription(user.bio || '');

          const posts = await loadUserPosts(user.id);
          setUserPosts(posts);

          const products = await loadUserProducts(user.id);
          setUserProducts(products);

          const reposts = await loadUserReposts(user.id);
          setUserReposts(reposts);

          const commissionData = await loadUserCommission(user.id);
          setCommission(commissionData);
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      }
    };

    fetchUserData();
  }, [username]);

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
        {userData?.avatar_url ? (
          <Image source={{ uri: userData.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>No Image</Text>
          </View>
        )}
        <Text style={styles.username}>
          {userData?.nickname || 'Usuario'} <Text style={styles.at}>@{userData?.username || ''}</Text>
        </Text>

        <TouchableOpacity
          style={styles.mailIcon}
          onPress={() => router.push(`/dm/${userData?.username}`)}
        >
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
            <FlatList
              data={userProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => router.push({ pathname: '/loaded_product', params: { productId: item.id } })}>
                  <Product item={item} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.placeholder}>No hay productos</Text>
              }
              contentContainerStyle={{ paddingBottom: 80 }}
            />
            <TouchableOpacity
              onPress={() => router.push('/cart')}
              style={{
                position: 'absolute',
                bottom: 80,
                right: 30,
                backgroundColor: '#007b7f',
                borderRadius: 30,
                padding: 16,
                elevation: 4,
                zIndex: 100,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 28 }}>🛒</Text>
            </TouchableOpacity>
          </>
        )}
        {activeTab === 'Commissions' && (
          <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
            {commission ? (
              <>
                {commission.comm_url ? (
                  <Image source={{ uri: commission.comm_url }} style={{ width: 200, height: 200, borderRadius: 10 }} />
                ) : null}
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 10 }}>{commission.title}</Text>
                <Text style={{ color: '#555', marginTop: 6, textAlign: 'center' }}>{commission.description}</Text>
                <TouchableOpacity
                  style={{
                    marginTop: 18,
                    backgroundColor: '#007b7f',
                    borderRadius: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                  }}
                  onPress={() => router.push({
                    pathname: '/request-commission',
                    params: { userId: commission.user_id }
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                    Solicitar comisión
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.placeholder}>No tiene commission publicada</Text>
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
  productsList: {
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