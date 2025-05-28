import { View, TextInput, ActivityIndicator, StyleSheet, Text, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import UploadFile from '../components/UploadFile';
import { useEditProfile } from '../hooks/useAuth';
import BackButton from '../components/BackButton';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function EditProfile() {
  const router = useRouter();
  const {
    loading,
    saving,
    nickname, setNickname,
    username, setUsername,
    email, setEmail,
    avatarUrl, setAvatarUrl,
    bio, setBio,
    uploading, setUploading,
    handleSave,
  } = useEditProfile();

  console.log({ nickname, username, email, avatarUrl, bio });

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#70c0b7" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton fallback="/profile" />
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
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="Nombre"
          placeholderTextColor="#bbb"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Usuario"
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
    overflow: 'hidden',
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
    marginLeft: windowWidth < 426 ?
      2 :
        windowWidth < 769 ? 
          170 : 590,
    
  },
  input: {
    height: 50,
    width: 350,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
    outlineColor: '#70c0b7',
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