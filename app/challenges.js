import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLoadChallenges } from '../hooks/useChallenges';
import CreatePostButton from '../components/CreatePostButton';

export default function ChallengesPage() {
  const { challenges, loading } = useLoadChallenges();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#70c0b7" />
      </View>
    );
  }

  const challengesWithPlaceholder = [...challenges];
  if (challenges.length % 2 !== 0) {
    challengesWithPlaceholder.push({ id: 'placeholder' });
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No challenges available.</Text>
        <CreatePostButton onPress={() => router.push('/create-challenge')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Retos</Text>
      <FlatList
        data={challengesWithPlaceholder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.gridContainer}
        numColumns={2}
        renderItem={({ item }) => (
          item.id === 'placeholder' ? (
            <View style={[styles.challengeCard, styles.placeholderCard]} />
          ) : (
            <TouchableOpacity
              style={styles.challengeCard}
              onPress={() => router.push(`/loaded_challenge?id=${item.id}`)}
            >
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={[
                    styles.challengeImage,
                    item.width && item.height
                      ? { aspectRatio: item.width / item.height }
                      : { aspectRatio: 1.5 }
                  ]}
                />
              )}
              <Text style={styles.challengeTitle}>{item.title}</Text>
            </TouchableOpacity>
          )
        )}
      />
      <CreatePostButton onPress={() => router.push('/create-challenge')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#70c0b7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  gridContainer: {
    padding: 16,
  },
  challengeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 0,
    margin: 8,
    elevation: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  placeholderCard: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
    borderWidth: 0,
    flex: 1,
  },
  challengeImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    marginHorizontal: 8,
    color: '#333',
  },
});
