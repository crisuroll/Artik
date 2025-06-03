import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { getImageSize } from '../utils/getImageSize';

const windowWidth = Dimensions.get('window').width;

const ProductCard = ({ item, onPress }) => {
  const [aspectRatio, setAspectRatio] = useState(1.5);

  const imageUri = item.product_url || item.image || item.imageUrl || item.image_url || item.img || '';

  useEffect(() => {
    let isMounted = true;
    if (imageUri) {
      getImageSize(imageUri).then(({ width, height }) => {
        if (isMounted && width && height) {
          setAspectRatio(width / height);
        }
      });
    }
    return () => { isMounted = false; };
  }, [imageUri]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <View style={styles.imageWrapper}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.productImage, { aspectRatio }]}
          />
        ) : (
          <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#aaa' }}>Sin imagen</Text>
          </View>
        )}
      </View>
      <Text style={styles.productTitle}>{item.name || item.title || 'Sin título'}</Text>
      <Text style={styles.productPrice}>{item.price ? `€${item.price}` : ''}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: windowWidth < 426 ? '90%' : windowWidth < 769 ? '70%' : '40%',
    alignSelf: 'center',
  },
  imageWrapper: {
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: undefined,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
    backgroundColor: '#eee',
  },
  productTitle: {
    fontSize: 16,
    marginVertical: 10,
    marginHorizontal: 15,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    color: '#70c0b7',
    fontWeight: '600',
  },
});

export default ProductCard;