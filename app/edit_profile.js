import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert, ActivityIndicator, StyleSheet, Text, ScrollView } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useRouter } from 'expo-router';
import UploadFile from '../components/UploadFile';
import { TouchableOpacity } from 'react-native';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.log('Error: No se pudo obtener el usuario autenticado.', authError);
        setLoading(false);
        return;
      }
      const id = authData.user.id;
      setUserId(id);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, email, avatar_url, bio')
        .eq('id', id)
        .single();

      if (userError || !userData) {
        console.log('Error: No se pudieron cargar los datos del usuario.', userError);
      } else {
        setUsername(userData.username);
        setEmail(userData.email);
        setAvatarUrl(userData.avatar_url || '');
        setBio(userData.bio || '');
        console.log('Datos de usuario cargados:', userData);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!username || !email) {
      console.log('Error: Username y email son obligatorios.');
      return;
    }
    setSaving(true);
    console.log('Intentando actualizar usuario con id:', userId);
    const { error, data } = await supabase
      .from('users')
      .update({
        username,
        email,
        avatar_url: avatarUrl,
        bio,
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.log('Error: No se pudo actualizar el perfil.', error);
    } else if (data.length === 0) {
      console.log('No se encontró ningún usuario para actualizar. userId:', userId);
    } else {
      console.log('Perfil actualizado correctamente.', data);
      router.replace('/my-user');
    }
    setSaving(false);
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('users')
      .update({
        username: username,
        nickname: nickname,
      })
      .eq('id', userId);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace('/home');
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#70c0b7" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar perfil</Text>

      <View style={styles.avatarSection}>
        <UploadFile
          bucketName="avatar"
          imageUrl={avatarUrl}
          onUploadSuccess={setAvatarUrl}
          uploading={uploading}
          setUploading={setUploading}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Nombre de usuario"
          placeholderTextColor="#bbb"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Correo electrónico"
          placeholderTextColor="#bbb"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Cuéntanos algo sobre ti..."
          placeholderTextColor="#bbb"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F6F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#70c0b7',
    marginBottom: 24,
    alignSelf: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#70c0b7',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontWeight: '600',
    color: '#70c0b7',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#22223B',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#70c0b7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#70c0b7',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});