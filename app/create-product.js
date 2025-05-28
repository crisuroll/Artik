import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import BackButton from '../components/BackButton';
import UploadFile from '../components/UploadFile';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase/supabaseClient';
import { useCreateProduct } from '../hooks/useProducts';

export default function CreateProductScreen() {
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { handleCreateProduct, loading } = useCreateProduct();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null);
    });
  }, []);

  const onCreate = () => {
    handleCreateProduct({
      name: title,
      description,
      price,
      stock,
      user_id: userId,
      product_url: image,
      onSuccess: () => router.back(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <Text style={styles.header}>Nuevo producto</Text>
      <Text style={{ marginBottom: 10 }}>Imagen del producto</Text>
      <UploadFile
        bucketName="products"
        imageUrl={image}
        onUploadSuccess={setImage}
        uploading={uploading}
        setUploading={setUploading}
      />
      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title={loading ? "Creando..." : "Crear producto"} onPress={onCreate} disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
});