import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

export default function CollectionScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backText}>▶Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>title</Text>
        <Text style={styles.dots}>●●●</Text>
      </View>

      <ScrollView>
        {/* Imagen principal */}
        <View style={styles.mainImage} />

        {/* Descripción */}
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>description</Text>
        </View>

        {/* Cuadrícula */}
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((item, index) => (
            <View key={index} style={styles.gridItem}>
              <View style={styles.gridImage} />
              <Text style={styles.username}>username</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Barra de navegación inferior */}
      <View style={styles.navBar}>
        <TouchableOpacity>
          <Text style={styles.navIcon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navIcon}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navIcon}>⭐</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navIcon}>🔲</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navIcon}>✉️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backText: {
    color: '#333',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  dots: {
    color: '#00b3b3',
    fontSize: 14,
  },
  mainImage: {
    height: 200,
    backgroundColor: '#d3d3d3',
    marginHorizontal: 15,
    borderRadius: 6,
  },
  descriptionBox: {
    margin: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  description: {
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 100,
  },
  gridItem: {
    width: '45%',
    marginVertical: 10,
    alignItems: 'center',
  },
  gridImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#d3d3d3',
    borderRadius: 4,
  },
  username: {
    marginTop: 5,
    fontWeight: 'bold',
  },
  navBar: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  navIcon: {
    fontSize: 20,
    color: '#00b3b3',
  },
});
