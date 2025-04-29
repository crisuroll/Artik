import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import Svg from 'react-native-svg';

const DesktopSidebar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Link href="/home" asChild>
          <Pressable style={styles.menuItem}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              {/* Icono Home */}
            </Svg>
            <Text style={styles.menuText}>Inicio</Text>
          </Pressable>
        </Link>
        {/* Repetir para otros elementos del menú */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    fontSize: 16,
    color: '#1a365d',
  },
});

export default DesktopSidebar;