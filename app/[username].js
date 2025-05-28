import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator } from 'react-native';
import BackButton from '../components/BackButton';
import Product from '../components/Product';
import Post from '../components/Post';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePublicUser } from '../hooks/useAuth';
import { loadUser } from '../services/usersService';
import { interactWithPost } from '../services/postsService';
import { usePostStats } from '../hooks/usePostStats';

export default function UserProfile() {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const [myUser, setMyUser] = useState(null);
  const [loadingMyUser, setLoadingMyUser] = useState(true);
  const [refreshStats, setRefreshStats] = useState(0);
  const {
    userData,
    userPosts,
    userProducts,
    userReposts,
    description,
    commission,
    loading,
  } = usePublicUser(username);

  React.useEffect(() => {
    let mounted = true;
    loadUser().then(user => {
      if (mounted) {
        setMyUser(user);
        setLoadingMyUser(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const isMyProfile = useMemo(() => {
    if (!myUser || !userData) return false;
    return myUser.username === userData.username;
  }, [myUser, userData]);

  const tabs = ['Posts', 'Shop', 'Commissions', 'Repost'];
  const [activeTab, setActiveTab] = React.useState('Posts');

  const handleInteraction = async (type, postId) => {
    if (!myUser) return;
    try {
      await interactWithPost(type, myUser.userId, postId);
      setRefreshStats((r) => r + 1);
    } catch (e) {
      alert('Error al interactuar');
      console.error(e);
    }
  };

  function PostWithStats({ item }) {
    const stats = usePostStats(item.id, refreshStats);
    return (
      <Post
        item={{ ...item, ...stats }}
        handleInteraction={isMyProfile ? handleInteraction : undefined}
      />
    );
  }

  if (!username) return <Text>No se proporcionó un username</Text>;
  if (loading || loadingMyUser) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007b7f" />;

  return (
    <View style={styles.container}>
      <BackButton />

      {isMyProfile && (
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => router.push('/edit_profile')}
        >
          <Text style={styles.editProfileButtonText}>Editar perfil</Text>
        </TouchableOpacity>
      )}

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

        {!isMyProfile && (
          <TouchableOpacity
            style={styles.mailIcon}
            onPress={() => router.push(`/dm/${userData?.username}`)}
          >
            <Text style={styles.icon}>✉️</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.descriptionBox}>
        <TextInput
          placeholder="Descripción"
          multiline
          value={description}
          editable={isMyProfile}
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
                <PostWithStats item={item} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.postsList}
          />
        )}
        {activeTab === 'Shop' && (
          <>
            {isMyProfile && (
              <TouchableOpacity
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
                onPress={() => router.push('/create-product')}
              >
                <Text style={{ color: '#fff', fontSize: 28 }}>＋</Text>
              </TouchableOpacity>
            )}
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
            {!isMyProfile && (
              <TouchableOpacity
                onPress={() => router.push('/cart')}
                style={{
                  position: 'absolute',
                  bottom: 20,
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
            )}
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
                {isMyProfile ? (
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
                ) : (
                  <TouchableOpacity
                    style={{
                      marginTop: 18,
                      backgroundColor: '#007b7f',
                      borderRadius: 20,
                      paddingVertical: 10,
                      paddingHorizontal: 30,
                    }}
                    onPress={() => {
                      if (userData?.id) {
                        router.push({
                          pathname: '/request-commission',
                          params: { artistId: userData.id }
                        });
                      } else {
                        alert("No se ha podido obtener el id del artista");
                      }
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                      Solicitar comisión
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              isMyProfile ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#e1f3f2',
                    padding: 10,
                    borderRadius: 20,
                    alignSelf: 'center',
                    marginBottom: 10,
                    marginTop: 10,
                  }}
                  onPress={() => router.push('/edit_commission')}
                >
                  <Text style={{ color: '#007b7f', fontWeight: 'bold' }}>
                    Crear commission
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.placeholder}>No tiene commission publicada</Text>
              )
            )}
          </View>
        )}
        {activeTab === 'Repost' && (
          <FlatList
            data={userReposts}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push({ pathname: '/loaded_post', params: { postId: item.id } })}>
                <PostWithStats item={item} />
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
  editProfileButton: {
    position: 'absolute',
    top: 55,
    right: 20,
    backgroundColor: '#007b7f',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  editProfileButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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