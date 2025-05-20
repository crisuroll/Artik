import React from 'react';
import { View, TextInput, FlatList, StyleSheet, Text } from 'react-native';
import useSearchPosts from '../hooks/useSearchPosts';
import Post from '../components/Post';
import CreatePostButton from '../components/CreatePostButton';

const Search1 = () => {
  const {
    searchTerm,
    setSearchTerm,
    filteredPosts,
    activeMenuPostId,
    setActiveMenuPostId,
    handleSearch,
    handleInteraction,
  } = useSearchPosts();

  const handleOption = (option) => {
    Alert.alert(option);
    setActiveMenuPostId(null);
  };

  const renderPost = ({ item }) => (
    <Post
      item={item}
      activeMenuPostId={activeMenuPostId}
      setActiveMenuPostId={setActiveMenuPostId}
      handleInteraction={handleInteraction}
      handleOption={handleOption}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {searchTerm.trim() === '' ? (
        <Text style={styles.noResultsText}>
          Por favor, ingresa una palabra clave para buscar.
        </Text>
      ) : filteredPosts.length === 0 ? (
        <Text style={styles.noResultsText}>No se encontraron resultados.</Text>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <CreatePostButton onPress={() => console.log('Crear nuevo post')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  listContent: {
    paddingBottom: 80,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default Search1;
