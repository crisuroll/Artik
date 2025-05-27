import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Button } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { addToCart } from '../services/cart';
import { supabase } from '../supabase/supabaseClient';

export default function LoadedProduct() {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      setProduct(data);
      setLoading(false);
    };
    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión para añadir al carrito');
      setAdding(false);
      return;
    }
    try {
      await addToCart({ userId: user.id, productId: product.id });
      alert('Producto añadido al carrito');
    } catch (e) {
      alert('Error al añadir al carrito');
    }
    setAdding(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007b7f" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.product_url ? (
        <Image source={{ uri: product.product_url }} style={styles.image} />
      ) : null}
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.stock}>Stock: {product.stock}</Text>
      <Text style={styles.desc}>{product.description}</Text>
      <Button title={adding ? "Añadiendo..." : "Añadir al carrito"} onPress={handleAddToCart} disabled={adding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    color: '#007b7f',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  stock: {
    fontSize: 15,
    color: '#888',
    marginBottom: 10,
  },
  desc: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
});