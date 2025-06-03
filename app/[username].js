import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, TextInput, Image, FlatList, ActivityIndicator, Modal } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import BackButton from '../components/BackButton';
import Product from '../components/Product';
import Post from '../components/Post';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserProfile } from '../hooks/useAuth'; 
import { loadUser } from '../services/usersService';
import { interactWithPost } from '../services/postsService';
import { usePostStats } from '../hooks/usePostStats';
import FollowButton from '../components/FollowButton';
import CreatePostButton from '../components/CreatePostButton';
import ProductCard from '../components/ProductCard';
import MasonryList from '@react-native-seoul/masonry-list';

export default function UserProfile() {
  const { username } = useLocalSearchParams();
  const router = useRouter();
  const [myUser, setMyUser] = useState(null);
  const [loadingMyUser, setLoadingMyUser] = useState(true);
  const [userData, setUserData] = useState(null);
  const [refreshStats, setRefreshStats] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowsModal, setShowFollowsModal] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followsData, setFollowsData] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollows, setLoadingFollows] = useState(false);

  const {
    userPosts,
    userProducts,
    userReposts,
    description,
    commission,
    loading,
    userId,
  } = useUserProfile({ username });

  useEffect(() => {
    let mounted = true;
    loadUser().then(user => {
      if (mounted) {
        setMyUser(user);
        setLoadingMyUser(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const loadPublicUserData = async () => {
      try {
        const { data: publicUserData, error } = await supabase
          .from('users')
          .select('id, username, nickname, email, avatar_url, bio, followers, follows')
          .eq('username', username)
          .single();

        if (error) throw error;

        setUserData(publicUserData);
      } catch (error) {
        console.error('Error loading public user data:', error);
      }
    };

    if (username) {
      loadPublicUserData();
    }
  }, [username]);

  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const { data: updatedUserData, error } = await supabase
          .from('users')
          .select('id, username, nickname, email, avatar_url, bio, followers, follows')
          .eq('id', userData?.id)
          .single();

        if (error) throw error;

        setUserData(updatedUserData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };

    if (refreshStats > 0 && userData?.id) {
      refreshUserData();
    }
  }, [refreshStats, userData?.id]);

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

  const loadFollowersData = async () => {
    setLoadingFollowers(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, nickname, avatar_url')
        .in('id', userData?.followers || []);

      if (error) throw error;

      setFollowersData(data || []);
    } catch (error) {
      console.error('Error loading followers data:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const loadFollowsData = async () => {
    setLoadingFollows(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, nickname, avatar_url')
        .in('id', userData?.follows || []);

      if (error) throw error;

      setFollowsData(data || []);
    } catch (error) {
      console.error('Error loading follows data:', error);
    } finally {
      setLoadingFollows(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        setShowFollowersModal(false);
        router.push(`/${item.username}`);
      }}
    >
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.userAvatar} />
      ) : (
        <View style={styles.userAvatarPlaceholder}>
          <Text style={styles.userAvatarText}>No Image</Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userNickname}>{item.nickname || 'Usuario'}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!username) return <Text>No se proporcionó un username</Text>;
  if (loading || loadingMyUser || !userData) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#70c0b7" />;
  return (
    <View style={styles.container}>
      <BackButton fallback='/home' />

      {isMyProfile && (
        <Pressable
          style={({ pressed }) => [
            styles.editProfileButton,
            { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
          ]}
          onPress={() => router.push('/edit_profile')}
        >
          <Text style={styles.editProfileButtonText}>Editar perfil</Text>
        </Pressable>
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
        <View style={styles.followRow}>
          <TouchableOpacity onPress={() => { setShowFollowersModal(true); loadFollowersData(); }}>
            <Text style={styles.followText}>
              {userData?.followers?.length || 0} Seguidores
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowFollowsModal(true); loadFollowsData(); }}>
            <Text style={styles.followText}>
              {userData?.follows?.length || 0} Seguidos
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionRow}>
          {!isMyProfile && myUser?.userId && userData?.id && (
            <FollowButton
              myUserId={myUser.userId}
              targetUser={userData}
              onFollowChange={() => setRefreshStats(prev => prev + 1)}
            />
          )}

          {!isMyProfile && (
            <TouchableOpacity
              style={styles.mailIcon}
              onPress={() => router.push(`/dm/${userData?.username}`)}
            >
              <Text style={styles.icon}>✉️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.descriptionBox}>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : (
          <Text style={[styles.description, styles.placeholder]}>
            No hay descripción disponible
          </Text>
        )}
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabBase,
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
          <>
            {isMyProfile && (
              <CreatePostButton
                onPress={() => router.push('/create-post')}
              />
            )}
            <FlatList
              data={userPosts}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => router.push({ pathname: '/loaded_post', params: { postId: item.id } })}>
                  <PostWithStats item={item} />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={styles.placeholder}>No hay posts</Text>
              }
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
        {activeTab === 'Shop' && (
          <>
            {isMyProfile && (
              <CreatePostButton
                onPress={() => router.push('/create-product')}
              />
            )}
            <MasonryList
              data={userProducts}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <View style={styles.productGridItem}>
                  <ProductCard
                    item={item}
                    onPress={() => router.push({ pathname: '/loaded_product', params: { productId: item.id } })}
                  />
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.placeholder}>No hay productos</Text>
              }
              contentContainerStyle={styles.listContent}
            />
            {!isMyProfile && (
              <TouchableOpacity
                onPress={() => router.push('/cart')}
                style={styles.cartButton}
              >
                <Text style={styles.cartButtonText}>🛒</Text>
              </TouchableOpacity>
            )}
          </>
        )}
        {activeTab === 'Commissions' && (
          <View style={styles.commissionContainer}>
            {commission ? (
              <>
                {commission.comm_url ? (
                  <Image source={{ uri: commission.comm_url }} style={styles.commissionImage} />
                ) : null}
                <Text style={styles.commissionTitle}>{commission.title}</Text>
                <Text style={styles.commissionDescription}>{commission.description}</Text>
                {isMyProfile ? (
                  <TouchableOpacity
                    style={styles.commissionButton}
                    onPress={() => router.push('/edit_commission')}
                  >
                    <Text style={styles.commissionButtonText}>Editar</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.requestCommissionButton}
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
                    <Text style={styles.requestCommissionButtonText}>Solicitar comisión</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              isMyProfile ? (
                <TouchableOpacity
                  style={styles.createCommissionButton}
                  onPress={() => router.push('/edit_commission')}
                >
                  <Text style={styles.createCommissionButtonText}>Crear commission</Text>
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
            ListEmptyComponent={
              <Text style={styles.placeholder}>No hay reposts</Text>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <Modal
        visible={showFollowersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFollowersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seguidores</Text>
            {loadingFollowers ? (
              <ActivityIndicator size="large" color="#70c0b7" />
            ) : (
              <FlatList
                data={followersData}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.placeholder}>No hay seguidores</Text>}
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFollowersModal(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFollowsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFollowsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seguidos</Text>
            {loadingFollows ? (
              <ActivityIndicator size="large" color="#70c0b7" />
            ) : (
              <FlatList
                data={followsData}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.placeholder}>No hay seguidos</Text>}
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFollowsModal(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
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
    color: '#aaa',
    fontSize: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  at: {
    fontWeight: 'normal',
    color: '#aaa',
  },
  followRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  followText: {
    color: '#aaa',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  mailIcon: {
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
    backgroundColor: '#70c0b7',
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
    padding: 10,
    borderRadius: 6,
    minHeight: 40,
   
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  tabBase: {
    paddingVertical: 8,
    fontWeight: '600',
    color: '#70c0b7',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#5ea8a0',
    fontWeight: 'bold',
    color: '#5ea8a0',
  },
  contentArea: {
    flex: 1,
  },
  placeholder: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#70c0b7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userNickname: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userUsername: {
    color: '#aaa',
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    backgroundColor: '#70c0b7',
    borderRadius: 30,
    padding: 16,
    elevation: 4,
    zIndex: 100,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
  },
  commissionContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  commissionImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  commissionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  commissionDescription: {
    color: '#555',
    marginTop: 6,
    textAlign: 'center',
  },
  commissionButton: {
    marginTop: 12,
    backgroundColor: '#70c0b7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  commissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  cartButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: '#70c0b7',
    borderRadius: 30,
    padding: 16,
    elevation: 4,
    zIndex: 100,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 28,
  },
  requestCommissionButton: {
    marginTop: 18,
    backgroundColor: '#70c0b7',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  requestCommissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createCommissionButton: {
    backgroundColor: '#e1f3f2',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  createCommissionButtonText: {
    color: '#70c0b7',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 80,
  },
  productGridItem: {
    flex: 1,
  },
});