import React from 'react';
import { View, FlatList, StyleSheet, Text, Alert, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import useSearchPosts from '../hooks/usePosts';
import Post from '../components/Post';
import CreatePostButton from '../components/CreatePostButton';
import CustomTextInput from '../components/CustomTextInput';

const Search = () => {
  const router = useRouter();

  const {
    searchTerm,
    setSearchTerm,
    filteredPosts,
    filteredUsers,
    activeMenuPostId,
    setActiveMenuPostId,
    handleSearch,
  } = useSearchPosts();

  const handleOption = (option) => {
    Alert.alert(option);
    setActiveMenuPostId(null);
  };

  const handlePostPress = (postId) => {
    router.push(`/loaded_post?postId=${postId}`);
  };

  const handleUserPress = (username) => {
    router.push(`/${username}`);
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity onPress={() => handlePostPress(item.id)}>
      <Post
        item={item}
        activeMenuPostId={activeMenuPostId}
        setActiveMenuPostId={setActiveMenuPostId}
        handleOption={handleOption}
      />
    </TouchableOpacity>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item.username)}>
      <Image source={{ uri: item.avatar_url }} style={styles.userAvatar} />
      <Text style={styles.userName}>{item.nickname || item.username}</Text>
      <Text style={styles.userUsername}>@{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Búsqueda</Text>
      <View style={styles.searchBar}>
        <CustomTextInput
          placeholder="Search..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {searchTerm.trim() === '' ? (
        <Text style={styles.noResultsText}>
          Ingresa tu búsqueda
        </Text>
      ) : filteredPosts.length === 0 && filteredUsers.length === 0 ? (
        <Text style={styles.noResultsText}>No se encontraron resultados.</Text>
      ) : (
        <>
          {filteredUsers.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Usuarios</Text>
              <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
          {filteredPosts.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Posts</Text>
              <FlatList
                data={filteredPosts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
        </>
      )}

      <CreatePostButton onPress={() => console.log('Crear nuevo post')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#70c0b1',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    paddingHorizontal: 20,
    elevation: 5,
  },
  listContent: {
    paddingBottom: 80,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#70c0b1',
    marginTop: 20,
    marginBottom: 5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  userUsername: {
    color: '#888',
    fontSize: 14,
  },
});

export default Search;
