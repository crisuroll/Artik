import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import BackButton from '../components/BackButton';
import UploadFile from '../components/UploadFile';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase/supabaseClient';
import { useCreateProduct } from '../hooks/useProducts';
import CustomTextInput from '../components/CustomTextInput';

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
      <UploadFile
        bucketName="products"
        imageUrl={image}
        onUploadSuccess={setImage}
        uploading={uploading}
        setUploading={setUploading}
        style = {{ marginBottom: 20 }}
      />
      <CustomTextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <CustomTextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      <CustomTextInput
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <CustomTextInput
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />
      <Pressable
        onPress={onCreate}
        disabled={loading}
        style={({ pressed }) => [
          styles.createButton,
          loading && styles.createButtonDisabled,
          { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
        ]}
      >
        <Text style={styles.createButtonText}>
          {loading ? "Creando..." : "Crear producto"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#70c0b7',
    fontFamily: 'Nunito',
  },
  createButton: { 
    height: 45,
    width: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
    marginBottom: 30,
  },
  createButtonText: { 
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Nunito',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
});