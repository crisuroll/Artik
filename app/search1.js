import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Search1 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Busqueda</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: '#1a365d'
  }
});

export default Search1;