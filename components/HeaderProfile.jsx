import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';

const HeaderProfile = ({ toggleMenu, avatarUrl }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.profileButton} onPress={toggleMenu}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  profileButton: {
    borderRadius: 30,
    height: 50,
    width: 50,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default HeaderProfile;
