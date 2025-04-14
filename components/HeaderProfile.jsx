import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const HeaderProfile = ({ toggleMenu }) => {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.profileButton} 
          onPress={toggleMenu}
        >
        </Pressable>
        {//<Text style={styles.headerTitle}>Para ti</Text>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 30
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
    backgroundColor: 'black',
    height: 50,
    width: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    textAlign: 'right',
  },
});

export default HeaderProfile;