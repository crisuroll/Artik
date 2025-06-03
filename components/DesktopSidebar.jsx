import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { loadUser } from '../services/usersService';
import { supabase } from '../supabase/supabaseClient';

const DesktopSidebar = () => {
  const [username, setUsername] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await loadUser();
      setUsername(user?.username);
      setAvatarUrl(user?.avatarUrl);
    };
    fetchUser();
  }, []);

  const handleProfile = () => {
    if (username) {
      router.push(`/${username}`);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error trying to log out:", error.message);
      return;
    }
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Link href="/home" asChild>
          <Pressable style={styles.menuItem}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"
                stroke="#70c0b7"
                strokeWidth="1.5"
                fill="none"
              />
            </Svg>
            <Text style={styles.menuText}>Inicio</Text>
          </Pressable>
        </Link>

        <Link href="/search" asChild>
          <Pressable style={styles.menuItem}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"
                stroke="#70c0b7"
                strokeWidth="1.5"
                fill="none"
              />
            </Svg>
            <Text style={styles.menuText}>Buscar</Text>
          </Pressable>
        </Link>

        <Link href="/challenges" asChild>
          <Pressable style={styles.menuItem}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                stroke="#70c0b7"
                strokeWidth="1.5"
                fill="none"
              />
            </Svg>
            <Text style={styles.menuText}>Retos</Text>
          </Pressable>
        </Link>

        <Link href="/gallery" asChild>
          <Pressable style={styles.menuItem}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"
                stroke="#70c0b7"
                strokeWidth="1.5"
                fill="none"
              />
            </Svg>
            <Text style={styles.menuText}>Galería</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.menuItem} onPress={handleProfile} disabled={!username}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M12 12c2.7 0 4.5-2.2 4.5-4.5S14.7 3 12 3 7.5 5.2 7.5 7.5 9.3 12 12 12zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z"
                stroke="#70c0b7"
                strokeWidth="1.5"
                fill="none"
              />
            </Svg>
          )}
          <Text style={styles.menuText}>Mi Perfil</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              d="M16 17v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1m-4 4h12m-3-3 3 3-3 3"
              stroke="#70c0b7"
              strokeWidth="1.5"
              fill="none"
            />
          </Svg>
          <Text style={styles.menuText}>Cerrar Sesión</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 260,
    height: '100%',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#70c0b7',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
  },
});

export default DesktopSidebar;