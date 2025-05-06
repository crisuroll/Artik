import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const CreatePostButton = ({ onPress }) => {
  return (
    <Pressable style={styles.createPostButton} onPress={onPress}>
      <Svg width={50} height={50} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15"
          stroke="#1C274C"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
          stroke="#70c0b7"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  createPostButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
});

export default CreatePostButton;