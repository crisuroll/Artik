import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '../../hooks/useAuth';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Register() {

  const router = useRouter();
  const { register, loading } = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    register(email, password, confirmPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor="#666"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.buttonsContainer}>
        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </Pressable>
        <Pressable
          onPress={handleRegister}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
          ]}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#70c0b7'
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
  buttonsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingLeft: windowWidth < 426 ?
      10 :
        windowWidth < 769 ? 
          140 : 700,
          
    paddingRight: windowWidth < 426 ?
      10 :
        windowWidth < 769 ? 
          140 : 700,
  },
  button: {
    height: 45,
    width: 120,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  link: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  }
});