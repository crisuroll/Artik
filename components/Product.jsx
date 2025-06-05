import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Product({ item }) {
  return (
    <View style={styles.productContainer}>
      {item.product_url ? (
        <Image source={{ uri: item.product_url }} style={styles.productImage} />
      ) : null}
      <Text style={styles.productTitle}>{item.name}</Text>
      <Text style={styles.productDesc}>{item.description}</Text>
      <Text style={styles.productPrice}>${item.price}</Text>
      <Text style={styles.productStock}>Stock: {item.stock}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  productContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Nunito',
  },
  productDesc: {
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Nunito',
  },
  productPrice: {
    color: '#007b7f',
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Nunito',
  },
  productStock: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Nunito',
  },
});