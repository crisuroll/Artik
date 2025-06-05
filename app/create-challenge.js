import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import BackButton from '../components/BackButton';
import UploadFile from '../components/UploadFile';
import { useCreateChallenge } from '../hooks/useChallenges';
import CustomTextInput from '../components/CustomTextInput';

export default function CreateChallengePage() {
  const {
    title, setTitle, description, setDescription, imageUrl, setImageUrl,
    posting, handleCreateChallenge
  } = useCreateChallenge();

  const [uploading, setUploading] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      <UploadFile
        onUploadSuccess={setImageUrl}
        bucketName="challenges"
        imageUrl={imageUrl}
        uploading={uploading}
        setUploading={setUploading}
      />

      <CustomTextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <CustomTextInput
        placeholder="Description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <Pressable
        onPress={handleCreateChallenge}
        disabled={posting}
        style={({ pressed }) => [
          styles.postButton,
          posting && styles.postButtonDisabled,
          { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7' }
        ]}
      >
        <Text style={styles.postButtonText}>
          {posting ? "Creando..." : "Create Challenge"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    paddingBottom: 100 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  halfInput: { 
    backgroundColor: '#f2f2f2', 
    padding: 12, 
    borderRadius: 10, 
    flex: 0.48,
    fontFamily: 'Nunito',
  },
  challengeDropdownContainer: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Nunito',
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
    marginTop: 20 
  },
  postButtonText: { 
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Nunito',
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  uploadedImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadedImage: {
    width: 300,
    height: 180,
    borderRadius: 20,
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
    fontFamily: 'Nunito',
  },
});
