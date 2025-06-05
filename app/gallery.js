import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MasonryList from 'react-native-masonry-list';
import { useGallery } from '../hooks/usePosts';
import { useRouter } from 'expo-router';

export default function Gallery() {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    categories,
    stylesData,
    activeFilter,
    setActiveFilter,
    posts,
    loading,
    getFilters,
  } = useGallery();

  const handlePressImage = (item) => {
    router.push(`/loaded_post?postId=${item.id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Galería</Text>

      <View style={styles.topFilters}>
        {['Category', 'Style'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              const firstFilter = (tab === 'Category' ? categories : stylesData)[0];
              setActiveFilter(firstFilter?.id || null);
            }}
          >
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

      <View style={{ marginBottom: 5 }}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.subFilters}
          showsHorizontalScrollIndicator={false}
        >
          {getFilters().map((item) => (
            <TouchableOpacity key={item.id} onPress={() => setActiveFilter(item.id)}>
              <Text
                style={[
                  styles.subFilterItem,
                  activeFilter === item.id && styles.activeSubFilter,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <Text style={styles.noPostsText}>Cargando...</Text>
      ) : posts.length === 0 ? (
        <Text style={styles.noPostsText}>No hay posts disponibles</Text>
      ) : (
        <View style={styles.masonryWrapper}>
          <MasonryList
            images={posts
              .filter((post) => post.image_url)
              .map((post) => ({
                uri: post.image_url || 'https://via.placeholder.com/200x300',
                id: post.id,
                width: post.width || 200,
                height: post.height || 300,
              }))}
            columns={2}
            spacing={4}
            style={styles.masonryList}
            imageContainerStyle={styles.imageContainer}
            onPressImage={handlePressImage}
            backgroundColor="transparent"
          />
        </View>
      )}
    </View>
  );
}

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
    fontFamily: 'Nunito',
  },
  topFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  tab: {
    fontWeight: '600',
    color: '#70c0b7',
    padding: 6,
    fontFamily: 'Nunito',
  },
  activeTab: {
    fontWeight: 'bold',
    color: '#5ea8a0',
    backgroundColor: '#eee',
    borderRadius: 6,
    fontFamily: 'Nunito',
  },
  subFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    fontFamily: 'Nunito',
  },
  subFilterItem: {
    fontSize: 14,
    color: '#999',
    marginRight: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontFamily: 'Nunito',
  },
  activeSubFilter: {
    color: '#5ea8a0',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: 'Nunito',
  },
  masonryList: {
    marginTop: 5,
    backgroundColor: 'transparent',
  },
  masonryWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#999',
    fontFamily: 'Nunito',
  },
});