import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import MasonryList from 'react-native-masonry-list';
import { supabase } from '../supabase/supabaseClient';

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('Category');
  const [categories, setCategories] = useState([]);
  const [stylesData, setStylesData] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*');
      const { data: stylesData, error: stylesError } = await supabase.from('styles').select('*');

      if (categoriesError) console.error('Error fetching categories:', categoriesError);
      if (stylesError) console.error('Error fetching styles:', stylesError);

      setCategories(categoriesData || []);
      setStylesData(stylesData || []);
      setActiveFilter(categoriesData?.[0]?.id || null);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!activeFilter) {
        setPosts([]);
        return;
      }

      setPosts([]);

      const filterColumn = activeTab === 'Category' ? 'category_id' : 'style_id';
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq(filterColumn, activeFilter);

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        const postsWithDimensions = await Promise.all(
          (data || []).map(async (post) => {
            return new Promise((resolve) => {
              Image.getSize(
                post.image_url,
                (width, height) => {
                  resolve({ ...post, width, height });
                },
                () => {
                  resolve({ ...post, width: 200, height: 300 });
                }
              );
            });
          })
        );

        setPosts(postsWithDimensions);
      }
    };

    fetchPosts();
  }, [activeFilter, activeTab]);

  const getFilters = () => (activeTab === 'Category' ? categories : stylesData);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gallery</Text>

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

      {posts.length === 0 ? (
        <Text style={styles.noPostsText}>No posts available for the selected filter.</Text>
      ) : (
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  topFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  tab: {
    fontWeight: '600',
    color: '#999',
    padding: 6,
  },
  activeTab: {
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  subFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  subFilterItem: {
    fontSize: 14,
    color: '#999',
    marginRight: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  activeSubFilter: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  masonryList: {
    marginTop: 5,
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});