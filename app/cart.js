import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { usePayment } from '../hooks/useShop';
import BackButton from '../components/BackButton';

export default function CartScreen() {
  const router = useRouter();
  const { cart, loading, removeFromCart } = usePayment();

  const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const handleRemove = (id) => {
    removeFromCart(id);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007b7f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton fallback="/username" />
      <Text style={styles.title}>Tu carrito</Text>
      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.product?.product_url || 'https://via.placeholder.com/100' }}
              style={styles.image}
            />
            <View style={styles.info}>
              <Text style={styles.productName}>{item.product?.name}</Text>
              <Text style={styles.price}>{item.product?.price?.toFixed(2)}€</Text>
              <Text style={styles.quantity}>Cantidad: {item.quantity}</Text>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.id)}
              >
                <Text style={styles.removeBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay productos en el carrito.</Text>}
        contentContainerStyle={cart.length === 0 && { flex: 1, justifyContent: 'center' }}
      />

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: {total.toFixed(2)}€</Text>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => router.push('/payment')}
          >
            <Text style={styles.payBtnText}>Ir a pagar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 18,
    alignSelf: 'center',
    color: '#222',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
  },
  price: {
    fontSize: 16,
    color: '#70c0b7',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  removeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  removeBtnText: {
    color: '#b71c1c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 60,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 18,
    paddingBottom: 80,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  payBtn: {
    backgroundColor: '#70c0b7',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: 'center',
    marginTop: 4,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});