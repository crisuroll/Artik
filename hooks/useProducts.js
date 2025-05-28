import { useState } from 'react';
import { Alert } from 'react-native';
import { createProduct } from '../services/usersService';

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);

  const handleCreateProduct = async ({ name, description, price, stock, user_id, product_url, onSuccess }) => {
    if (!name || !description || !price || !stock || !product_url) {
      Alert.alert('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      await createProduct({ name, description, price: parseFloat(price), stock: parseInt(stock), user_id, product_url });
      Alert.alert('Producto creado');
      if (onSuccess) onSuccess();
    } catch (error) {
      Alert.alert('Error al crear el producto', error.message);
    }
    setLoading(false);
  };

  return { handleCreateProduct, loading };
}