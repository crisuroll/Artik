import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import BackButton from '../components/BackButton';
import Dropdown from '../components/Dropdown';
import { useCreatePost } from '../hooks/usePosts';
import UploadFile from '../components/UploadFile';
import CustomTextInput from '../components/CustomTextInput';
import image from '../imgCropper/components/image';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function CreatePostPage() {
  const {
    categories, artstyles, challenges,
    selectedCategory, setSelectedCategory,
    selectedArtstyle, setSelectedArtstyle,
    selectedChallenge, setSelectedChallenge,
    challengeChecked, setChallengeChecked,
    title, setTitle, description, setDescription, tags, setTags,
    imageUrl, setImageUrl,
    loading, posting, handlePost
  } = useCreatePost();

  const [uploading, setUploading] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      <UploadFile
        imageUrl={imageUrl}
        onUploadSuccess={setImageUrl}
        bucketName="posts"
        uploading={uploading}
        setUploading={setUploading}
        style={styles.imageContainer}
      />

      <CustomTextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <CustomTextInput
        placeholder="Description"
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <View style={{ flexDirection: 'column' }}>
        <View style={styles.dropdownContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Dropdown
              data={categories}
              onChange={setSelectedCategory}
              placeholder="Select Category"
              value={selectedCategory}
            />
          )}
        </View>
        <View style={styles.dropdownContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Dropdown
              data={artstyles}
              onChange={setSelectedArtstyle}
              placeholder="Select Style"
              value={selectedArtstyle}
            />
          )}
        </View>
      </View>

      <View style={[styles.row, { alignItems: 'center' }]}>
        <Text style={styles.challengeLabel}>Challenge?</Text>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { backgroundColor: challengeChecked ? '#70c0b7' : '#fff', borderColor: '#70c0b7', borderWidth: 1 }
          ]}
          onPress={() => {
            const newChecked = !challengeChecked;
            setChallengeChecked(newChecked);
            if (!newChecked) setSelectedChallenge(null);
          }}
        />
      </View>

      {challengeChecked && (
        <View style={styles.dropdownContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Dropdown
              data={challenges}
              onChange={setSelectedChallenge}
              placeholder="Select Challenge"
              value={selectedChallenge}
            />
          )}
        </View>
      )}

      <Pressable
        onPress={handlePost}
        disabled={posting}
        style={({ pressed }) => [
          styles.postButton,
          posting && styles.postButtonDisabled,
          { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
        ]}
      >
        <Text style={styles.postButtonText}>
          {posting ? "Publicando..." : "Post"}
        </Text>
      </Pressable>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 40,
  },
  imageContainer: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
  },
  textArea: { 
    height: 100 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownContainer: {
    width: 350,
    alignSelf: 'center',
    marginBottom: 16,
  },
  checkbox: { 
    width: 24,
    height: 24,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  challengeLabel: {
    color: '#70c0b7',
    fontSize: 16,
    fontWeight: '500',
    paddingLeft: windowWidth < 426 ?
      0 :
        windowWidth < 769 ? 
          170 : 590,
  },
  postButton: { 
    height: 45,
    width: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  postButtonText: { 
    fontWeight: 'bold',
    color: 'white',
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  changeImageButton: {
    marginTop: 10,
    backgroundColor: '#70c0b7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeImageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  icon: {
    marginBottom: 8,
  },
  browseButtonText: {
    color: '#525252',
    fontWeight: '500',
  },
});
