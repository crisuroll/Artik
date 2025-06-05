import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('cookiesAccepted').then(value => {
      if (value !== 'true') setVisible(true);
    });
  }, []);

  const acceptCookies = async () => {
    await AsyncStorage.setItem('cookiesAccepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra política de cookies.
      </Text>
      <Pressable style={styles.button} onPress={acceptCookies}>
        <Text style={styles.buttonText}>Aceptar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#222',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000
  },
  text: {
    color: '#fff',
    flex: 1,
    marginRight: 10,
    fontFamily: 'Nunito',
  },
  button: {
    backgroundColor: '#70c0b7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Nunito',
  }
});