import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLogin } from '../../hooks/useAuth';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Login () {
  const router = useRouter();
  const { login, loading } = useLogin();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    login(identifier, password);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo o usuario"
        placeholderTextColor="#666"
        value={identifier}
        onChangeText={setIdentifier}
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

      <View style={styles.buttonsContainer}>
        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </Pressable>
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
          ]}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
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
    color: '#5ea8a0'
  }
});
