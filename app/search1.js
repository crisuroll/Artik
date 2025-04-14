import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Link } from 'expo-router';

const Search1 = () => {
  return (
    <View style={styles.container}>
      <TextInput placeholder="Search..."
      style={{
        height: 45,
        width: 320,
        backgroundColor: '#ffffff',
        borderRadius: 40,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        '@media (min-width: 768px)': {
            display: 'none',
        },
      }}
      />
      <Pressable style={styles.icon}>
        <Link href="/search1">
          <Svg width={28} height={28} viewBox="0 0 24 24">
            <Path
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"
              stroke="#70c0b7"
              strokeWidth="1.5"
              fill="none"
            />
          </Svg>
        </Link>
      </Pressable>
    </View> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    //justifyContent: 'center',
    //alignItems: 'center',
    padding: 20,
    paddingTop: 60
  },
  icon: {
    paddingTop: 10,
    paddingLeft: 20
  }
});

export default Search1;