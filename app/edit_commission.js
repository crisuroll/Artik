import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loadUser } from '../services/getUser';
import { loadUserCommission, upsertUserCommission } from '../services/getUserCommission';
import UploadFile from '../components/UploadFile';
import BackButton from '../components/BackButton';

export default function EditCommissionScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [commissionId, setCommissionId] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchCommission = async () => {
      setLoading(true);
      const user = await loadUser();
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const commission = await loadUserCommission(user.userId);
        if (commission) {
          setTitle(commission.title || '');
          setDescription(commission.description || '');
          setImageUrl(commission.comm_url || null);
          setCommissionId(commission.id);
        } else {
          setTitle('');
          setDescription('');
          setImageUrl(null);
          setCommissionId(null);
        }
      } catch (e) {
        // Silenciar cualquier error (incluido 406)
      }
      setLoading(false);
    };
    fetchCommission();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      return;
    }
    setUploading(true);
    const user = await loadUser();

    try {
      await upsertUserCommission({
        userId: user.userId,
        title,
        description,
        imageUrl,
      });
      router.back();
    } catch (e) {
      // Silenciar cualquier error
    }
    setUploading(false);
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
      <BackButton />
      <Text style={styles.label}>Imagen</Text>
      <UploadFile
        imageUrl={imageUrl}
        onUploadSuccess={(url) => {
          console.log('Imagen subida, URL:', url);
          setImageUrl(url);
        }}
        setUploading={setUploading}
        bucketName="commissions"
        style={styles.imagePicker}
        editable
      />

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Título de la commission"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe tu commission"
        multiline
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={uploading}
      >
        <Text style={styles.saveButtonText}>
          {uploading ? 'Guardando...' : 'Guardar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  imagePicker: {
    width: 180,
    height: 180,
    backgroundColor: '#eee',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  saveButton: {
    backgroundColor: '#007b7f',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});