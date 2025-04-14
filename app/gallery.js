import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MasonryList from 'react-native-masonry-list';

const dummyData = [
  { id: 1, height: 150, width: 200 },
  { id: 2, height: 200, width: 200 },
  { id: 3, height: 120, width: 100 },
  { id: 4, height: 280, width: 200 },
  { id: 5, height: 150, width: 200 },
  { id: 6, height: 320, width: 200 },
  { id: 7, height: 100, width: 90 },
  { id: 8, height: 100, width: 90 },
  { id: 9, height: 120, width: 200 },
];

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('Category');
  const [categoryFilter, setCategoryFilter] = useState('A');
  const [themeFilter, setThemeFilter] = useState('A');
  const [styleFilter, setStyleFilter] = useState('A');

  const getActiveFilter = () => {
    switch (activeTab) {
      case 'Category':
        return categoryFilter;
      case 'Theme':
        return themeFilter;
      case 'Style':
        return styleFilter;
      default:
        return 'A';
    }
  };

  const setActiveFilter = (value) => {
    switch (activeTab) {
      case 'Category':
        setCategoryFilter(value);
        break;
      case 'Theme':
        setThemeFilter(value);
        break;
      case 'Style':
        setStyleFilter(value);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gallery</Text>

      <View style={styles.topFilters}>
        {['Category', 'Theme', 'Style'].map((tab) => (
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

      <View style={styles.subFilters}>
        {['A', 'B', 'C'].map((item) => (
          <TouchableOpacity key={item} onPress={() => setActiveFilter(item)}>
            <Text
              style={[
                styles.subFilterItem,
                getActiveFilter() === item && styles.activeSubFilter,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <MasonryList
        images={dummyData}
        columns={2}
        spacing={4}
        style={{ marginTop: 10 }}
      />
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
    marginBottom: 20,
  },
  topFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
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
    gap: 20,
    paddingLeft: 10,
    marginBottom: 10,
  },
  subFilterItem: {
    fontSize: 16,
    color: '#999',
    marginRight: 20,
  },
  activeSubFilter: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});