import React, { useEffect } from 'react';
import { View, Text, Pressable, Animated, Dimensions, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BarMenu = ({ onClose }) => {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const translateX = new Animated.Value(-width * 0.4);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -width * 0.4,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => onClose());
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/');
    handleClose();
  };

  return (
    <View style={styles.menuContainer}>
      <Animated.View 
        style={[
          styles.backgroundPressable, 
          { opacity: fadeAnim }
        ]}
      >
        <Pressable 
          style={{ flex: 1 }} 
          onPress={handleClose} 
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.menuContent, 
          { 
            transform: [{ translateX }],
            width: width * 0.4 
          }
        ]}
      >
        <Text style={styles.menuTitle}>Mi Perfil</Text>
        
        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>Configuración</Text>
        </Pressable>
        
        <Pressable 
          style={styles.menuItem} 
          onPress={handleLogout}
        >
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