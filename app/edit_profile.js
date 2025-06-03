import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, ScrollView, Dimensions, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase/supabaseClient';
import UploadFile from '../components/UploadFile';
import BackButton from '../components/BackButton';
import CustomTextInput from '../components/CustomTextInput';

const windowWidth = Dimensions.get('window').width;

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
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
        .select('username, nickname, email, avatar_url, bio')
        .eq('id', id)
        .single();

      if (userError || !userData) {
        console.log('Error: No se pudieron cargar los datos del usuario.', userError);
      } else {
        setUsername(userData.username);
        setNickname(userData.nickname || '');
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
      Alert.alert('Error', 'Username y email son obligatorios.');
      return;
    }
    setSaving(true);
    console.log('Intentando actualizar usuario con id:', userId);
    const { error, data } = await supabase
      .from('users')
      .update({
        username,
        nickname,
        email,
        avatar_url: avatarUrl,
        bio,
      })
      .eq('id', userId)
      .select();

    if (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
      console.log('Error: No se pudo actualizar el perfil.', error);
    } else if (data.length === 0) {
      Alert.alert('Error', 'No se encontró ningún usuario para actualizar.');
      console.log('No se encontró ningún usuario para actualizar. userId:', userId);
    } else {
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      console.log('Perfil actualizado correctamente.', data);
      router.replace('/my-user');
    }
    setSaving(false);
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#70c0b7" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton fallback={`/${username}`} />
      <Text style={styles.title}>Editar perfil</Text>

      <View style={styles.avatarSection}>
        <UploadFile
          bucketName="avatar"
          imageUrl={avatarUrl}
          onUploadSuccess={setAvatarUrl}
          uploading={uploading}
          setUploading={setUploading}
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            overflow: 'hidden',
          }}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre</Text>
        <CustomTextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="Nombre"
          placeholderTextColor="#bbb"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Usuario</Text>
        <CustomTextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Usuario"
          placeholderTextColor="#bbb"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <CustomTextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Correo electrónico"
          placeholderTextColor="#bbb"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <CustomTextInput
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Cuéntanos algo sobre ti..."
          placeholderTextColor="#bbb"
          style={styles.bioInput}
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveButton,
          saving && styles.saveButtonDisabled,
          { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
        ]}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
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
    textAlign: 'center',
    marginBottom: 30,
    color: '#70c0b7',
  },
  avatarSection: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#70c0b7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontWeight: '600',
    color: '#70c0b7',
    marginBottom: 6,
    marginLeft: windowWidth < 426 ?
      2 :
        windowWidth < 769 ? 
          170 : 220,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButton: {
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
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});