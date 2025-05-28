import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, Animated, Dimensions, StyleSheet, Platform } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useRouter } from 'expo-router';

const BarMenu = ({ onClose }) => {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const translateX = useRef(new Animated.Value(-width * 0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [userEmail, setUserEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: !isWeb,
      }),
    ]).start();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUserEmail(data.session.user.email);
        // Obtener el username del usuario autenticado
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.session.user.id)
          .single();
        setUsername(userData?.username);
      }
    };

    fetchUser();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -width * 0.4,
        duration: 250,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: !isWeb,
      }),
    ]).start(() => onClose());
  };

  // Cambia aquí la redirección
  const handleMyProfile = () => {
    if (username) {
      router.push(`/${username}`);
      handleClose();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error trying to log out:", error.message);
      return;
    }

    router.replace('/');
    handleClose();
  };

  return (
    <View style={styles.menuContainer}>
      <Animated.View style={[styles.backgroundPressable, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.menuContent,
          {
            transform: [{ translateX }],
            width: width * 0.4,
          },
        ]}
      >
        <Text style={styles.menuTitle}>Mi Perfil</Text>

        <Pressable style={styles.menuItem} onPress={handleMyProfile}>
          <Text style={styles.menuText}>Configuración</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuText}>Cerrar Sesión</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  backgroundPressable: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 30,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
    color: '#2f4f75',
  },
});

export default BarMenu;
