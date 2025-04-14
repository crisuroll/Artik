import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, Dimensions } from 'react-native';

const data = Array(10).fill({ title: 'test' });

export default function Challenges() {
  const screenWidth = Dimensions.get('window').width;
  const itemSize = (screenWidth - 60) / 2;
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Challenges</Text>

      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: itemSize, height: itemSize + 30 }]}>
            <View style={styles.imagePlaceholder} />
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
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
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  title: {
    marginTop: 6,
    fontWeight: 'bold',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
});
