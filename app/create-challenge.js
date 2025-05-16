import React from 'react';
import { Image, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import BackButton from '../components/BackButton';
import UploadFile from '../components/UploadFile';
import { useCreateChallenge } from '../hooks/useCreateChallenge';

export default function CreateChallengePage() {
  const {
    title, setTitle, description, setDescription, imageUrl, setImageUrl,
    posting, handleCreateChallenge
  } = useCreateChallenge();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      {!imageUrl ? (
        <UploadFile onUploadSuccess={setImageUrl} bucketName="challenges" />
      ) : (
        <View style={styles.uploadedImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
          <TouchableOpacity onPress={() => setImageUrl(null)} style={styles.changeImageButton}>
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Description"
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.postButton} onPress={handleCreateChallenge} disabled={posting}>
        {posting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.postButtonText}>Create Challenge</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    paddingBottom: 100 
  },
  input: { 
    backgroundColor: '#f2f2f2', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 12 
  },
  textArea: { 
    height: 100 
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
    flex: 0.48 
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
  },
  postButton: { 
    backgroundColor: '#70c0b7', 
    padding: 15, 
    borderRadius: 30, 
    alignItems: 'center', 
    elevation: 3, 
    marginTop: 20 
  },
  postButtonText: { 
    fontWeight: 'bold',
    color: 'white',
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
  },
});
